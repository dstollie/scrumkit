import { NextRequest, NextResponse } from "next/server";
import {
  db,
  retrospectiveSessions,
  retrospectiveItems,
  retrospectiveReports,
  actionItems,
  votes,
} from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import {
  generateRetrospectiveReport,
  ReportConfig,
  RetrospectiveData,
} from "@/lib/ai";

type Params = { params: Promise<{ id: string }> };

// GET /api/retrospective/[id]/report - Get the report for a session
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;

    const [report] = await db
      .select()
      .from(retrospectiveReports)
      .where(eq(retrospectiveReports.sessionId, sessionId));

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// POST /api/retrospective/[id]/report - Generate and save a report
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { generatedBy, config } = body as {
      generatedBy?: string;
      config?: ReportConfig;
    };

    // Get session
    const [session] = await db
      .select()
      .from(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get items with vote counts
    const items = await db
      .select({
        id: retrospectiveItems.id,
        category: retrospectiveItems.category,
        content: retrospectiveItems.content,
        authorName: retrospectiveItems.authorName,
        discussionNotes: retrospectiveItems.discussionNotes,
        voteCount: sql<number>`count(${votes.id})::int`,
      })
      .from(retrospectiveItems)
      .leftJoin(votes, eq(votes.itemId, retrospectiveItems.id))
      .where(eq(retrospectiveItems.sessionId, sessionId))
      .groupBy(retrospectiveItems.id);

    // Get action items
    const actions = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.sessionId, sessionId));

    // Prepare data for AI
    const reportData: RetrospectiveData = {
      sessionName: session.name,
      sprintName: session.sprintName || undefined,
      items: items.map((item) => ({
        category: item.category,
        content: item.content,
        voteCount: item.voteCount,
        discussionNotes: item.discussionNotes || undefined,
        authorName: item.authorName || undefined,
      })),
      actionItems: actions.map((action) => ({
        description: action.description,
        assigneeName: action.assigneeName || undefined,
        priority: action.priority || "medium",
        status: action.status || "open",
      })),
    };

    // Generate report
    const reportConfig: ReportConfig = config || {
      tone: "informal",
      language: "nl",
    };

    const content = await generateRetrospectiveReport(reportData, reportConfig);

    // Save or update report
    const [existingReport] = await db
      .select()
      .from(retrospectiveReports)
      .where(eq(retrospectiveReports.sessionId, sessionId));

    let report;
    if (existingReport) {
      [report] = await db
        .update(retrospectiveReports)
        .set({
          content,
          generatedAt: new Date(),
          generatedBy: generatedBy || null,
        })
        .where(eq(retrospectiveReports.sessionId, sessionId))
        .returning();
    } else {
      [report] = await db
        .insert(retrospectiveReports)
        .values({
          sessionId,
          content,
          generatedBy: generatedBy || null,
        })
        .returning();
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

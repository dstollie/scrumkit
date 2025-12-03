import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveSessions, retrospectiveItems, actionItems, votes } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { generateRetrospectiveReport, type ReportConfig, type RetrospectiveData } from "@/lib/ai";

type RouteParams = { params: Promise<{ id: string }> };

// POST - Generate AI report
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const config: ReportConfig = {
      tone: body.tone || "informal",
      language: body.language || "en",
      focusAreas: body.focusAreas,
      customInstructions: body.customInstructions,
    };

    // Fetch session
    const [session] = await db
      .select()
      .from(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Fetch items with vote counts
    const items = await db
      .select({
        id: retrospectiveItems.id,
        category: retrospectiveItems.category,
        content: retrospectiveItems.content,
        discussionNotes: retrospectiveItems.discussionNotes,
        isDiscussed: retrospectiveItems.isDiscussed,
        voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.item_id = ${retrospectiveItems.id})`.as("vote_count"),
      })
      .from(retrospectiveItems)
      .where(eq(retrospectiveItems.sessionId, sessionId));

    // Fetch action items
    const actions = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.sessionId, sessionId));

    // Prepare data for report generation
    const reportData: RetrospectiveData = {
      sessionName: session.name,
      sprintName: session.sprintName || undefined,
      items: items.map((item) => ({
        category: item.category,
        content: item.content,
        voteCount: Number(item.voteCount),
        discussionNotes: item.discussionNotes || undefined,
        isDiscussed: item.isDiscussed,
      })),
      actionItems: actions.map((action) => ({
        description: action.description,
        assigneeName: action.assigneeName || undefined,
        priority: action.priority,
        status: action.status,
        dueDate: action.dueDate?.toISOString().split("T")[0],
      })),
    };

    // Generate report
    const report = await generateRetrospectiveReport(reportData, config);

    return NextResponse.json({ report, config });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

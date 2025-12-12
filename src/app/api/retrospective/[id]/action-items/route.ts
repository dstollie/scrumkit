import { NextRequest, NextResponse } from "next/server";
import { db, actionItems } from "@/lib/db";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// GET /api/retrospective/[id]/action-items - Get all action items for a session
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;

    const items = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.sessionId, sessionId))
      .orderBy(actionItems.createdAt);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching action items:", error);
    return NextResponse.json(
      { error: "Failed to fetch action items" },
      { status: 500 }
    );
  }
}

// POST /api/retrospective/[id]/action-items - Create a new action item
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const {
      description,
      sourceItemId,
      assigneeId,
      assigneeName,
      priority,
      dueDate,
    } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const [item] = await db
      .insert(actionItems)
      .values({
        sessionId,
        description,
        sourceItemId: sourceItemId || null,
        assigneeId: assigneeId || null,
        assigneeName: assigneeName || null,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating action item:", error);
    return NextResponse.json(
      { error: "Failed to create action item" },
      { status: 500 }
    );
  }
}

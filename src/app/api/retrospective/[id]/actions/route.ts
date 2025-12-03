import { NextRequest, NextResponse } from "next/server";
import { db, actionItems } from "@/lib/db";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// POST - Create new action item
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { description, sourceItemId, assigneeId, assigneeName, priority, dueDate } = body;

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const [action] = await db
      .insert(actionItems)
      .values({
        sessionId,
        description: description.trim(),
        sourceItemId: sourceItemId || null,
        assigneeId: assigneeId || null,
        assigneeName: assigneeName || null,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error("Failed to create action item:", error);
    return NextResponse.json(
      { error: "Failed to create action item" },
      { status: 500 }
    );
  }
}

// GET - List all action items for a retrospective
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;

    const actions = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.sessionId, sessionId))
      .orderBy(actionItems.createdAt);

    return NextResponse.json(actions);
  } catch (error) {
    console.error("Failed to fetch action items:", error);
    return NextResponse.json(
      { error: "Failed to fetch action items" },
      { status: 500 }
    );
  }
}

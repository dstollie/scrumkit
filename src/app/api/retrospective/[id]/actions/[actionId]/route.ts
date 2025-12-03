import { NextRequest, NextResponse } from "next/server";
import { db, actionItems } from "@/lib/db";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string; actionId: string }> };

// PATCH - Update action item
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId, actionId } = await params;
    const body = await request.json();
    const { description, assigneeId, assigneeName, priority, status, dueDate } = body;

    const updateData: Record<string, unknown> = {};

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length === 0) {
        return NextResponse.json(
          { error: "Description cannot be empty" },
          { status: 400 }
        );
      }
      updateData.description = description.trim();
    }

    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (assigneeName !== undefined) updateData.assigneeName = assigneeName || null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const [action] = await db
      .update(actionItems)
      .set(updateData)
      .where(
        and(
          eq(actionItems.id, actionId),
          eq(actionItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!action) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(action);
  } catch (error) {
    console.error("Failed to update action item:", error);
    return NextResponse.json(
      { error: "Failed to update action item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete action item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId, actionId } = await params;

    const [deleted] = await db
      .delete(actionItems)
      .where(
        and(
          eq(actionItems.id, actionId),
          eq(actionItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete action item:", error);
    return NextResponse.json(
      { error: "Failed to delete action item" },
      { status: 500 }
    );
  }
}

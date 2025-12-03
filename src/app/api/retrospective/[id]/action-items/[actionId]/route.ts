import { NextRequest, NextResponse } from "next/server";
import { db, actionItems } from "@/lib/db";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ id: string; actionId: string }> };

// PATCH /api/retrospective/[id]/action-items/[actionId] - Update an action item
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId, actionId } = await params;
    const body = await request.json();
    const { description, assigneeId, assigneeName, priority, status, dueDate } =
      body;

    const updateData: Record<string, unknown> = {};

    if (description !== undefined) updateData.description = description;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (assigneeName !== undefined) updateData.assigneeName = assigneeName;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const [item] = await db
      .update(actionItems)
      .set(updateData)
      .where(
        and(
          eq(actionItems.id, actionId),
          eq(actionItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!item) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating action item:", error);
    return NextResponse.json(
      { error: "Failed to update action item" },
      { status: 500 }
    );
  }
}

// DELETE /api/retrospective/[id]/action-items/[actionId] - Delete an action item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId, actionId } = await params;

    const [item] = await db
      .delete(actionItems)
      .where(
        and(
          eq(actionItems.id, actionId),
          eq(actionItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!item) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting action item:", error);
    return NextResponse.json(
      { error: "Failed to delete action item" },
      { status: 500 }
    );
  }
}

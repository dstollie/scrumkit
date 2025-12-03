import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveItems } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { sessionEmitter } from "@/lib/sse";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

// PATCH - Update retrospective item
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId, itemId } = await params;
    const body = await request.json();
    const { content, discussionNotes, isDiscussed } = body;

    const updateData: Record<string, unknown> = {};

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json(
          { error: "Content cannot be empty" },
          { status: 400 }
        );
      }
      if (content.length > 500) {
        return NextResponse.json(
          { error: "Content must be 500 characters or less" },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    if (discussionNotes !== undefined) {
      updateData.discussionNotes = discussionNotes?.trim() || null;
    }

    if (isDiscussed !== undefined) {
      updateData.isDiscussed = isDiscussed;
    }

    const [item] = await db
      .update(retrospectiveItems)
      .set(updateData)
      .where(
        and(
          eq(retrospectiveItems.id, itemId),
          eq(retrospectiveItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Emit SSE event
    sessionEmitter.emit(sessionId, { type: "item:updated", data: item });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update retrospective item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete retrospective item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId, itemId } = await params;

    const [deleted] = await db
      .delete(retrospectiveItems)
      .where(
        and(
          eq(retrospectiveItems.id, itemId),
          eq(retrospectiveItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Emit SSE event
    sessionEmitter.emit(sessionId, { type: "item:deleted", data: { id: itemId, sessionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete retrospective item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

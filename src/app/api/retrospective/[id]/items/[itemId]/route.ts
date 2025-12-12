import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveItems } from "@/lib/db";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ id: string; itemId: string }> };

// PATCH /api/retrospective/[id]/items/[itemId] - Update an item
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId, itemId } = await params;
    const body = await request.json();
    const { content, discussionNotes, isDiscussed } = body;

    const updateData: Record<string, unknown> = {};

    if (content !== undefined) {
      if (content.length > 500) {
        return NextResponse.json(
          { error: "Content cannot exceed 500 characters" },
          { status: 400 }
        );
      }
      updateData.content = content;
    }
    if (discussionNotes !== undefined) {
      updateData.discussionNotes = discussionNotes;
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
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/retrospective/[id]/items/[itemId] - Delete an item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId, itemId } = await params;

    const [item] = await db
      .delete(retrospectiveItems)
      .where(
        and(
          eq(retrospectiveItems.id, itemId),
          eq(retrospectiveItems.sessionId, sessionId)
        )
      )
      .returning();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

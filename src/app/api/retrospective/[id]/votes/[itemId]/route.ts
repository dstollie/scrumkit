import { NextRequest, NextResponse } from "next/server";
import { db, votes } from "@/lib/db";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ id: string; itemId: string }> };

// DELETE /api/retrospective/[id]/votes/[itemId] - Remove a vote
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { itemId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Find and delete one vote for this user on this item
    const [vote] = await db
      .delete(votes)
      .where(and(eq(votes.itemId, itemId), eq(votes.userId, userId)))
      .returning();

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vote:", error);
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}

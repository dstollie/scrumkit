import { NextRequest, NextResponse } from "next/server";
import { db, votes, retrospectiveSessions } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { sessionEmitter } from "@/lib/sse";

type RouteParams = { params: Promise<{ id: string }> };

// POST - Add vote to an item
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { itemId, oderId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    if (!oderId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get session to check vote limit
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

    // Count user's existing votes in this session
    const [voteCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(votes)
      .innerJoin(
        sql`retrospective_items`,
        sql`retrospective_items.id = votes.item_id`
      )
      .where(
        and(
          eq(votes.oderId, oderId),
          sql`retrospective_items.session_id = ${sessionId}`
        )
      );

    const currentVoteCount = Number(voteCountResult?.count || 0);

    if (currentVoteCount >= session.votesPerUser) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${session.votesPerUser} votes` },
        { status: 400 }
      );
    }

    const [vote] = await db
      .insert(votes)
      .values({
        itemId,
        oderId,
      })
      .returning();

    // Emit SSE event
    sessionEmitter.emit(sessionId, { type: "vote:added", data: { itemId, oderId, sessionId } });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error("Failed to add vote:", error);
    return NextResponse.json(
      { error: "Failed to add vote" },
      { status: 500 }
    );
  }
}

// GET - Get votes for session (for a specific user)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const oderId = searchParams.get("userId");

    if (!oderId) {
      return NextResponse.json(
        { error: "User ID query parameter is required" },
        { status: 400 }
      );
    }

    // Get user's votes for items in this session
    const userVotes = await db
      .select({
        id: votes.id,
        itemId: votes.itemId,
        oderId: votes.oderId,
        createdAt: votes.createdAt,
      })
      .from(votes)
      .innerJoin(
        sql`retrospective_items`,
        sql`retrospective_items.id = votes.item_id`
      )
      .where(
        and(
          eq(votes.oderId, oderId),
          sql`retrospective_items.session_id = ${sessionId}`
        )
      );

    return NextResponse.json(userVotes);
  } catch (error) {
    console.error("Failed to fetch votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

// DELETE - Remove vote from an item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { itemId, oderId } = body;

    if (!itemId || !oderId) {
      return NextResponse.json(
        { error: "Item ID and User ID are required" },
        { status: 400 }
      );
    }

    // Find and delete ONE vote (in case of multiple votes on same item)
    const [deleted] = await db
      .delete(votes)
      .where(
        and(
          eq(votes.itemId, itemId),
          eq(votes.oderId, oderId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Vote not found" },
        { status: 404 }
      );
    }

    // Emit SSE event
    sessionEmitter.emit(sessionId, { type: "vote:removed", data: { itemId, oderId, sessionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove vote:", error);
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    );
  }
}

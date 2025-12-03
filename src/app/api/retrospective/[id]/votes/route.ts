import { NextRequest, NextResponse } from "next/server";
import { db, votes, retrospectiveSessions } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// GET /api/retrospective/[id]/votes - Get all votes for a session
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;

    // Get the session to check vote visibility settings
    const [session] = await db
      .select()
      .from(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get votes grouped by item
    const voteResults = await db
      .select({
        itemId: votes.itemId,
        userId: votes.userId,
      })
      .from(votes)
      .innerJoin(
        sql`retrospective_items`,
        sql`retrospective_items.id = ${votes.itemId} AND retrospective_items.session_id = ${sessionId}`
      );

    // Group votes by itemId
    const votesByItem: Record<string, string[]> = {};
    for (const vote of voteResults) {
      if (!votesByItem[vote.itemId]) {
        votesByItem[vote.itemId] = [];
      }
      votesByItem[vote.itemId].push(vote.userId);
    }

    return NextResponse.json(votesByItem);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

// POST /api/retrospective/[id]/votes - Add a vote
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { itemId, userId } = body;

    if (!itemId || !userId) {
      return NextResponse.json(
        { error: "itemId and userId are required" },
        { status: 400 }
      );
    }

    // Get the session to check vote limits
    const [session] = await db
      .select()
      .from(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Count user's current votes in this session
    const userVoteCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(votes)
      .innerJoin(
        sql`retrospective_items`,
        sql`retrospective_items.id = ${votes.itemId} AND retrospective_items.session_id = ${sessionId}`
      )
      .where(eq(votes.userId, userId));

    const currentVotes = userVoteCount[0]?.count || 0;
    const maxVotes = session.votesPerUser || 5;

    if (currentVotes >= maxVotes) {
      return NextResponse.json(
        { error: `Maximum votes (${maxVotes}) reached` },
        { status: 400 }
      );
    }

    const [vote] = await db
      .insert(votes)
      .values({
        itemId,
        userId,
      })
      .returning();

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json(
      { error: "Failed to create vote" },
      { status: 500 }
    );
  }
}

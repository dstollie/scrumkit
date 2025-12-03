import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveItems } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { sessionEmitter } from "@/lib/sse";

type RouteParams = { params: Promise<{ id: string }> };

// POST - Add new item to retrospective
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { category, content, authorId, authorName, isAnonymous } = body;

    if (!category || !["went_well", "to_improve", "action_item"].includes(category)) {
      return NextResponse.json(
        { error: "Valid category is required (went_well, to_improve, action_item)" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Content must be 500 characters or less" },
        { status: 400 }
      );
    }

    const [item] = await db
      .insert(retrospectiveItems)
      .values({
        sessionId,
        category,
        content: content.trim(),
        authorId: authorId || null,
        authorName: isAnonymous ? null : (authorName || null),
        isAnonymous: isAnonymous || false,
      })
      .returning();

    // Emit SSE event
    sessionEmitter.emit(sessionId, { type: "item:added", data: item });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create retrospective item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

// GET - List all items for a retrospective with vote counts
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;

    const items = await db
      .select({
        id: retrospectiveItems.id,
        sessionId: retrospectiveItems.sessionId,
        category: retrospectiveItems.category,
        content: retrospectiveItems.content,
        authorId: retrospectiveItems.authorId,
        authorName: retrospectiveItems.authorName,
        isAnonymous: retrospectiveItems.isAnonymous,
        discussionNotes: retrospectiveItems.discussionNotes,
        isDiscussed: retrospectiveItems.isDiscussed,
        createdAt: retrospectiveItems.createdAt,
        voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.item_id = ${retrospectiveItems.id})`.as("vote_count"),
      })
      .from(retrospectiveItems)
      .where(eq(retrospectiveItems.sessionId, sessionId))
      .orderBy(retrospectiveItems.createdAt);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch retrospective items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

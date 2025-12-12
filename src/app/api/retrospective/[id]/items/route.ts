import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveItems, votes } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// GET /api/retrospective/[id]/items - Get all items for a session
export async function GET(request: NextRequest, { params }: Params) {
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
        voteCount: sql<number>`count(${votes.id})::int`,
      })
      .from(retrospectiveItems)
      .leftJoin(votes, eq(votes.itemId, retrospectiveItems.id))
      .where(eq(retrospectiveItems.sessionId, sessionId))
      .groupBy(retrospectiveItems.id)
      .orderBy(sql`count(${votes.id}) desc`, retrospectiveItems.createdAt);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/retrospective/[id]/items - Add a new item
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { category, content, authorId, authorName, isAnonymous } = body;

    if (!category || !content) {
      return NextResponse.json(
        { error: "Category and content are required" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Content cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    const [item] = await db
      .insert(retrospectiveItems)
      .values({
        sessionId,
        category,
        content,
        authorId: authorId || null,
        authorName: isAnonymous ? null : authorName || null,
        isAnonymous: isAnonymous ?? false,
      })
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

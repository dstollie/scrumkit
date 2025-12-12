import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveSessions } from "@/lib/db";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// GET /api/retrospective/[id] - Get a single session
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [session] = await db
      .select()
      .from(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, id));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH /api/retrospective/[id] - Update a session
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, votesPerUser, hideVotesUntilComplete } = body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (votesPerUser !== undefined) {
      updateData.votesPerUser = votesPerUser;
    }
    if (hideVotesUntilComplete !== undefined) {
      updateData.hideVotesUntilComplete = hideVotesUntilComplete;
    }

    const [session] = await db
      .update(retrospectiveSessions)
      .set(updateData)
      .where(eq(retrospectiveSessions.id, id))
      .returning();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE /api/retrospective/[id] - Delete a session
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [session] = await db
      .delete(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, id))
      .returning();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

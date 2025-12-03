import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveSessions } from "@/lib/db";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// GET - Fetch single retrospective session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [session] = await db
      .select()
      .from(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, id))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to fetch retrospective session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH - Update retrospective session
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, sprintName, teamId, status, votesPerUser, hideVotesUntilComplete } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (sprintName !== undefined) updateData.sprintName = sprintName?.trim() || null;
    if (teamId !== undefined) updateData.teamId = teamId?.trim() || null;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (votesPerUser !== undefined) updateData.votesPerUser = votesPerUser;
    if (hideVotesUntilComplete !== undefined) updateData.hideVotesUntilComplete = hideVotesUntilComplete;

    const [session] = await db
      .update(retrospectiveSessions)
      .set(updateData)
      .where(eq(retrospectiveSessions.id, id))
      .returning();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to update retrospective session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete retrospective session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(retrospectiveSessions)
      .where(eq(retrospectiveSessions.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete retrospective session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

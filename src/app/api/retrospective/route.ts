import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveSessions } from "@/lib/db";
import { eq } from "drizzle-orm";

// POST - Create new retrospective session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sprintName, teamId, votesPerUser, hideVotesUntilComplete } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Session name is required" },
        { status: 400 }
      );
    }

    const [session] = await db
      .insert(retrospectiveSessions)
      .values({
        name: name.trim(),
        sprintName: sprintName?.trim() || null,
        teamId: teamId?.trim() || null,
        votesPerUser: votesPerUser || 5,
        hideVotesUntilComplete: hideVotesUntilComplete || false,
      })
      .returning();

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Failed to create retrospective session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// GET - List all retrospective sessions
export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(retrospectiveSessions)
      .orderBy(retrospectiveSessions.createdAt);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch retrospective sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

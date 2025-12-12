import { NextRequest, NextResponse } from "next/server";
import { db, retrospectiveSessions } from "@/lib/db";

// POST /api/retrospective - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sprintName, teamId, votesPerUser, hideVotesUntilComplete } =
      body;

    if (!name) {
      return NextResponse.json(
        { error: "Session name is required" },
        { status: 400 }
      );
    }

    const [session] = await db
      .insert(retrospectiveSessions)
      .values({
        name,
        sprintName: sprintName || null,
        teamId: teamId || null,
        votesPerUser: votesPerUser ?? 5,
        hideVotesUntilComplete: hideVotesUntilComplete ?? false,
      })
      .returning();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareableLink = `${appUrl}/retrospective/${session.id}`;

    return NextResponse.json({
      ...session,
      shareableLink,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// GET /api/retrospective - List all sessions (optional)
export async function GET() {
  try {
    const sessions = await db.select().from(retrospectiveSessions);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

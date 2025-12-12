import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // Get the current user's info from the request
  // For now, we'll use a simple approach with name from body
  // In a real app, you'd get this from your auth system
  const body = await request.json();
  const { room, userId, userInfo } = body;

  if (!room || !userId) {
    return NextResponse.json(
      { error: "Missing room or userId" },
      { status: 400 }
    );
  }

  // Generate a random color for the user
  const colors = [
    "#E57373",
    "#F06292",
    "#BA68C8",
    "#9575CD",
    "#7986CB",
    "#64B5F6",
    "#4FC3F7",
    "#4DD0E1",
    "#4DB6AC",
    "#81C784",
    "#AED581",
    "#DCE775",
    "#FFD54F",
    "#FFB74D",
    "#FF8A65",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Create a session for the current user
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: userInfo?.name || "Anoniem",
      color: userInfo?.color || randomColor,
    },
  });

  // Give the user access to the room
  session.allow(room, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body: authBody } = await session.authorize();

  return new NextResponse(authBody, { status });
}

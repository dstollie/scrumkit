"use client";

import { useSyncExternalStore } from "react";
import { RetrospectiveRoomProvider } from "@/lib/liveblocks";
import { RetrospectiveBoard } from "@/components/features/retrospective/board";
import { JoinSessionDialog } from "@/components/features/retrospective/join-session-dialog";
import type { RetrospectiveSession } from "@/lib/db";

type Props = {
  session: RetrospectiveSession;
};

function getSnapshot() {
  const userInfo = localStorage.getItem("scrumkit-user");
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.id && parsed.name) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function RetrospectiveClient({ session }: Props) {
  const isJoined = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleJoin = (name: string) => {
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(
      "scrumkit-user",
      JSON.stringify({
        id: userId,
        name: name.trim(),
      })
    );
    // Trigger storage event manually for current tab
    window.dispatchEvent(new Event("storage"));
  };

  if (!isJoined) {
    return <JoinSessionDialog session={session} onJoin={handleJoin} />;
  }

  return (
    <RetrospectiveRoomProvider roomId={`retrospective-${session.id}`}>
      <RetrospectiveBoard session={session} />
    </RetrospectiveRoomProvider>
  );
}

"use client";

import { ReactNode } from "react";
import { RoomProvider, Storage } from "./config";
import { ClientSideSuspense } from "@liveblocks/react";

type Props = {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
};

const initialStorage: Storage = {
  items: [],
  votes: {},
  phase: "input",
  report: {
    content: null,
    isGenerating: false,
    generatedAt: null,
  },
};

export function RetrospectiveRoomProvider({
  roomId,
  children,
  fallback,
}: Props) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        name: "",
        isTyping: false,
        currentTab: "board",
      }}
      initialStorage={initialStorage}
    >
      <ClientSideSuspense fallback={fallback ?? <LoadingFallback />}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">
        Verbinden met sessie...
      </div>
    </div>
  );
}

"use client";

import { createClient } from "@liveblocks/client";
import { createRoomContext, createLiveblocksContext } from "@liveblocks/react";

// We'll use a custom auth endpoint that receives user info
const client = createClient({
  authEndpoint: async (room) => {
    // Get user info from localStorage (set when joining a session)
    const userInfo = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("scrumkit-user") || '{"id":"","name":"Anoniem"}')
      : { id: "", name: "Anoniem" };

    const response = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        userId: userInfo.id || `user-${Math.random().toString(36).substr(2, 9)}`,
        userInfo: {
          name: userInfo.name || "Anoniem",
        },
      }),
    });

    return response.json();
  },
});

// Presence type - what each user broadcasts to others
export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  isTyping: boolean;
  currentTab: "board" | "voting" | "discussion" | "report";
};

// Storage types - shared state synced across all users
export type RetrospectiveItemStorage = {
  id: string;
  category: "went_well" | "to_improve" | "action_item";
  content: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
};

export type VoteStorage = {
  itemId: string;
  usersVoted: string[];
};

export type ReportStorage = {
  content: string | null;
  isGenerating: boolean;
  generatedAt: string | null;
};

export type Storage = {
  items: RetrospectiveItemStorage[];
  votes: Record<string, string[]>; // itemId -> array of userIds
  phase: "input" | "voting" | "discussion" | "completed";
  report: ReportStorage;
};

// User metadata
export type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
  };
};

// Room event types for broadcasts
export type RoomEvent =
  | { type: "ITEM_ADDED"; itemId: string }
  | { type: "VOTE_CAST"; itemId: string; userId: string }
  | { type: "PHASE_CHANGED"; phase: Storage["phase"] }
  | { type: "REPORT_GENERATED" }
  | { type: "REPORT_GENERATING" };

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useStatus,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

export const {
  LiveblocksProvider,
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} = createLiveblocksContext(client);

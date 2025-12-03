// SSE Event Types for Retrospective

export type SSEEventType =
  | 'item:added'
  | 'item:updated'
  | 'item:deleted'
  | 'vote:added'
  | 'vote:removed'
  | 'session:updated'
  | 'action:added'
  | 'action:updated'
  | 'action:deleted'
  | 'connected';

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}

export interface ItemAddedEvent {
  id: string;
  sessionId: string;
  category: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

export interface ItemDeletedEvent {
  id: string;
  sessionId: string;
}

export interface VoteEvent {
  itemId: string;
  oderId: string;
  sessionId: string;
}

export interface SessionUpdatedEvent {
  id: string;
  status: string;
}

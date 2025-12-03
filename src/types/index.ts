// Type definitions for Scrumkit

export type SessionStatus = 'input' | 'voting' | 'discussion' | 'completed';
export type Category = 'went_well' | 'to_improve' | 'action_item';
export type Priority = 'low' | 'medium' | 'high';
export type ActionStatus = 'open' | 'in_progress' | 'done';

export interface RetrospectiveSession {
  id: string;
  name: string;
  sprintName?: string;
  teamId?: string;
  status: SessionStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface RetrospectiveItem {
  id: string;
  sessionId: string;
  category: Category;
  content: string;
  authorId?: string;
  isAnonymous: boolean;
  discussionNotes?: string;
  isDiscussed: boolean;
  createdAt: Date;
  voteCount?: number;
}

export interface Vote {
  id: string;
  itemId: string;
  oderId: string;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  sessionId: string;
  sourceItemId?: string;
  description: string;
  assigneeId?: string;
  priority: Priority;
  status: ActionStatus;
  dueDate?: Date;
  createdAt: Date;
}

// Liveblocks types
export interface Presence {
  cursor: { x: number; y: number } | null;
  name: string;
  isTyping: boolean;
}

export interface UserMeta {
  id: string;
  info: {
    name: string;
    avatar?: string;
  };
}

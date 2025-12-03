import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';

// Enums
export const sessionStatusEnum = pgEnum('session_status', ['input', 'voting', 'discussion', 'completed']);
export const categoryEnum = pgEnum('category', ['went_well', 'to_improve', 'action_item']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
export const actionStatusEnum = pgEnum('action_status', ['open', 'in_progress', 'done']);

// Retrospective Sessions Table
export const retrospectiveSessions = pgTable('retrospective_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sprintName: varchar('sprint_name', { length: 255 }),
  teamId: varchar('team_id', { length: 255 }),
  status: sessionStatusEnum('status').default('input').notNull(),
  votesPerUser: integer('votes_per_user').default(5).notNull(),
  hideVotesUntilComplete: boolean('hide_votes_until_complete').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Retrospective Items Table
export const retrospectiveItems = pgTable('retrospective_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id, { onDelete: 'cascade' }).notNull(),
  category: categoryEnum('category').notNull(),
  content: text('content').notNull(),
  authorId: varchar('author_id', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  discussionNotes: text('discussion_notes'),
  isDiscussed: boolean('is_discussed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Votes Table
export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').references(() => retrospectiveItems.id, { onDelete: 'cascade' }).notNull(),
  oderId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Action Items Table
export const actionItems = pgTable('action_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id, { onDelete: 'cascade' }).notNull(),
  sourceItemId: uuid('source_item_id').references(() => retrospectiveItems.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  assigneeId: varchar('assignee_id', { length: 255 }),
  assigneeName: varchar('assignee_name', { length: 255 }),
  priority: priorityEnum('priority').default('medium').notNull(),
  status: actionStatusEnum('status').default('open').notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports for use in application
export type RetrospectiveSession = typeof retrospectiveSessions.$inferSelect;
export type NewRetrospectiveSession = typeof retrospectiveSessions.$inferInsert;

export type RetrospectiveItem = typeof retrospectiveItems.$inferSelect;
export type NewRetrospectiveItem = typeof retrospectiveItems.$inferInsert;

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;

export type ActionItem = typeof actionItems.$inferSelect;
export type NewActionItem = typeof actionItems.$inferInsert;

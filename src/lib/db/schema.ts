import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const sessionStatusEnum = pgEnum("session_status", [
  "input",
  "voting",
  "discussion",
  "completed",
]);

export const categoryEnum = pgEnum("category", [
  "went_well",
  "to_improve",
  "action_item",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const actionStatusEnum = pgEnum("action_status", [
  "open",
  "in_progress",
  "done",
]);

// Tables
export const retrospectiveSessions = pgTable("retrospective_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  sprintName: varchar("sprint_name", { length: 255 }),
  teamId: varchar("team_id", { length: 255 }),
  status: sessionStatusEnum("status").default("input"),
  votesPerUser: integer("votes_per_user").default(5),
  hideVotesUntilComplete: boolean("hide_votes_until_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const retrospectiveItems = pgTable("retrospective_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => retrospectiveSessions.id, { onDelete: "cascade" })
    .notNull(),
  category: categoryEnum("category").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 255 }),
  authorName: varchar("author_name", { length: 255 }),
  isAnonymous: boolean("is_anonymous").default(false),
  discussionNotes: text("discussion_notes"),
  isDiscussed: boolean("is_discussed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .references(() => retrospectiveItems.id, { onDelete: "cascade" })
    .notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => retrospectiveSessions.id, { onDelete: "cascade" })
    .notNull(),
  sourceItemId: uuid("source_item_id").references(
    () => retrospectiveItems.id,
    { onDelete: "set null" }
  ),
  description: text("description").notNull(),
  assigneeId: varchar("assignee_id", { length: 255 }),
  assigneeName: varchar("assignee_name", { length: 255 }),
  priority: priorityEnum("priority").default("medium"),
  status: actionStatusEnum("status").default("open"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const retrospectiveReports = pgTable("retrospective_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => retrospectiveSessions.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  generatedBy: varchar("generated_by", { length: 255 }),
});

// Relations
export const retrospectiveSessionsRelations = relations(
  retrospectiveSessions,
  ({ many, one }) => ({
    items: many(retrospectiveItems),
    actionItems: many(actionItems),
    report: one(retrospectiveReports),
  })
);

export const retrospectiveItemsRelations = relations(
  retrospectiveItems,
  ({ one, many }) => ({
    session: one(retrospectiveSessions, {
      fields: [retrospectiveItems.sessionId],
      references: [retrospectiveSessions.id],
    }),
    votes: many(votes),
    actionItems: many(actionItems),
  })
);

export const votesRelations = relations(votes, ({ one }) => ({
  item: one(retrospectiveItems, {
    fields: [votes.itemId],
    references: [retrospectiveItems.id],
  }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  session: one(retrospectiveSessions, {
    fields: [actionItems.sessionId],
    references: [retrospectiveSessions.id],
  }),
  sourceItem: one(retrospectiveItems, {
    fields: [actionItems.sourceItemId],
    references: [retrospectiveItems.id],
  }),
}));

export const retrospectiveReportsRelations = relations(
  retrospectiveReports,
  ({ one }) => ({
    session: one(retrospectiveSessions, {
      fields: [retrospectiveReports.sessionId],
      references: [retrospectiveSessions.id],
    }),
  })
);

// Types
export type RetrospectiveSession = typeof retrospectiveSessions.$inferSelect;
export type NewRetrospectiveSession = typeof retrospectiveSessions.$inferInsert;

export type RetrospectiveItem = typeof retrospectiveItems.$inferSelect;
export type NewRetrospectiveItem = typeof retrospectiveItems.$inferInsert;

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;

export type ActionItem = typeof actionItems.$inferSelect;
export type NewActionItem = typeof actionItems.$inferInsert;

export type RetrospectiveReport = typeof retrospectiveReports.$inferSelect;
export type NewRetrospectiveReport = typeof retrospectiveReports.$inferInsert;

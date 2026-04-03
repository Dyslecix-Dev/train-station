import { sql } from "drizzle-orm";
import { check, date, index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { userProfiles } from "@/lib/db/schema/user-profiles";

export const ALLOWED_EMOTIONS = ["anxious", "stressed", "calm", "energized", "motivated", "tired", "irritable", "happy", "sad", "neutral"] as const;

export const moodLogs = pgTable(
  "mood_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    moodScore: integer("mood_score").notNull(),
    emotions: text("emotions").array().notNull(),
    journalEntry: text("journal_entry"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.date), index("mood_logs_user_id_date_idx").on(t.userId, t.date), check("mood_score_range", sql`${t.moodScore} >= 1 AND ${t.moodScore} <= 5`)],
);

export type MoodLog = typeof moodLogs.$inferSelect;
export type NewMoodLog = typeof moodLogs.$inferInsert;

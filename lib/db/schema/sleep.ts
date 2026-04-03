import { sql } from "drizzle-orm";
import { check, date, index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { userProfiles } from "@/lib/db/schema/user-profiles";

export const sleepLogs = pgTable(
  "sleep_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    bedtime: timestamp("bedtime", { withTimezone: true }).notNull(),
    wakeTime: timestamp("wake_time", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    quality: integer("quality").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.userId, t.date),
    index("sleep_logs_user_id_date_idx").on(t.userId, t.date),
    check("quality_range", sql`${t.quality} >= 1 AND ${t.quality} <= 5`),
    check("wake_after_bedtime", sql`${t.wakeTime} > ${t.bedtime}`),
  ],
);

export type SleepLog = typeof sleepLogs.$inferSelect;
export type NewSleepLog = typeof sleepLogs.$inferInsert;

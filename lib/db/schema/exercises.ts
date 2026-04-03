import { boolean, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { userProfiles } from "@/lib/db/schema/user-profiles";

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category", { enum: ["strength", "cardio", "bodyweight", "flexibility", "other"] }).notNull(),
    muscleGroups: text("muscle_groups").array(),
    progressMetricType: text("progress_metric_type", {
      enum: ["estimated_1rm", "best_pace", "max_reps", "max_duration", "hold_duration"],
    }).notNull(),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    isSystem: boolean("is_system").notNull().default(false),
    createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [unique().on(t.name, t.createdBy), index("exercises_created_by_idx").on(t.createdBy), index("exercises_category_idx").on(t.category)],
);

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

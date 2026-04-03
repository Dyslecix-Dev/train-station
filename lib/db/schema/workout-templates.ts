import { index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { exercises } from "@/lib/db/schema/exercises";
import { userProfiles } from "@/lib/db/schema/user-profiles";

export const workoutTemplates = pgTable(
  "workout_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workout_templates_user_id_idx").on(t.userId)],
);

export const workoutTemplateExercises = pgTable(
  "workout_template_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    section: text("section", { enum: ["warm_up", "main", "cooldown"] }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    defaultSets: integer("default_sets"),
    defaultRestSeconds: integer("default_rest_seconds"),
    restBetweenExercisesSeconds: integer("rest_between_exercises_seconds"),
    notes: text("notes"),
  },
  (t) => [unique().on(t.templateId, t.sortOrder)],
);

export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;
export type WorkoutTemplateExercise = typeof workoutTemplateExercises.$inferSelect;
export type NewWorkoutTemplateExercise = typeof workoutTemplateExercises.$inferInsert;

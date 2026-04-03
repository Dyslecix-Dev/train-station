import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, numeric, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { exercises } from "@/lib/db/schema/exercises";
import { userProfiles } from "@/lib/db/schema/user-profiles";
import { workoutTemplates } from "@/lib/db/schema/workout-templates";

export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
    templateSnapshot: jsonb("template_snapshot"),
    name: text("name").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    status: text("status", { enum: ["in_progress", "completed", "cancelled"] })
      .notNull()
      .default("in_progress"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workouts_user_id_idx").on(t.userId), index("workouts_started_at_idx").on(t.startedAt)],
);

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    section: text("section", { enum: ["warm_up", "main", "cooldown"] }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    restBetweenExercisesSeconds: integer("rest_between_exercises_seconds"),
    notes: text("notes"),
  },
  (t) => [unique().on(t.workoutId, t.sortOrder)],
);

export const workoutSets = pgTable(
  "workout_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workoutExerciseId: uuid("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    isWarmupSet: boolean("is_warmup_set").notNull().default(false),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }),
    reps: integer("reps"),
    durationSeconds: integer("duration_seconds"),
    distanceKm: numeric("distance_km", { precision: 8, scale: 3 }),
    rpe: integer("rpe"),
    rir: integer("rir"),
    restSeconds: integer("rest_seconds"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.workoutExerciseId, t.setNumber),
    index("workout_sets_workout_exercise_id_idx").on(t.workoutExerciseId),
    check("rpe_range", sql`${t.rpe} IS NULL OR (${t.rpe} >= 1 AND ${t.rpe} <= 10)`),
    check("rir_range", sql`${t.rir} IS NULL OR (${t.rir} >= 0 AND ${t.rir} <= 5)`),
  ],
);

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type NewWorkoutSet = typeof workoutSets.$inferInsert;

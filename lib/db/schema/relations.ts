import { relations } from "drizzle-orm";

import { exercises } from "@/lib/db/schema/exercises";
import { moodLogs } from "@/lib/db/schema/mental-health";
import { bodyStatsLogs, foods, mealLogs, waterLogs } from "@/lib/db/schema/nutrition";
import { sleepLogs } from "@/lib/db/schema/sleep";
import { userProfiles } from "@/lib/db/schema/user-profiles";
import { workoutTemplateExercises, workoutTemplates } from "@/lib/db/schema/workout-templates";
import { workoutExercises, workouts, workoutSets } from "@/lib/db/schema/workouts";

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  exercises: many(exercises),
  workoutTemplates: many(workoutTemplates),
  workouts: many(workouts),
  foods: many(foods),
  mealLogs: many(mealLogs),
  waterLogs: many(waterLogs),
  bodyStatsLogs: many(bodyStatsLogs),
  sleepLogs: many(sleepLogs),
  moodLogs: many(moodLogs),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  createdBy: one(userProfiles, { fields: [exercises.createdBy], references: [userProfiles.id] }),
  workoutTemplateExercises: many(workoutTemplateExercises),
  workoutExercises: many(workoutExercises),
}));

export const workoutTemplatesRelations = relations(workoutTemplates, ({ one, many }) => ({
  user: one(userProfiles, { fields: [workoutTemplates.userId], references: [userProfiles.id] }),
  workoutTemplateExercises: many(workoutTemplateExercises),
}));

export const workoutTemplateExercisesRelations = relations(workoutTemplateExercises, ({ one }) => ({
  template: one(workoutTemplates, { fields: [workoutTemplateExercises.templateId], references: [workoutTemplates.id] }),
  exercise: one(exercises, { fields: [workoutTemplateExercises.exerciseId], references: [exercises.id] }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(userProfiles, { fields: [workouts.userId], references: [userProfiles.id] }),
  template: one(workoutTemplates, { fields: [workouts.templateId], references: [workoutTemplates.id] }),
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  workoutSets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workoutExercise: one(workoutExercises, { fields: [workoutSets.workoutExerciseId], references: [workoutExercises.id] }),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
  createdBy: one(userProfiles, { fields: [foods.createdBy], references: [userProfiles.id] }),
  mealLogs: many(mealLogs),
}));

export const mealLogsRelations = relations(mealLogs, ({ one }) => ({
  user: one(userProfiles, { fields: [mealLogs.userId], references: [userProfiles.id] }),
  food: one(foods, { fields: [mealLogs.foodId], references: [foods.id] }),
}));

export const waterLogsRelations = relations(waterLogs, ({ one }) => ({
  user: one(userProfiles, { fields: [waterLogs.userId], references: [userProfiles.id] }),
}));

export const bodyStatsLogsRelations = relations(bodyStatsLogs, ({ one }) => ({
  user: one(userProfiles, { fields: [bodyStatsLogs.userId], references: [userProfiles.id] }),
}));

export const sleepLogsRelations = relations(sleepLogs, ({ one }) => ({
  user: one(userProfiles, { fields: [sleepLogs.userId], references: [userProfiles.id] }),
}));

export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
  user: one(userProfiles, { fields: [moodLogs.userId], references: [userProfiles.id] }),
}));

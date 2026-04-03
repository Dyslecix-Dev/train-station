import { boolean, date, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  displayName: text("display_name"),
  age: integer("age"),
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
  weightKg: numeric("weight_kg", { precision: 5, scale: 1 }),
  sex: text("sex", { enum: ["male", "female", "other", "prefer_not_to_say"] }),
  activityLevel: text("activity_level", {
    enum: ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
  }),
  primaryGoal: text("primary_goal", {
    enum: ["lose_fat", "build_muscle", "maintain", "improve_endurance", "general_health"],
  }),
  unitsPreference: text("units_preference", { enum: ["imperial", "metric"] })
    .notNull()
    .default("imperial"),
  timezone: text("timezone").notNull().default("America/New_York"),
  calorieTarget: integer("calorie_target"),
  proteinTargetG: integer("protein_target_g"),
  carbsTargetG: integer("carbs_target_g"),
  fatTargetG: integer("fat_target_g"),
  fiberTargetG: integer("fiber_target_g"),
  waterTargetMl: integer("water_target_ml").notNull().default(2000),
  currentStreak: integer("current_streak").notNull().default(0),
  lastStreakDate: date("last_streak_date"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

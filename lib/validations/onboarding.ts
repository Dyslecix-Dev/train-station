import { z } from "zod/v4";

export const basicStatsSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name must be 100 characters or fewer"),
  age: z.coerce.number().int().min(13, "Must be at least 13 years old").max(120, "Must be 120 years or younger"),
  // Stored in cm after conversion; 50–300 cm
  heightCm: z.coerce.number().min(50, "Height must be at least 50 cm").max(300, "Height must be at most 300 cm"),
  // Stored in kg after conversion; 20–500 kg
  weightKg: z.coerce.number().min(20, "Weight must be at least 20 kg").max(500, "Weight must be at most 500 kg"),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    error: "Please select a biological sex",
  }),
  unitsPreference: z.enum(["imperial", "metric"]),
});

export type BasicStatsValues = z.infer<typeof basicStatsSchema>;

export const activityLevels = ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"] as const;
export type ActivityLevel = (typeof activityLevels)[number];

export const activityLevelSchema = z.object({
  activityLevel: z.enum(activityLevels, { error: "Please select an activity level" }),
});

export type ActivityLevelValues = z.infer<typeof activityLevelSchema>;

export const primaryGoals = ["lose_fat", "build_muscle", "maintain", "improve_endurance", "general_health"] as const;
export type PrimaryGoal = (typeof primaryGoals)[number];

export const primaryGoalSchema = z.object({
  primaryGoal: z.enum(primaryGoals, { error: "Please select a primary goal" }),
});

export type PrimaryGoalValues = z.infer<typeof primaryGoalSchema>;

export const completeOnboardingSchema = z.object({
  ...basicStatsSchema.shape,
  ...activityLevelSchema.shape,
  ...primaryGoalSchema.shape,
  timezone: z.string().min(1, "Timezone is required"),
  calorieTarget: z.coerce.number().int().min(1200).max(6000),
  proteinTargetG: z.coerce.number().int().min(40).max(400),
  carbsTargetG: z.coerce.number().int().min(50).max(800),
  fatTargetG: z.coerce.number().int().min(20).max(300),
  fiberTargetG: z.coerce.number().int().min(10).max(100),
});

export type CompleteOnboardingValues = z.infer<typeof completeOnboardingSchema>;

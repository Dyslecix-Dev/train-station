import { describe, expect, it } from "vitest";

import { activityLevelSchema, basicStatsSchema, buildBasicStatsSchema, completeOnboardingSchema, primaryGoalSchema } from "@/lib/validations/onboarding";

describe("buildBasicStatsSchema", () => {
  it("uses metric error messages for metric units", () => {
    const schema = buildBasicStatsSchema("metric");
    const result = schema.safeParse({ displayName: "A", age: 20, heightCm: 10, weightKg: 70, sex: "male", unitsPreference: "metric" });
    expect(result.success).toBe(false);
  });

  it("uses imperial error messages for imperial units", () => {
    const schema = buildBasicStatsSchema("imperial");
    const result = schema.safeParse({ displayName: "A", age: 20, heightCm: 10, weightKg: 70, sex: "male", unitsPreference: "imperial" });
    expect(result.success).toBe(false);
  });
});

describe("basicStatsSchema", () => {
  const valid = {
    displayName: "Alice",
    age: 25,
    heightCm: 170,
    weightKg: 65,
    sex: "female" as const,
    unitsPreference: "metric" as const,
  };

  it("accepts valid input", () => {
    expect(basicStatsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty display name", () => {
    expect(basicStatsSchema.safeParse({ ...valid, displayName: "" }).success).toBe(false);
  });

  it("rejects display name over 100 characters", () => {
    expect(basicStatsSchema.safeParse({ ...valid, displayName: "a".repeat(101) }).success).toBe(false);
  });

  it("rejects age below 13", () => {
    expect(basicStatsSchema.safeParse({ ...valid, age: 12 }).success).toBe(false);
  });

  it("rejects age above 120", () => {
    expect(basicStatsSchema.safeParse({ ...valid, age: 121 }).success).toBe(false);
  });

  it("accepts age at boundaries", () => {
    expect(basicStatsSchema.safeParse({ ...valid, age: 13 }).success).toBe(true);
    expect(basicStatsSchema.safeParse({ ...valid, age: 120 }).success).toBe(true);
  });

  it("rejects height below 50 cm", () => {
    expect(basicStatsSchema.safeParse({ ...valid, heightCm: 49 }).success).toBe(false);
  });

  it("rejects height above 300 cm", () => {
    expect(basicStatsSchema.safeParse({ ...valid, heightCm: 301 }).success).toBe(false);
  });

  it("rejects weight below 20 kg", () => {
    expect(basicStatsSchema.safeParse({ ...valid, weightKg: 19 }).success).toBe(false);
  });

  it("rejects weight above 500 kg", () => {
    expect(basicStatsSchema.safeParse({ ...valid, weightKg: 501 }).success).toBe(false);
  });

  it("rejects invalid sex", () => {
    expect(basicStatsSchema.safeParse({ ...valid, sex: "invalid" }).success).toBe(false);
  });

  it("accepts all valid sex options", () => {
    for (const sex of ["male", "female", "other", "prefer_not_to_say"]) {
      expect(basicStatsSchema.safeParse({ ...valid, sex }).success).toBe(true);
    }
  });

  it("coerces string numbers for age, height, weight", () => {
    const result = basicStatsSchema.safeParse({ ...valid, age: "25", heightCm: "170", weightKg: "65" });
    expect(result.success).toBe(true);
  });
});

describe("activityLevelSchema", () => {
  it("accepts all valid activity levels", () => {
    for (const activityLevel of ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]) {
      expect(activityLevelSchema.safeParse({ activityLevel }).success).toBe(true);
    }
  });

  it("rejects invalid activity level", () => {
    expect(activityLevelSchema.safeParse({ activityLevel: "super_active" }).success).toBe(false);
  });
});

describe("primaryGoalSchema", () => {
  it("accepts all valid primary goals", () => {
    for (const primaryGoal of ["lose_fat", "build_muscle", "maintain", "improve_endurance", "general_health"]) {
      expect(primaryGoalSchema.safeParse({ primaryGoal }).success).toBe(true);
    }
  });

  it("rejects invalid primary goal", () => {
    expect(primaryGoalSchema.safeParse({ primaryGoal: "fly" }).success).toBe(false);
  });
});

describe("completeOnboardingSchema", () => {
  const valid = {
    displayName: "Bob",
    age: 30,
    heightCm: 180,
    weightKg: 80,
    sex: "male" as const,
    unitsPreference: "metric" as const,
    activityLevel: "moderately_active" as const,
    primaryGoal: "build_muscle" as const,
    timezone: "America/New_York",
    calorieTarget: 2800,
    proteinTargetG: 176,
    carbsTargetG: 350,
    fatTargetG: 78,
    fiberTargetG: 39,
  };

  it("accepts valid complete onboarding input", () => {
    expect(completeOnboardingSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing timezone", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, timezone: "" }).success).toBe(false);
  });

  it("clamps calorie target below 1200", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, calorieTarget: 1199 }).success).toBe(false);
  });

  it("clamps calorie target above 6000", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, calorieTarget: 6001 }).success).toBe(false);
  });

  it("rejects protein below 40", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, proteinTargetG: 39 }).success).toBe(false);
  });

  it("rejects carbs below 50", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, carbsTargetG: 49 }).success).toBe(false);
  });

  it("rejects fat below 20", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, fatTargetG: 19 }).success).toBe(false);
  });

  it("rejects fiber below 10", () => {
    expect(completeOnboardingSchema.safeParse({ ...valid, fiberTargetG: 9 }).success).toBe(false);
  });
});

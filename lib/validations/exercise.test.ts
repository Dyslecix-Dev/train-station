import { describe, expect, it } from "vitest";
import { z } from "zod/v4";

import { EXERCISE_CATEGORIES, MUSCLE_GROUPS } from "@/lib/workout-constants";

// NOTE: mirror of createExerciseSchema to avoid importing server-only deps
const createExerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  category: z.enum(EXERCISE_CATEGORIES, { error: "Please select a category" }),
  muscleGroups: z.array(z.enum(MUSCLE_GROUPS)).optional(),
  description: z.string().max(1000, "Description must be 1000 characters or fewer").optional(),
  imageUrl: z.string().optional(),
  videoUrl: z
    .union([z.string().url("Must be a valid URL"), z.literal("")])
    .optional()
    .transform((v) => v || undefined),
});

describe("createExerciseSchema", () => {
  const valid = { name: "Bench Press", category: "strength" as const };

  it("accepts minimal valid input", () => {
    expect(createExerciseSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts full valid input", () => {
    const result = createExerciseSchema.safeParse({
      ...valid,
      muscleGroups: ["chest", "triceps"],
      description: "Flat barbell bench press",
      imageUrl: "https://example.com/img.png",
      videoUrl: "https://youtube.com/watch?v=abc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createExerciseSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    expect(createExerciseSchema.safeParse({ ...valid, name: "a".repeat(101) }).success).toBe(false);
  });

  it("accepts name at 100 characters", () => {
    expect(createExerciseSchema.safeParse({ ...valid, name: "a".repeat(100) }).success).toBe(true);
  });

  it("rejects invalid category", () => {
    expect(createExerciseSchema.safeParse({ ...valid, category: "invalid" }).success).toBe(false);
  });

  it("accepts all valid categories", () => {
    for (const category of EXERCISE_CATEGORIES) {
      expect(createExerciseSchema.safeParse({ ...valid, category }).success).toBe(true);
    }
  });

  it("rejects invalid muscle group", () => {
    expect(createExerciseSchema.safeParse({ ...valid, muscleGroups: ["invalid"] }).success).toBe(false);
  });

  it("accepts all valid muscle groups", () => {
    const result = createExerciseSchema.safeParse({ ...valid, muscleGroups: [...MUSCLE_GROUPS] });
    expect(result.success).toBe(true);
  });

  it("rejects description over 1000 characters", () => {
    expect(createExerciseSchema.safeParse({ ...valid, description: "a".repeat(1001) }).success).toBe(false);
  });

  it("transforms empty videoUrl to undefined", () => {
    const result = createExerciseSchema.safeParse({ ...valid, videoUrl: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.videoUrl).toBeUndefined();
    }
  });

  it("rejects invalid videoUrl", () => {
    expect(createExerciseSchema.safeParse({ ...valid, videoUrl: "not-a-url" }).success).toBe(false);
  });

  it("rejects missing name field", () => {
    expect(createExerciseSchema.safeParse({ category: "strength" }).success).toBe(false);
  });

  it("rejects missing category field", () => {
    expect(createExerciseSchema.safeParse({ name: "Squat" }).success).toBe(false);
  });
});

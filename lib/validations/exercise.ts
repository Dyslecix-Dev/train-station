import { z } from "zod/v4";

import { EXERCISE_CATEGORIES, MUSCLE_GROUPS } from "@/lib/workout-constants";

export const createExerciseSchema = z.object({
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

export type CreateExerciseValues = z.infer<typeof createExerciseSchema>;

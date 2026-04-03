export const SECTION_LABELS: Record<string, string> = {
  warm_up: "Dynamic Warm-Up",
  main: "Main Routine",
  cooldown: "Static Cooldown",
};

export const EXERCISE_CATEGORIES = ["strength", "cardio", "bodyweight", "flexibility", "other"] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const MUSCLE_GROUPS = ["chest", "back", "shoulders", "biceps", "triceps", "core", "quadriceps", "hamstrings", "glutes", "calves", "full_body", "other"] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const PROGRESS_METRIC_MAP: Record<ExerciseCategory, string> = {
  strength: "estimated_1rm",
  cardio: "best_pace",
  bodyweight: "max_reps",
  flexibility: "hold_duration",
  other: "max_duration",
};

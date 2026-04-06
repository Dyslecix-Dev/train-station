import { and, eq } from "drizzle-orm";

import { ExerciseProgressChart } from "@/app/(protected)/exercises/[id]/exercise-progress";
import { db } from "@/lib/db";
import type { Exercise } from "@/lib/db/schema/exercises";
import { workoutExercises, workouts, workoutSets } from "@/lib/db/schema/workouts";

type Props = {
  exercise: Pick<Exercise, "id" | "progressMetricType" | "name">;
  userId: string;
};

export async function ExerciseProgressServer({ exercise, userId }: Props) {
  const rows = await db
    .select({
      completedAt: workouts.completedAt,
      weightKg: workoutSets.weightKg,
      reps: workoutSets.reps,
      durationSeconds: workoutSets.durationSeconds,
      distanceKm: workoutSets.distanceKm,
    })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutSets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(workoutExercises.exerciseId, exercise.id), eq(workouts.userId, userId), eq(workouts.status, "completed"), eq(workoutSets.completed, true)));

  // Group by date (YYYY-MM-DD of completedAt)
  const byDate = new Map<string, number[]>();

  for (const row of rows) {
    if (!row.completedAt) continue;
    const date = row.completedAt.toISOString().slice(0, 10);

    let value: number | null = null;

    switch (exercise.progressMetricType) {
      case "estimated_1rm": {
        const w = row.weightKg ? parseFloat(row.weightKg) : null;
        const r = row.reps ?? null;
        if (w !== null && r !== null && r > 0) {
          value = w * (1 + r / 30);
        }
        break;
      }
      case "best_pace": {
        const d = row.distanceKm ? parseFloat(row.distanceKm) : null;
        const dur = row.durationSeconds ?? null;
        if (d !== null && d > 0 && dur !== null) {
          value = dur / d;
        }
        break;
      }
      case "max_reps": {
        if (row.reps !== null) {
          value = row.reps;
        }
        break;
      }
      case "max_duration":
      case "hold_duration": {
        if (row.durationSeconds !== null) {
          value = row.durationSeconds;
        }
        break;
      }
    }

    if (value === null) continue;

    const existing = byDate.get(date) ?? [];
    existing.push(value);
    byDate.set(date, existing);
  }

  // For each date, pick best value (lowest for pace, highest for others)
  const isLowerBetter = exercise.progressMetricType === "best_pace";

  const points = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      value: isLowerBetter ? Math.min(...values) : Math.max(...values),
    }));

  return <ExerciseProgressChart exercise={exercise} points={points} />;
}

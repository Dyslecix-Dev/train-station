"use client";

import { useQueryState } from "nuqs";

import { ExerciseCard } from "@/components/exercise-card";
import type { Exercise } from "@/lib/db/schema/exercises";

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  const [view] = useQueryState("view", { defaultValue: "grid", shallow: true });

  if (exercises.length === 0) {
    return <p className="text-muted-foreground py-12 text-center">No exercises found.</p>;
  }

  return (
    <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2"}>
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} view={view} />
      ))}
    </div>
  );
}

"use client";

import { Dumbbell } from "lucide-react";
import { useQueryState } from "nuqs";

import { CreateExerciseDialog } from "@/components/create-exercise-dialog";
import { EmptyState } from "@/components/empty-state";
import { ExerciseCard } from "@/components/exercise-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Exercise } from "@/lib/db/schema/exercises";
import { CATEGORY_LABELS, EXERCISE_CATEGORIES } from "@/lib/workout-constants";

interface ExerciseListProps {
  exercises: Exercise[];
  profileId?: string;
}

export function ExerciseList({ exercises, profileId }: ExerciseListProps) {
  const [view] = useQueryState("view", { defaultValue: "grid", shallow: true });
  const [q, setQ] = useQueryState("q", { defaultValue: "", shallow: true });
  const [category, setCategory] = useQueryState("category", { defaultValue: "all", shallow: true });
  const [mine, setMine] = useQueryState("mine", { defaultValue: "false", shallow: true });

  const filtered = exercises.filter((ex) => {
    if (q && !ex.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (category !== "all" && ex.category !== category) return false;
    if (mine === "true" && ex.createdBy !== profileId) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value || null)} className="sm:max-w-64" aria-label="Search exercises" />
        <div className="flex items-center gap-2">
          {profileId && (
            <Button variant={mine === "true" ? "default" : "outline"} size="sm" onClick={() => setMine(mine === "true" ? null : "true")}>
              My Exercises
            </Button>
          )}
          {profileId && <CreateExerciseDialog />}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <Button variant={category === "all" ? "default" : "outline"} size="sm" onClick={() => setCategory(null)}>
          All
        </Button>
        {EXERCISE_CATEGORIES.map((cat) => (
          <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat === category ? null : cat)}>
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No exercises found" description="Try adjusting your search or filters." />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2"}>
          {filtered.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}

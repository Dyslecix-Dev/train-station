"use client";

import { Dumbbell } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema/exercises";

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ExerciseCard({ exercise, view }: { exercise: Exercise; view: string }) {
  if (view === "list") {
    return (
      <Card className="flex flex-row items-center gap-4 p-3">
        <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {exercise.imageUrl ? (
            <Image src={exercise.imageUrl} alt={exercise.name} width={48} height={48} className="h-full w-full object-cover" />
          ) : (
            <Dumbbell className="text-muted-foreground h-5 w-5" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="truncate font-medium">{exercise.name}</span>
          <Badge variant="secondary" className="shrink-0">
            {formatLabel(exercise.category)}
          </Badge>
          {exercise.muscleGroups?.map((mg) => (
            <Badge key={mg} variant="outline" className="hidden shrink-0 sm:inline-flex">
              {formatLabel(mg)}
            </Badge>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden">
        {exercise.imageUrl ? (
          <Image src={exercise.imageUrl} alt={exercise.name} width={300} height={300} className="h-full w-full object-cover" />
        ) : (
          <Dumbbell className="text-muted-foreground h-12 w-12" />
        )}
      </div>
      <CardContent className="flex flex-col gap-2 p-4">
        <h3 className="truncate font-semibold">{exercise.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{formatLabel(exercise.category)}</Badge>
          {exercise.muscleGroups?.map((mg) => (
            <Badge key={mg} variant="outline">
              {formatLabel(mg)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

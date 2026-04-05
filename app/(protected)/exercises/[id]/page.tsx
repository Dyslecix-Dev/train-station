import { and, eq, isNull, or } from "drizzle-orm";
import { Dumbbell, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DeleteExerciseButton } from "@/app/(protected)/exercises/[id]/delete-exercise-button";
import { ExerciseProgressServer } from "@/app/(protected)/exercises/[id]/exercise-progress-server";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { userProfiles } from "@/lib/db/schema/user-profiles";
import { createClient } from "@/lib/supabase/server";

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authUserId = data?.claims?.sub as string;

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, authUserId),
  });

  const exercise = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), isNull(exercises.deletedAt), or(eq(exercises.isSystem, true), profile ? eq(exercises.createdBy, profile.id) : undefined)))
    .then((rows) => rows[0]);

  if (!exercise) notFound();

  const isOwned = !exercise.isSystem && exercise.createdBy === profile?.id;
  const userId = profile?.id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/exercises">← Back</Link>
          </Button>
        </div>
        {isOwned && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/exercises/${id}/edit`}>Edit</Link>
            </Button>
            <DeleteExerciseButton id={id} />
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-xl">
          {exercise.imageUrl ? (
            <Image src={exercise.imageUrl} alt={exercise.name} width={600} height={600} className="h-full w-full object-cover" />
          ) : (
            <Dumbbell className="text-muted-foreground h-20 w-20" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{exercise.name}</h1>
            {exercise.isSystem && <p className="text-muted-foreground mt-1 text-sm">System exercise</p>}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{formatLabel(exercise.category)}</Badge>
            {exercise.muscleGroups?.map((mg) => (
              <Badge key={mg} variant="outline">
                {formatLabel(mg)}
              </Badge>
            ))}
          </div>

          {exercise.description && <p className="text-muted-foreground leading-relaxed">{exercise.description}</p>}

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Progress metric</p>
            <p className="text-muted-foreground text-sm">{formatLabel(exercise.progressMetricType)}</p>
          </div>

          {exercise.videoUrl && (
            <Button variant="outline" className="w-fit" asChild>
              <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch video
              </a>
            </Button>
          )}
        </div>
      </div>

      {userId && (
        <Suspense fallback={<LoadingSkeleton variant="chart" />}>
          <ExerciseProgressServer exercise={exercise} userId={userId} />
        </Suspense>
      )}
    </div>
  );
}

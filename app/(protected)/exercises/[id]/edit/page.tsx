import { and, eq, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EditExerciseForm } from "@/app/(protected)/exercises/[id]/edit/edit-exercise-form";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { userProfiles } from "@/lib/db/schema/user-profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Exercise",
};

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authUserId = data?.claims?.sub as string | undefined;

  if (!authUserId) {
    redirect("/login");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, authUserId),
  });

  if (!profile) {
    redirect("/onboarding");
  }

  const exercise = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.createdBy, profile.id), isNull(exercises.deletedAt)))
    .then((rows) => rows[0]);

  if (!exercise) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/exercises/${id}`}>← Back</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Exercise</h1>
        <p className="text-muted-foreground mt-1 text-sm">{exercise.name}</p>
      </div>

      <div className="max-w-lg">
        <EditExerciseForm exercise={exercise} />
      </div>
    </div>
  );
}

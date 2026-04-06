import { and, eq, isNull, or } from "drizzle-orm";

import { ExerciseList } from "@/components/exercise-list";
import { ExerciseViewToggle } from "@/components/exercise-view-toggle";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { userProfiles } from "@/lib/db/schema/user-profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Exercise Library",
};

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authUserId = data?.claims?.sub as string;

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, authUserId),
  });

  const allExercises = await db
    .select()
    .from(exercises)
    .where(and(isNull(exercises.deletedAt), or(eq(exercises.isSystem, true), profile ? eq(exercises.createdBy, profile.id) : undefined)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Exercise Library</h1>
        <ExerciseViewToggle />
      </div>
      <ExerciseList exercises={allExercises} profileId={profile?.id} />
    </div>
  );
}

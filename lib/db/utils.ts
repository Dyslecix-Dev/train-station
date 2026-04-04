import type { SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { userProfiles, type UserProfile } from "@/lib/db/schema";

export async function getCurrentUserProfile(supabase: SupabaseClient): Promise<UserProfile> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, user.id),
  });

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile;
}

export async function getUserTimezone(userId: string): Promise<string> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, userId),
    columns: { timezone: true },
  });

  return profile?.timezone ?? "America/New_York";
}

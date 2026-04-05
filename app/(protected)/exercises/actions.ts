"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { userProfiles } from "@/lib/db/schema/user-profiles";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import { getPublicUrl, uploadFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { createExerciseSchema } from "@/lib/validations/exercise";
import { PROGRESS_METRIC_MAP } from "@/lib/workout-constants";

const rateLimiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 }); // 10 exercises per 1 hour

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_SIZE = 500 * 1024; // 500KB server-side safety check (after client compression)

async function uploadExerciseImage(file: File, userId: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed.");
  }
  if (file.size > IMAGE_MAX_SIZE) {
    throw new Error("Image too large (max 500 KB). Please compress it before uploading.");
  }
  const rawExt = file.name.split(".").pop() ?? "bin";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { path: storedPath } = await uploadFile("exercise-images", path, file);
  return getPublicUrl("exercise-images", storedPath);
}

export async function createExercise(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { success } = await rateLimiter.check(user.id);
  if (!success) {
    return { error: "You've created too many exercises. Please wait an hour and try again." };
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, user.id),
  });

  if (!profile) {
    return { error: "Profile not found. Please complete onboarding first." };
  }

  let imageUrl: string | undefined;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadExerciseImage(imageFile, user.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image upload failed. Please try again.";
      logger.error("Failed to upload exercise image", { userId: user.id, error: err });
      return { error: msg };
    }
  }

  if (imageUrl) {
    formData.set("imageUrl", imageUrl);
  }

  const submission = parseWithZod(formData, { schema: createExerciseSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, category, muscleGroups, description, videoUrl } = submission.value;

  await db.insert(exercises).values({
    name,
    category,
    muscleGroups: muscleGroups ?? [],
    description,
    imageUrl,
    videoUrl,
    progressMetricType: PROGRESS_METRIC_MAP[category],
    isSystem: false,
    createdBy: profile.id,
  });

  revalidatePath("/exercises");

  return submission.reply();
}

export async function updateExercise(id: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, user.id),
  });

  if (!profile) {
    return { error: "Profile not found. Please complete onboarding first." };
  }

  const existing = await db.query.exercises.findFirst({
    where: and(eq(exercises.id, id), eq(exercises.createdBy, profile.id)),
  });

  if (!existing) {
    return { error: "Exercise not found or you do not have permission to edit it." };
  }

  let imageUrl: string | undefined = existing.imageUrl ?? undefined;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadExerciseImage(imageFile, user.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image upload failed. Please try again.";
      logger.error("Failed to upload exercise image", { userId: user.id, error: err });
      return { error: msg };
    }
  }

  if (imageUrl) {
    formData.set("imageUrl", imageUrl);
  }

  const submission = parseWithZod(formData, { schema: createExerciseSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, category, muscleGroups, description, videoUrl } = submission.value;

  await db
    .update(exercises)
    .set({
      name,
      category,
      muscleGroups: muscleGroups ?? [],
      description,
      imageUrl,
      videoUrl,
      progressMetricType: PROGRESS_METRIC_MAP[category],
      updatedAt: new Date(),
    })
    .where(and(eq(exercises.id, id), eq(exercises.createdBy, profile.id)));

  revalidatePath("/exercises");
  revalidatePath(`/exercises/${id}`);

  return submission.reply();
}

export async function deleteExercise(id: string): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, user.id),
  });

  if (!profile) {
    return { error: "Profile not found." };
  }

  const exercise = await db.query.exercises.findFirst({
    where: and(eq(exercises.id, id), eq(exercises.createdBy, profile.id), isNull(exercises.deletedAt)),
  });

  if (!exercise) {
    return { error: "Exercise not found or you do not have permission to delete it." };
  }

  try {
    await db.delete(exercises).where(and(eq(exercises.id, id), eq(exercises.createdBy, profile.id)));
  } catch (err: unknown) {
    const pgError = err as { code?: string };
    if (pgError?.code === "23503") {
      await db
        .update(exercises)
        .set({ deletedAt: new Date() })
        .where(and(eq(exercises.id, id), eq(exercises.createdBy, profile.id)));
    } else {
      logger.error("Failed to delete exercise", { userId: user.id, exerciseId: id, error: err });
      return { error: "Failed to delete exercise. Please try again." };
    }
  }

  revalidatePath("/exercises");
  redirect("/exercises");
}

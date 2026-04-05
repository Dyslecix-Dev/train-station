"use server";

import { parseWithZod } from "@conform-to/zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  // Handle image upload before parsing the rest of the form
  let imageUrl: string | undefined;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const MAX_SIZE = (Number(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;
    if (imageFile.size > MAX_SIZE) {
      return { error: "Image too large (max 5 MB)" };
    }
    try {
      const rawExt = imageFile.name.split(".").pop() ?? "bin";
      const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { path: storedPath } = await uploadFile("exercise-images", path, imageFile);
      imageUrl = await getPublicUrl("exercise-images", storedPath);
    } catch (err) {
      logger.error("Failed to upload exercise image", { userId: user.id, error: err });
      return { error: "Image upload failed. Please try again." };
    }
  }

  // Inject resolved imageUrl into formData so Conform can parse it
  if (imageUrl) {
    formData.set("imageUrl", imageUrl);
  }

  const submission = parseWithZod(formData, { schema: createExerciseSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, user.id),
  });

  if (!profile) {
    return submission.reply({ formErrors: ["Profile not found. Please complete onboarding first."] });
  }

  const { name, category, muscleGroups, description, videoUrl } = submission.value;

  await db.insert(exercises).values({
    name,
    category,
    muscleGroups: muscleGroups ?? [],
    description,
    imageUrl: imageUrl ?? undefined,
    videoUrl,
    progressMetricType: PROGRESS_METRIC_MAP[category],
    isSystem: false,
    createdBy: profile.id,
  });

  revalidatePath("/exercises");

  return submission.reply();
}

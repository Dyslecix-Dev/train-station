"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import React from "react";

import WelcomeEmail from "@/emails/welcome";
import { siteConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { completeOnboardingSchema, type CompleteOnboardingValues } from "@/lib/validations/onboarding";

const rateLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

export async function completeOnboarding(payload: CompleteOnboardingValues): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { success } = await rateLimiter.check(user.id);
  if (!success) {
    return { error: "Too many requests. Please wait a moment and try again." };
  }

  const parsed = completeOnboardingSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const data = parsed.data;

  await db
    .insert(userProfiles)
    .values({
      authUserId: user.id,
      displayName: data.displayName,
      age: data.age,
      heightCm: String(data.heightCm),
      weightKg: String(data.weightKg),
      sex: data.sex,
      activityLevel: data.activityLevel,
      primaryGoal: data.primaryGoal,
      unitsPreference: data.unitsPreference,
      timezone: data.timezone,
      calorieTarget: data.calorieTarget,
      proteinTargetG: data.proteinTargetG,
      carbsTargetG: data.carbsTargetG,
      fatTargetG: data.fatTargetG,
      fiberTargetG: data.fiberTargetG,
      onboardingCompleted: true,
    })
    .onConflictDoUpdate({
      target: userProfiles.authUserId,
      set: {
        displayName: data.displayName,
        age: data.age,
        heightCm: String(data.heightCm),
        weightKg: String(data.weightKg),
        sex: data.sex,
        activityLevel: data.activityLevel,
        primaryGoal: data.primaryGoal,
        unitsPreference: data.unitsPreference,
        timezone: data.timezone,
        calorieTarget: data.calorieTarget,
        proteinTargetG: data.proteinTargetG,
        carbsTargetG: data.carbsTargetG,
        fatTargetG: data.fatTargetG,
        fiberTargetG: data.fiberTargetG,
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
    });

  // WARNING: send welcome email — failure must NOT block the redirect
  try {
    await sendEmail({
      to: user.email!,
      subject: `Welcome to ${siteConfig.name}!`,
      template: React.createElement(WelcomeEmail, {
        username: data.displayName,
        loginUrl: siteConfig.url,
      }),
    });
  } catch (err) {
    logger.error("Failed to send welcome email", { userId: user.id, error: err });
  }

  revalidatePath("/");
  redirect("/dashboard");
}

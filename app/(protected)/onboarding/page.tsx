import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/app/(protected)/onboarding/onboarding-wizard";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, data.claims.sub as string),
  });

  if (profile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">Welcome! Let&apos;s get you set up.</h1>
        <p className="text-muted-foreground mt-2 text-sm">Just a few quick questions to personalize your experience.</p>
      </div>
      <OnboardingWizard />
    </div>
  );
}

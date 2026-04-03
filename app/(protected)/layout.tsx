import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ActivityTracker } from "@/components/activity-tracker";
import { AuthButton } from "@/components/auth-button";
import { BottomNav } from "@/components/bottom-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserProfileProvider } from "@/components/user-profile-provider";
import { siteConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { createOrGetUser } from "@/lib/db/ensure-user";
import { userProfiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const authUserId = data.claims.sub as string;

  await createOrGetUser({ id: authUserId, email: data.claims.email as string });

  let profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, authUserId),
  });

  if (!profile) {
    const [created] = await db.insert(userProfiles).values({ authUserId }).onConflictDoNothing().returning();
    profile = created ?? (await db.query.userProfiles.findFirst({ where: eq(userProfiles.authUserId, authUserId) }));
  }

  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <ActivityTracker />
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav aria-label="Main navigation" className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={"/"}>{siteConfig.name}</Link>
              <Link href={"/profile"} className="text-muted-foreground hover:text-foreground font-normal transition-colors">
                Profile
              </Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>
        <div className="flex w-full max-w-5xl flex-1 gap-0 p-5 pb-24 md:gap-6">
          <aside className="hidden md:block">
            <SidebarNav />
          </aside>
          <main className="flex-1">
            <UserProfileProvider profile={profile}>{children}</UserProfileProvider>
          </main>
        </div>
        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

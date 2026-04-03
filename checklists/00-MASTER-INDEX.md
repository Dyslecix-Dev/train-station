# Fitness App — Master Checklist Index

## How to Use with Claude Code

Feed **one phase at a time** to Claude Code. Each checklist is self-contained with enough context for Claude Code to work without hallucinating. Complete them in order — later phases depend on earlier ones.

**Recommended workflow:**

1. Open Claude Code in your project root
2. Paste or reference the current phase's checklist
3. Tell Claude Code: "Follow this checklist. Complete each item, check it off, and move to the next."
4. Review the output before moving to the next phase

---

## Phases

| Phase | File                         | Description                                                 | Depends On     |
| ----- | ---------------------------- | ----------------------------------------------------------- | -------------- |
| 1     | `01-project-setup.md`        | Supabase, auth, base layout, theme                          | —              |
| 2a    | `02a-database-schema.md`     | All Drizzle schemas, triggers, migrations                   | Phase 1        |
| 2b    | `02b-database-rls-utils.md`  | RLS policies, Drizzle relations, helpers                    | Phase 2a       |
| 3     | `03-onboarding.md`           | Wizard, TDEE calc, user profile                             | Phase 2b       |
| 4     | `04-exercise-library.md`     | Exercise CRUD, categories, custom exercises                 | Phase 3        |
| 5     | `05-workout-templates.md`    | Template CRUD, sections, exercise config                    | Phase 4        |
| 6a    | `06a-workout-active.md`      | Zustand store, start workout, active page, exercise list UI | Phase 5        |
| 6b    | `06b-workout-sets-timers.md` | Set logging UI, rest timer, auto-save, complete/cancel      | Phase 6a       |
| 6c    | `06c-workout-history.md`     | Workout history, detail page, unit conversions              | Phase 6b       |
| 7     | `07-nutrition.md`            | USDA integration, meal logging, macros, targets, body stats | Phase 6c       |
| 8     | `08-sleep-tracking.md`       | Sleep log with bedtime, wake time, quality                  | Phase 2b       |
| 9     | `09-mental-health.md`        | Mood, emotion tags, journal                                 | Phase 2b       |
| 10    | `10-dashboard.md`            | Today summary, weekly trends, streaks                       | Phases 6c, 7–9 |
| 11    | `11-settings-and-polish.md`  | Profile editing, units, export, account deletion, quick log | Phase 10       |
| 12    | `12-pwa-offline.md`          | Service worker, offline workout, background sync            | Phase 6c       |
| 13    | `13-testing-ci-cd.md`        | Vitest, Playwright, Lighthouse, GitHub Actions              | All phases     |

---

## Critical Guardrails (Read Before Every Phase)

These are common mistakes that will break the build. Claude Code must follow these across all phases:

- **`proxy.ts`, not `middleware.ts`**: Next.js 16 renamed middleware to proxy. The route-protection file is `proxy.ts` at the project root, and the Supabase session helper is `lib/supabase/proxy.ts`. Never create a `middleware.ts` — it will be silently ignored.
- **Async `cookies()` and `headers()`**: In Next.js 16, `cookies()` and `headers()` from `next/headers` are **async**. Always `await` them. Forgetting `await` causes silent breakage.
- **No Supabase clients at module scope**: Always create Supabase clients inside the function body, never at the top of a file. This is required for Vercel Fluid Compute.
- **Split `"use server"` files from shared exports**: Do NOT put `"use server"` at the top of a file that also exports Zod schemas, constants, or types used by client components. Server actions go in dedicated `actions/` files. Shared schemas and constants go in `lib/` files without the `"use server"` directive.
- **`revalidatePath` after mutations**: All server actions that mutate data must call `revalidatePath()` for the affected page(s). Server-rendered pages won't reflect changes without this. Use in addition to TanStack Query invalidation for client-side caches.
- **File paths use `lib/db/schema/`**: The boilerplate puts database schemas in `lib/db/schema/`, not `db/schema/`. Follow the boilerplate's structure.
- **Env var names follow Vercel-Supabase convention**: `POSTGRES_URL` (pooled, runtime), `POSTGRES_URL_NON_POOLING` (direct, migrations). Not `DATABASE_URL` / `DIRECT_URL`. The Supabase anon key is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `ANON_KEY`). Also ensure `SUPABASE_JWT_SECRET` is set for JWT verification.
- **Route groups**: Auth routes are under `app/(auth)/`, protected routes under `app/(protected)/`. The boilerplate ships with `app/auth/` and `app/protected/` (no parens). Phase 1 converts both to route groups. Because `(auth)` is a route group, the `auth/` segment is removed from URLs (e.g. `/auth/login` → `/login`). The proxy route-protection logic must be updated to check individual auth paths rather than a `/auth/` prefix.
- **Auth route paths**: The boilerplate uses `/auth/login` — after converting to `app/(auth)/`, these become `/login`, `/sign-up`, `/forgot-password`, etc. The existing components are `LoginForm`, `SignUpForm`, `ForgotPasswordForm`, `UpdatePasswordForm`, `AuthButton`, `LogoutButton`.
- **`getClaims()` over `getUser()` for identity**: The boilerplate's `supabase.auth.getClaims()` reads the JWT locally with no network call. Use it in layouts and server components for identity checks. Reserve `getUser()` (which round-trips to Supabase) for sensitive server actions where you need guaranteed-current data.
- **`lib/config.ts` is the single source of truth for app identity**: Import the app name, description, and URL from `lib/config.ts`. Never hardcode the app name in page metadata, the PWA manifest, greetings, or email templates.
- **Use existing boilerplate utilities**: The boilerplate ships with `lib/storage/` (file upload/delete/URL helpers + `uploadFileAction` server action), `lib/db/paginate` (offset pagination), `lib/email/` (Resend + `sendEmail()` helper), and React Email templates in `emails/`. Use these instead of building from scratch.

---

## Done-State Checks

Before starting each phase, verify the previous phase's outputs exist. If they don't, complete that phase first.

| Phase | Verify Before Starting                                                                       |
| ----- | -------------------------------------------------------------------------------------------- |
| 2a    | `lib/supabase/proxy.ts` exists, `pnpm build` succeeds, bottom nav component exists           |
| 2b    | `lib/db/schema/index.ts` exports all tables, `pnpm db:migrate` ran successfully              |
| 3     | RLS policies are enabled on all tables, `lib/db/index.ts` exports drizzle client             |
| 4     | `user_profiles` table exists with `onboarding_completed` column, TDEE utils in `lib/tdee.ts` |
| 5     | `exercises` table has seed data, exercise list page renders at `/exercises`                  |
| 6a    | At least one workout template exists, template detail page has "Start Workout" button        |
| 6b    | Active workout Zustand store exists at `lib/stores/active-workout.ts`, exercise list renders |
| 6c    | Auto-save works, complete/cancel workout flows work end-to-end                               |
| 7     | `lib/units.ts` exists with conversion functions, workout history page renders                |
| 8     | `foods` table exists, `USDA_API_KEY` env var is set                                          |
| 9     | `sleep_logs` table exists                                                                    |
| 10    | All four pillars (workout, nutrition, sleep, mood) have working log flows                    |
| 11    | Dashboard renders with data from all four pillars                                            |
| 12    | Settings page exists with profile editing, all features from previous phases work            |
| 13    | Service worker activates, offline workout flow works                                         |

---

## Key Decisions (Reference for All Phases)

- **Units:** Imperial default (lb, mi). Global toggle in user profile. All values stored in metric internally, converted on display.
- **Offline:** v1 supports offline workout tracking only. Nutrition/sleep/mood are online-only for v1. Offline sync uses client-side reconnect (no Background Sync API) — see Phase 12.
- **Food data:** USDA FoodData Central API. `USDA_API_KEY` is a **required** environment variable — register free at [USDA](https://fdc.nal.usda.gov/api-key-signup). `DEMO_KEY` must never be used (shared rate limit, will fail in production).
- **Progress metrics:** Per exercise category — 1RM (strength), pace (cardio), max reps/duration (bodyweight), hold duration (flexibility).
- **Template versioning:** Snapshot-on-use. Starting a workout deep-copies the template into `template_snapshot` JSONB. Editing a template never affects past workouts.
- **Nutrition scope (v1):** Calories + macros (protein, carbs, fat, fiber). Micronutrients deferred to v2.
- **Nutrition history integrity:** `meal_logs` stores `calories_snapshot`, `protein_g_snapshot`, `carbs_g_snapshot`, `fat_g_snapshot`, `fiber_g_snapshot` at log time. These snapshots are computed as `food.value_per_serving × servings` (a multiplier, not a weight). All nutrition totals (daily, weekly, dashboard) read from snapshot columns. Editing a food's macros does not rewrite history.
- **Soft-delete:** Custom exercises and custom foods that are referenced by past workout or meal data use soft-delete (`deleted_at` timestamp) rather than hard-delete. Hard-delete is used only when no references exist. The delete server action must attempt hard-delete first, catch Postgres error code `23503` (FK violation), then fall back to soft-delete. `ON DELETE RESTRICT` FKs enforce this.
- **Sleep date convention:** `sleep_logs.date` = the **wake date** (the calendar day the user woke up). A Sunday-night-to-Monday-morning sleep logs as Monday. All sleep queries, dashboard cards, and trend charts use this convention consistently.
- **Timezone handling:** All date comparisons (streaks, "today" queries, sleep date) must resolve "today" using the user's local timezone. Store a `timezone` text field in `user_profiles` (e.g., `America/Los_Angeles`), populate it during onboarding from the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone`, and pass it to server actions that compare dates.
- **Streak:** `user_profiles.current_streak` and `last_streak_date` are maintained at write time by a shared `updateStreak()` utility called from every logging server action. Never computed by scanning tables at read time. A logged day = any one of: workout completed, meal logged, water logged, sleep logged, mood logged. The streak utility resolves "today" and "yesterday" using the user's `timezone` field.
- **Water target:** `user_profiles.water_target_ml` (default 2000). Configurable in settings. Never hardcoded in UI.
- **Derived fields:** `workouts.duration_seconds` and `sleep_logs.duration_minutes` are always recalculated at write time. They are never independently updatable form fields.
- **`updated_at` columns:** All tables with `updated_at` use a shared SQL trigger function `set_updated_at()` that automatically sets `updated_at = now()` on every UPDATE. The trigger is created once and applied to all relevant tables during migration.
- **Section display labels:** DB enum values (`warm_up`, `main`, `cooldown`) map to display labels ("Dynamic Warm-Up", "Main Routine", "Static Cooldown") via a single `SECTION_LABELS` constant in `lib/workout-constants.ts`. Never inline the label strings.
- **Allowed emotions:** The fixed emotion set for `mood_logs.emotions` is exported as `ALLOWED_EMOTIONS` from the schema file and imported by both the Zod schema and the UI. Never duplicated.
- **Client-side UUIDs for new records:** When creating entities that start in client-only state (e.g., workout sets in the Zustand store before auto-save), generate UUIDs client-side via `crypto.randomUUID()`. Use the same UUID as the DB primary key on insert. This avoids insert-vs-update ambiguity during auto-save upserts.
- **Exercise media (v1):** Text description + single static image (compressed client-side to max 800px / 200KB via `browser-image-compression`). `video_url` field exists but is optional.
- **Auth:** Supabase Auth with email/password. OTP ready but commented out.
- **Validation:** Zod v4 schemas shared between client and server. Conform for form handling.
- **State:** Zustand for client state (active workout timer, UI state). TanStack Query for server data. nuqs for URL state (filters, pagination). Date navigation pages all use the same `?date=` nuqs param name.
- **URL date param:** All date-navigable pages (nutrition, sleep, mental health) use `?date=YYYY-MM-DD` as the nuqs param. Consistent naming means navigating between pages preserves the selected date.
- **Set rows are not pre-inserted:** When starting a workout from a template, `workout_exercises` rows are created but `workout_sets` rows are not. Set rows are only written to the DB on auto-save or set completion. Local Zustand state tracks empty sets before they are persisted. New sets get a `crypto.randomUUID()` client-side ID.
- **Favorites tab deferred:** No Favorites tab in the food search dialog for v1. The "Recent" tab covers the fast re-log use case.
- **Shared constants early:** `lib/workout-constants.ts` and `lib/nutrition-constants.ts` are created during Phase 1 alongside the schema files, not deferred to later phases. All enums, constants, and shared types are exported from their schema files so later phases can import them directly.
- **Optimistic updates:** Use TanStack Query optimistic updates for high-frequency UI actions: set completion, water log add/remove, meal log remove. This makes the UI feel instant.
- **Sanity clamping:** After calculating TDEE-based nutrition targets, clamp values to safe ranges: calories 1200–6000, protein 40–400g, carbs 50–800g, fat 20–300g, fiber 10–100g.

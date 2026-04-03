# Phase 2a — Database Schema & Migrations

## Done-State Check

Before starting, verify Phase 1 outputs exist: `components/bottom-nav.tsx` exists, `components/query-provider.tsx` exists, `pnpm build` succeeds.

## Context for Claude Code

We use Drizzle ORM with a schema-first approach. All tables are defined in `lib/db/schema/` as TypeScript files, then migrated via `drizzle-kit`. The driver is `postgres.js` (pooled connection for runtime via `POSTGRES_URL`, direct connection for migrations via `POSTGRES_URL_NON_POOLING`). Supabase Auth manages the `auth.users` table — our `user_profiles` table references it. All tables must have RLS policies in Supabase (covered in Phase 2b). Store all measurements in metric internally (kg, km, seconds). Convert on display using the user's `units_preference`.

**This phase covers schema definitions, triggers, and migration only. RLS policies, Drizzle relations, and helper utilities are in Phase 2b.**

If this phase is too large for one Claude Code session, split at the "Migration" heading — do schema files first, then migration.

---

## Checklist

### Schema Files Structure

- [ ] Create `lib/db/schema/index.ts` that re-exports all schema files
- [ ] Create `lib/db/schema/user-profiles.ts`
- [ ] Create `lib/db/schema/exercises.ts`
- [ ] Create `lib/db/schema/workout-templates.ts`
- [ ] Create `lib/db/schema/workouts.ts`
- [ ] Create `lib/db/schema/nutrition.ts`
- [ ] Create `lib/db/schema/sleep.ts`
- [ ] Create `lib/db/schema/mental-health.ts`

### User Profiles Table (`user_profiles`)

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `auth_user_id` — UUID, unique, not null, references `auth.users(id)` on delete cascade
- [ ] `display_name` — text, nullable
- [ ] `age` — integer, nullable
- [ ] `height_cm` — numeric(5,1), nullable (stored in cm always)
- [ ] `weight_kg` — numeric(5,1), nullable (stored in kg always)
- [ ] `sex` — text enum (`male`, `female`, `other`, `prefer_not_to_say`), nullable
- [ ] `activity_level` — text enum (`sedentary`, `lightly_active`, `moderately_active`, `very_active`, `extremely_active`), nullable
- [ ] `primary_goal` — text enum (`lose_fat`, `build_muscle`, `maintain`, `improve_endurance`, `general_health`), nullable
- [ ] `units_preference` — text enum (`imperial`, `metric`), not null, default `imperial`
- [ ] `timezone` — text, not null, default `'America/New_York'` (IANA timezone identifier, e.g., `America/Los_Angeles`. Populated from the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` during onboarding. Used by streak logic and all "today" comparisons.)
- [ ] `calorie_target` — integer, nullable (kcal/day)
- [ ] `protein_target_g` — integer, nullable
- [ ] `carbs_target_g` — integer, nullable
- [ ] `fat_target_g` — integer, nullable
- [ ] `fiber_target_g` — integer, nullable
- [ ] `water_target_ml` — integer, not null, default `2000` (daily water goal; configurable in settings)
- [ ] `current_streak` — integer, not null, default `0` (cached streak count — updated on each log action, never computed on read)
- [ ] `last_streak_date` — date, nullable (the most recent date that counted toward the streak; stored in the user's local timezone date)
- [ ] `onboarding_completed` — boolean, not null, default `false`
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] `updated_at` — timestamp with time zone, not null, default `now()`

### Exercises Table (`exercises`)

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `name` — text, not null
- [ ] `description` — text, nullable
- [ ] `category` — text enum (`strength`, `cardio`, `bodyweight`, `flexibility`, `other`), not null
- [ ] `muscle_groups` — text array, nullable (e.g., `['chest', 'triceps']`)
- [ ] `progress_metric_type` — text enum (`estimated_1rm`, `best_pace`, `max_reps`, `max_duration`, `hold_duration`), not null
- [ ] `image_url` — text, nullable
- [ ] `video_url` — text, nullable
- [ ] `is_system` — boolean, not null, default `false` (true = global, false = user-created)
- [ ] `created_by` — UUID, nullable, references `user_profiles(id)` on delete cascade (null for system exercises)
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] `updated_at` — timestamp with time zone, not null, default `now()`
- [ ] `deleted_at` — timestamp with time zone, nullable (**soft-delete**). User-created exercises that are referenced by `workout_exercises` (past workouts) cannot be hard-deleted due to `ON DELETE RESTRICT`. Set `deleted_at = now()` instead of deleting. Filter `deleted_at IS NULL` in all queries. System exercises are never deleted.
- [ ] Add unique constraint on (`name`, `created_by`) to prevent duplicate custom exercises per user
- [ ] Export `ALLOWED_EMOTIONS` constant from `lib/db/schema/mental-health.ts` (see mental health table below)

### Workout Templates Tables

**`workout_templates`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `name` — text, not null (e.g., "Push Day", "Leg Day")
- [ ] `description` — text, nullable
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] `updated_at` — timestamp with time zone, not null, default `now()`

**`workout_template_exercises`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `template_id` — UUID, not null, references `workout_templates(id)` on delete cascade
- [ ] `exercise_id` — UUID, not null, references `exercises(id)` on delete restrict
- [ ] `section` — text enum (`warm_up`, `main`, `cooldown`), not null
- [ ] `sort_order` — integer, not null
- [ ] `default_sets` — integer, nullable (suggested number of sets)
- [ ] `default_rest_seconds` — integer, nullable (rest timer between sets)
- [ ] `rest_between_exercises_seconds` — integer, nullable (rest timer before next exercise)
- [ ] `notes` — text, nullable
- [ ] Add unique constraint on (`template_id`, `sort_order`)

### Workouts Tables

**`workouts`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `template_id` — UUID, nullable, references `workout_templates(id)` on delete set null (null = freestyle workout)
- [ ] `template_snapshot` — JSONB, nullable (deep copy of template at time of use)
- [ ] `name` — text, not null (copied from template or user-entered for freestyle)
- [ ] `started_at` — timestamp with time zone, not null
- [ ] `completed_at` — timestamp with time zone, nullable
- [ ] `duration_seconds` — integer, nullable (derived: completed_at - started_at)
- [ ] `status` — text enum (`in_progress`, `completed`, `cancelled`), not null, default `in_progress`
- [ ] `notes` — text, nullable
- [ ] `created_at` — timestamp with time zone, not null, default `now()`

**`workout_exercises`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `workout_id` — UUID, not null, references `workouts(id)` on delete cascade
- [ ] `exercise_id` — UUID, not null, references `exercises(id)` on delete restrict
- [ ] `section` — text enum (`warm_up`, `main`, `cooldown`), not null
- [ ] `sort_order` — integer, not null
- [ ] `rest_between_exercises_seconds` — integer, nullable
- [ ] `notes` — text, nullable
- [ ] Add unique constraint on (`workout_id`, `sort_order`)

**`workout_sets`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()` (also accepts client-generated UUIDs from the Zustand store — the auto-save upsert uses this ID for insert-or-update)
- [ ] `workout_exercise_id` — UUID, not null, references `workout_exercises(id)` on delete cascade
- [ ] `set_number` — integer, not null
- [ ] `is_warmup_set` — boolean, not null, default `false`
- [ ] `weight_kg` — numeric(6,2), nullable
- [ ] `reps` — integer, nullable
- [ ] `duration_seconds` — integer, nullable (stored as total seconds)
- [ ] `distance_km` — numeric(8,3), nullable
- [ ] `rpe` — integer, nullable (1–10)
- [ ] `rir` — integer, nullable (0–5)
- [ ] `rest_seconds` — integer, nullable (rest after this set)
- [ ] `completed` — boolean, not null, default `false`
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] Add unique constraint on (`workout_exercise_id`, `set_number`)
- [ ] Add check constraint: `rpe` between 1 and 10 (when not null)
- [ ] Add check constraint: `rir` between 0 and 5 (when not null)

### Nutrition Tables

**`foods`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `name` — text, not null
- [ ] `brand` — text, nullable
- [ ] `serving_size` — numeric(8,2), not null
- [ ] `serving_unit` — text, not null (g, ml, oz, cup, piece, etc.)
- [ ] `calories` — numeric(8,2), not null (per serving)
- [ ] `protein_g` — numeric(8,2), nullable
- [ ] `carbs_g` — numeric(8,2), nullable
- [ ] `fat_g` — numeric(8,2), nullable
- [ ] `fiber_g` — numeric(8,2), nullable
- [ ] `fdc_id` — text, nullable (USDA FoodData Central ID, for API-sourced foods)
- [ ] `is_system` — boolean, not null, default `false`
- [ ] `created_by` — UUID, nullable, references `user_profiles(id)` on delete cascade
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] `updated_at` — timestamp with time zone, not null, default `now()`
- [ ] `deleted_at` — timestamp with time zone, nullable (**soft-delete**). User-created foods referenced by `meal_logs` cannot be hard-deleted. Set `deleted_at = now()` instead. Filter `deleted_at IS NULL` in all queries. System foods are never deleted.

**`meal_logs`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `date` — date, not null
- [ ] `meal_type` — text enum (`breakfast`, `lunch`, `dinner`, `snack`), not null
- [ ] `food_id` — UUID, not null, references `foods(id)` on delete restrict
- [ ] `servings` — numeric(6,2), not null, default `1` (multiplier on the food's per-serving values)
- [ ] `calories_snapshot` — numeric(8,2), not null (`food.calories × servings` — captures the value at log time so future edits to the food don't rewrite history)
- [ ] `protein_g_snapshot` — numeric(8,2), nullable
- [ ] `carbs_g_snapshot` — numeric(8,2), nullable
- [ ] `fat_g_snapshot` — numeric(8,2), nullable
- [ ] `fiber_g_snapshot` — numeric(8,2), nullable
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] **Important**: All nutrition totals (daily summary, weekly average, dashboard card) must read from the `_snapshot` columns, not from the joined `foods` table. The join is only for display purposes (food name, serving unit).

**`water_logs`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `date` — date, not null
- [ ] `amount_ml` — integer, not null
- [ ] `created_at` — timestamp with time zone, not null, default `now()`

**`body_stats_logs`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `date` — date, not null
- [ ] `weight_kg` — numeric(5,1), nullable
- [ ] `body_fat_percentage` — numeric(4,1), nullable
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] Add unique constraint on (`user_id`, `date`) — one entry per day

### Sleep Table (`sleep_logs`)

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `date` — date, not null (**convention: the wake date** — the calendar day the user woke up. A Sunday night → Monday morning sleep logs as Monday. Enforced consistently across the sleep page, dashboard, and trend queries.)
- [ ] `bedtime` — timestamp with time zone, not null
- [ ] `wake_time` — timestamp with time zone, not null
- [ ] `duration_minutes` — integer, not null (**derived at write time**: `EXTRACT(EPOCH FROM (wake_time - bedtime)) / 60`, rounded. Never updated independently — always recalculated when bedtime or wake_time changes.)
- [ ] `quality` — integer, not null (1–5)
- [ ] `notes` — text, nullable
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] Add unique constraint on (`user_id`, `date`)
- [ ] Add check constraint: `quality` between 1 and 5
- [ ] Add check constraint: `wake_time > bedtime`

### Mental Health Tables

**`mood_logs`**

- [ ] `id` — UUID, primary key, default `gen_random_uuid()`
- [ ] `user_id` — UUID, not null, references `user_profiles(id)` on delete cascade
- [ ] `date` — date, not null
- [ ] `mood_score` — integer, not null (1–5: very low, low, neutral, good, very good)
- [ ] `emotions` — text array, not null (from fixed set — see below)
- [ ] `journal_entry` — text, nullable
- [ ] `created_at` — timestamp with time zone, not null, default `now()`
- [ ] Add unique constraint on (`user_id`, `date`)
- [ ] Add check constraint: `mood_score` between 1 and 5

**Allowed Emotions Constant**

- [ ] In `lib/db/schema/mental-health.ts`, export a constant `ALLOWED_EMOTIONS`:

  ```ts
  export const ALLOWED_EMOTIONS = ["anxious", "stressed", "calm", "energized", "motivated", "tired", "irritable", "happy", "sad", "neutral"] as const;
  ```

- [ ] This is the single source of truth. Import it into the Zod schema and the UI. Never duplicate this list.

### Indexes

- [ ] `user_profiles.auth_user_id` — unique index (from unique constraint)
- [ ] `exercises.created_by` — index for filtering user's custom exercises
- [ ] `exercises.category` — index for filtering by category
- [ ] `workout_templates.user_id` — index
- [ ] `workouts.user_id` — index
- [ ] `workouts.started_at` — index (for history sorting)
- [ ] `workout_sets.workout_exercise_id` — index
- [ ] `meal_logs(user_id, date)` — composite index
- [ ] `water_logs(user_id, date)` — composite index
- [ ] `body_stats_logs(user_id, date)` — composite index
- [ ] `sleep_logs(user_id, date)` — composite index
- [ ] `mood_logs(user_id, date)` — composite index

### `updated_at` Trigger

- [ ] Create a SQL migration file (or include in the Drizzle migration) that defines a shared trigger function:

  ```sql
  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

- [ ] Apply this trigger to all tables that have an `updated_at` column: `user_profiles`, `exercises`, `workout_templates`, `foods`. Create the trigger via:

  ```sql
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON <table_name>
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  ```

- [ ] This ensures `updated_at` auto-updates on every row change without needing application-level code.

### Migration

- [ ] Run `pnpm db:generate` to create migration SQL
- [ ] Run `pnpm db:migrate` to apply against the database (uses `POSTGRES_URL_NON_POOLING`)
- [ ] Verify all tables exist in Supabase dashboard

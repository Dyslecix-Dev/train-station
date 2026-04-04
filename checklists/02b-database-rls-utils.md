# Phase 2b — RLS Policies, Relations & Database Utilities

## Done-State Check

Before starting, verify Phase 2a outputs exist: `lib/db/schema/index.ts` exports all tables, `pnpm db:migrate` ran successfully, all tables visible in Supabase dashboard.

## Context for Claude Code

This phase adds Row Level Security (RLS) policies to all tables, defines Drizzle relation mappings for type-safe joins, and creates shared database utility functions. RLS is critical — without it, any authenticated user can read/write any row.

---

## Checklist

### RLS Policies

- [x] In Supabase dashboard (or via SQL migration), enable RLS on **ALL** tables: `user_profiles`, `exercises`, `workout_templates`, `workout_template_exercises`, `workouts`, `workout_exercises`, `workout_sets`, `foods`, `meal_logs`, `water_logs`, `body_stats_logs`, `sleep_logs`, `mood_logs`
- [x] **`user_profiles`**: Users can SELECT, INSERT, UPDATE, DELETE only rows where `auth_user_id = auth.uid()`
- [x] **`exercises`**: Users can SELECT all rows where `is_system = true` OR `created_by` matches the user's profile ID. Users can INSERT, UPDATE, DELETE only their own rows (`created_by` = their profile ID).
- [x] **`foods`**: Same pattern as exercises — SELECT where `is_system = true` OR `created_by` matches user. INSERT, UPDATE, DELETE only own rows.
- [x] **`workout_templates`**: Users can only SELECT, INSERT, UPDATE, DELETE rows where `user_id` matches their profile ID
- [x] **`workout_template_exercises`**: Users can only access rows where the parent `template_id` belongs to a template they own (join through `workout_templates.user_id`)
- [x] **`workouts`**: Users can only access rows where `user_id` matches their profile ID
- [x] **`workout_exercises`**: Users can only access rows where the parent `workout_id` belongs to a workout they own
- [x] **`workout_sets`**: Users can only access rows where the parent `workout_exercise_id` belongs to a workout exercise they own (chain through `workout_exercises` → `workouts`)
- [x] **`meal_logs`**: Users can only access rows where `user_id` matches their profile ID
- [x] **`water_logs`**: Users can only access rows where `user_id` matches their profile ID
- [x] **`body_stats_logs`**: Users can only access rows where `user_id` matches their profile ID
- [x] **`sleep_logs`**: Users can only access rows where `user_id` matches their profile ID
- [x] **`mood_logs`**: Users can only access rows where `user_id` matches their profile ID
- [x] **Verify RLS** by testing with a non-service-role client: query a table as one user, confirm they cannot see another user's rows

### Drizzle Relations

- [ ] In each schema file, define Drizzle `relations()` for type-safe joins:
  - `user_profiles` → has many `exercises`, `workout_templates`, `workouts`, `meal_logs`, `water_logs`, `body_stats_logs`, `sleep_logs`, `mood_logs`
  - `exercises` → belongs to `user_profiles` (via `created_by`), has many `workout_template_exercises`, `workout_exercises`
  - `workout_templates` → belongs to `user_profiles`, has many `workout_template_exercises`
  - `workout_template_exercises` → belongs to `workout_templates`, belongs to `exercises`
  - `workouts` → belongs to `user_profiles`, belongs to `workout_templates` (nullable), has many `workout_exercises`
  - `workout_exercises` → belongs to `workouts`, belongs to `exercises`, has many `workout_sets`
  - `workout_sets` → belongs to `workout_exercises`
  - `foods` → belongs to `user_profiles` (via `created_by`), has many `meal_logs`
  - `meal_logs` → belongs to `user_profiles`, belongs to `foods`
  - `water_logs` → belongs to `user_profiles`
  - `body_stats_logs` → belongs to `user_profiles`
  - `sleep_logs` → belongs to `user_profiles`
  - `mood_logs` → belongs to `user_profiles`

### Inferred Types

- [ ] In each schema file, export inferred types:

  ```ts
  export type UserProfile = typeof userProfiles.$inferSelect;
  export type NewUserProfile = typeof userProfiles.$inferInsert;
  ```

  Do this for all tables.

### Drizzle Client

- [ ] Verify `lib/db/index.ts` exists with a drizzle client instance using pooled `POSTGRES_URL`
- [ ] Ensure it uses `prepare: false` and `max: 1` for Supabase pooled connections (this matches the boilerplate's existing config)

### Database Utilities

- [ ] Create `lib/db/utils.ts` with a `getCurrentUserProfile(supabase)` helper:
  - Gets the auth user via `supabase.auth.getUser()` (async) — this is correct for server actions where you need guaranteed-current auth data. The protected layout uses `getClaims()` (fast, local) for rendering; this utility uses `getUser()` (network call, authoritative) for mutations.
  - Fetches the `user_profiles` row by `auth_user_id`
  - Returns the profile or throws if not found
  - This is used by every server action to get the current user's profile ID
- [ ] Create `lib/db/utils.ts` function `getUserTimezone(userId)`:
  - Fetches the `timezone` field from `user_profiles`
  - Returns the IANA timezone string (e.g., `America/Los_Angeles`)
  - Used by streak logic and date comparisons

### URL State Convention

- [ ] All date-navigable pages (nutrition, sleep, mental health) must use the **same `nuqs` parameter name** for the selected date: `date` (e.g., `?date=2025-03-15`). This ensures that if a user navigates from the nutrition page to the sleep page, the date they were viewing is preserved in the URL.
- [ ] Create a shared nuqs hook at `lib/hooks/use-date-param.ts` that encapsulates this convention

# Phase 4 — Exercise Library

## Done-State Check

Before starting, verify Phase 3 outputs exist: `user_profiles` table has `onboarding_completed` column, `lib/tdee.ts` exists with `calculateBMR`, `calculateTDEE`, `calculateTargets` functions.

## Context for Claude Code

The exercise library is a browsable, searchable list of exercises used when building templates and workouts. Exercises are either system-wide (seeded, visible to all) or user-created (visible only to that user). Each exercise has a category that determines its `progress_metric_type` (mapping defined in `lib/workout-constants.ts`). We use server components for the list page, TanStack Query for client-side search/filter, and server actions for CRUD. Images are stored in Supabase Storage. No video uploads for v1 — just an optional `video_url` text field.

---

## Checklist

### Seed Data

- [ ] Create `lib/db/seed/exercises.ts` with 15–20 common exercises across all categories. Ensure at least 3 per category. Example distribution:
  - Strength: bench press, squat, deadlift, overhead press, barbell row, lat pulldown, bicep curl, tricep extension
  - Cardio: running, cycling, rowing, jump rope
  - Bodyweight: push-up, pull-up, plank, lunge
  - Flexibility: hamstring stretch, pigeon pose, child's pose
- [ ] Each seed exercise: `is_system = true`, `created_by = null`, appropriate `category`, `progress_metric_type` (use `PROGRESS_METRIC_MAP` from `lib/workout-constants.ts`), `muscle_groups` array, 1–2 sentence `description` of proper form
- [ ] Update the `pnpm db:seed` script (in `lib/db/seed.ts`) to call the exercise seeder. Must be idempotent — safe to run multiple times (upsert on name).
- [ ] Use placeholder `image_url` values (null is fine for v1 — the UI should handle missing images gracefully with a placeholder icon)

### Exercise List Page

- [ ] Create page at `app/(protected)/exercises/page.tsx` (server component)
- [ ] Fetch all system exercises + current user's custom exercises (where `deleted_at IS NULL`)
- [ ] Display exercises in a responsive grid (cards) or list view with toggle
- [ ] Each card shows: name, category badge, muscle groups as small badges, thumbnail image (or placeholder icon if no image)
- [ ] Add a search input (client-side filter via `nuqs` for URL state, param name `q`) that filters by name
- [ ] Add category filter (dropdown or tabs: All, Strength, Cardio, Bodyweight, Flexibility, Other)
- [ ] Add a "My Exercises" filter toggle that shows only user-created exercises
- [ ] Show `EmptyState` component when no exercises match filters

### Exercise Detail Page

- [ ] Create page at `app/(protected)/exercises/[id]/page.tsx` (server component)
- [ ] Fetch the exercise by ID (respect RLS — system or user-owned)
- [ ] Display: name, category, muscle groups, full description, image (large, or placeholder), video URL (as external link if present)
- [ ] If user-owned: show Edit and Delete buttons
- [ ] If system exercise: no edit/delete, just view

### Exercise Progress Section (on Detail Page)

- [ ] Below the exercise details, show a "Progress" section
- [ ] Wrap in a Suspense boundary with a `LoadingSkeleton` fallback (variant: chart)
- [ ] Query completed workout sets for this exercise, grouped by workout date
- [ ] Based on `progress_metric_type`:
  - `estimated_1rm`: Calculate Epley 1RM (`weight × (1 + reps / 30)`) for each set, show the best per workout. Line chart over time.
  - `best_pace`: Calculate pace (`duration_seconds ÷ distance_km`) for each set, show the best per workout. Line chart over time (lower is better).
  - `max_reps`: Show the max reps achieved per workout. Line chart over time.
  - `max_duration`: Show the max `duration_seconds` per workout. Line chart over time.
  - `hold_duration`: Same as `max_duration`.
- [ ] Use Recharts for the line chart (already installed)
- [ ] Show "No data yet" if the exercise has never been used in a completed workout
- [ ] Show the latest value vs. the first recorded value as a summary (e.g., "+15 kg estimated 1RM since Oct 2024")

### Create Custom Exercise

- [ ] Add a "Create Exercise" button on the exercise list page
- [ ] Opens a dialog/sheet with a Conform form:
  - Name (text, required)
  - Category (select, required — auto-sets `progress_metric_type` via `PROGRESS_METRIC_MAP`)
  - Muscle groups (multi-select from `MUSCLE_GROUPS` constant in `lib/workout-constants.ts`)
  - Description (textarea, optional)
  - Image upload (optional — upload to Supabase Storage, save URL)
  - Video URL (text input, optional — must be a valid URL if provided)
- [ ] Zod schema in `lib/validations/exercise.ts`
- [ ] Server action in `app/(protected)/exercises/actions.ts`: validate, set `is_system = false`, `created_by = current user`, auto-set `progress_metric_type` from category
- [ ] On success: close dialog, call `revalidatePath("/exercises")`, invalidate TanStack Query cache, show success toast
- [ ] Rate limit: 10 exercises created per hour per user

### Edit Custom Exercise

- [ ] Edit dialog or page at `app/(protected)/exercises/[id]/edit/page.tsx`
- [ ] Pre-populate form with current values
- [ ] Only allow editing if `created_by` matches current user (check server-side)
- [ ] Server action in `app/(protected)/exercises/actions.ts`: validate, update the row
- [ ] On success: call `revalidatePath("/exercises")`, `revalidatePath(`/exercises/${id}`)`, show success toast

### Delete Custom Exercise

- [ ] `ConfirmDialog` before deletion
- [ ] Server action in `app/(protected)/exercises/actions.ts`:
  1. Verify ownership (`created_by` matches current user)
  2. Attempt hard delete with a try/catch
  3. If the delete throws a Postgres error with code `23503` (foreign key violation — the exercise is referenced by `workout_exercises`): **soft-delete** instead — set `deleted_at = now()`
  4. If the delete succeeds: done (exercise had no references)
- [ ] The soft-deleted exercise disappears from the library and "add exercise" picker, but the FK reference in `workout_exercises` remains valid and historical workout detail pages still display the name
- [ ] On success: call `revalidatePath("/exercises")`, redirect to exercise list, show success toast

### Image Upload

- [ ] Create a Supabase Storage bucket `exercise-images` (public read, authenticated write) — do this in Supabase dashboard
- [ ] Before uploading, compress the image client-side using `browser-image-compression` (`pnpm add browser-image-compression`): max 800px on the longest side, max 200KB output
- [ ] Create a thin wrapper `uploadExerciseImage` in `app/(protected)/exercises/actions.ts` that:
  - Validates the file: max 500KB (server-side safety check), image types only (jpeg, png, webp)
  - Calls the boilerplate's existing `uploadFile()` from `lib/storage/` to handle the actual Supabase Storage upload, targeting the `exercise-images` bucket with path `{user_profile_id}/{uuid}.{ext}`
  - Returns the public URL via `getPublicUrl()` from `lib/storage/`
  - **Do NOT reimplement file upload logic** — the boilerplate's `lib/storage/` already handles sanitization and Supabase Storage interaction
- [ ] Use this action in the create/edit forms
- [ ] Show image preview after upload

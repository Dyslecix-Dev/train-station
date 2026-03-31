# Phase 6c — Workout History, Detail Page & Unit Conversions

## Done-State Check

Before starting, verify Phase 5b outputs exist: auto-save works (sets appear in DB after 30s), complete workout flow works end-to-end (workout status changes to `completed`, `duration_seconds` is calculated).

## Context for Claude Code

This is part 3 of 3 for workout tracking. This phase adds the workout history list, completed workout detail page, the "Repeat Workout" flow, and the unit conversion utility library that's used across the entire app.

---

## Checklist

### Unit Conversion Utilities

- [ ] Create `lib/units.ts` with functions:
  - `kgToLb(kg: number): number` / `lbToKg(lb: number): number`
  - `kmToMi(km: number): number` / `miToKm(mi: number): number`
  - `formatWeight(kg: number, preference: "imperial" | "metric"): string` → "135 lb" or "61.2 kg"
  - `formatDistance(km: number, preference: "imperial" | "metric"): string` → "3.1 mi" or "5.0 km"
  - `formatDuration(seconds: number): string` → "1:23:45" or "45:30" or "0:45"
  - `parseDuration(input: string): number` → seconds (parse "1:23:45", "45:30", "0:45" formats)
  - `parseWeight(input: number, preference: "imperial" | "metric"): number` → always returns kg
  - `parseDistance(input: number, preference: "imperial" | "metric"): number` → always returns km
- [ ] All functions should handle edge cases: zero, negative values, NaN → return 0 or reasonable default
- [ ] Add JSDoc comments
- [ ] Export for use throughout the workout, nutrition, and body stats UI

### Workout History

- [ ] Create page at `app/(protected)/workouts/page.tsx` (server component)
- [ ] Two tabs or sections: "Templates" (link to `/workouts/templates`) and "History"
- [ ] History: list of completed and cancelled workouts, sorted by `started_at` descending
- [ ] Each entry shows: workout name, date (formatted), duration (formatted with `formatDuration`), number of exercises, total completed sets, status badge (completed/cancelled)
- [ ] Pagination using the boilerplate's `paginate()` helper from `lib/db/paginate` for the Drizzle query, combined with nuqs for URL page state (param name `page`, default 1, page size 20). Do not implement offset pagination manually.
- [ ] Filter by: date range (optional, nuqs params `from` and `to`), template used (dropdown, nuqs param `template`)
- [ ] Tap a workout → navigate to workout detail page
- [ ] `EmptyState` when no workouts: "No workouts yet. Start your first workout from a template or create a freestyle workout."

### Workout Detail Page (Completed)

- [ ] Create page at `app/(protected)/workouts/[id]/page.tsx` (server component)
- [ ] Verify the workout belongs to the current user
- [ ] Read-only view of a completed workout
- [ ] Summary header: name, date, duration (formatted), status badge
- [ ] Exercises grouped by section (using `SECTION_LABELS`), each showing all logged sets with their values
- [ ] Display values in user's preferred units (using `formatWeight`, `formatDistance`, `formatDuration` from `lib/units.ts`)
- [ ] "Repeat Workout" button:
  - If the workout has a `template_id` that still exists: start a new workout from that template (calls `startWorkoutFromTemplate`)
  - If `template_id` is null or the template was deleted: re-create the exercise list by copying from this workout's `workout_exercises` (start a freestyle workout pre-populated with the same exercises)
- [ ] Delete workout option with `ConfirmDialog`
- [ ] Server action `deleteWorkout(workoutId)` in `app/(protected)/workouts/actions.ts`: verify ownership, hard delete with cascade. Call `revalidatePath("/workouts")`.

### Reorder Exercises in Active Workout

- [ ] Server action `reorderWorkoutExercises(workoutId, exerciseOrdering[])` — accepts an array of `{ workoutExerciseId, sortOrder, section }` objects and updates all `sort_order` and `section` values in one transaction
- [ ] Called from the auto-save flow (not on every drag)

### Server Actions Summary

All in `app/(protected)/workouts/actions.ts`:

- [ ] `startWorkoutFromTemplate(templateId)` — (from Phase 5a)
- [ ] `startFreeWorkout(name)` — (from Phase 5a)
- [ ] `addExerciseToWorkout(workoutId, exerciseId, section, sortOrder)` — (from Phase 5a)
- [ ] `removeExerciseFromWorkout(workoutExerciseId)` — (from Phase 5a)
- [ ] `saveWorkoutProgress(workoutId, data)` — (from Phase 5b)
- [ ] `completeWorkout(workoutId)` — (from Phase 5b)
- [ ] `cancelWorkout(workoutId)` — (from Phase 5b)
- [ ] `reorderWorkoutExercises(workoutId, exerciseOrdering[])` — new in this phase
- [ ] `deleteWorkout(workoutId)` — new in this phase
- [ ] `repeatWorkout(workoutId)` — start a new workout copying the exercise list from a past workout

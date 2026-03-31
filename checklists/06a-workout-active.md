# Phase 6a — Active Workout: Store, Start Flow & Exercise UI

## Done-State Check

Before starting, verify Phase 4 outputs exist: at least one workout template exists (create one manually if needed for testing), template detail page has a "Start Workout" button.

## Context for Claude Code

This is part 1 of 3 for workout tracking. An active workout is a live session where the user performs exercises, logs sets, and uses rest timers. It can be started from a template (snapshot-on-use) or freestyle (empty, add exercises on the fly). The active workout state lives in Zustand (client-side). This phase covers the Zustand store, starting a workout, and the exercise list UI. Set logging, timers, and auto-save are in Phase 5b. History and detail pages are in Phase 5c.

**Important:** New sets and exercises created during a workout get their IDs via `crypto.randomUUID()` on the client. These same IDs are used as the DB primary key when auto-save persists them. This avoids insert-vs-update ambiguity.

---

## Checklist

### Start Workout Flow

- [ ] "Start Workout" from template detail page → server action `startWorkoutFromTemplate(templateId)`:
  - Create a `workouts` row with: `template_id` = the template's ID, `template_snapshot` = deep-copy the template + exercises as JSONB, `name` = template name, `started_at` = now, `status` = `in_progress`
  - Pre-populate `workout_exercises` rows from the template's exercises (same sections, order, rest timers)
  - **Do NOT pre-populate `workout_sets` rows.** The UI shows empty set rows locally in Zustand. Set rows are only written to the DB when auto-save fires or when the user marks a set complete.
  - Return the new workout ID
- [ ] "Start Empty Workout" button on the workouts page → server action `startFreeWorkout(name)`:
  - Prompt for a name via dialog before starting (or default "Workout - {date}")
  - Create a `workouts` row with: `template_id` = null, `template_snapshot` = null, `name` = user-entered, `started_at` = now, `status` = `in_progress`
  - No pre-populated exercises
  - Return the new workout ID
- [ ] Both actions: redirect to the active workout page: `app/(protected)/workouts/active/[id]/page.tsx`
- [ ] Server actions in `app/(protected)/workouts/actions.ts`

### Active Workout Page

- [ ] Create page at `app/(protected)/workouts/active/[id]/page.tsx`
- [ ] This is a `"use client"` page (heavy interactivity)
- [ ] On mount: fetch the workout data from the server, verify the workout belongs to the current user and `status = in_progress`
- [ ] If no active workout or wrong status, redirect to `/workouts`
- [ ] Initialize the Zustand store with the fetched data

### Active Workout Zustand Store

- [ ] Create `lib/stores/active-workout.ts` with state:
  - `workoutId` — string
  - `exercises` — array of exercise objects with their sets (each set has a client-generated UUID)
  - `elapsedSeconds` — total workout duration (counts up from 0)
  - `isTimerRunning` — boolean
  - `restTimer` — `{ isActive: boolean, remainingSeconds: number, totalSeconds: number }` for countdown
  - `currentExerciseIndex` — number (which exercise is "focused")
- [ ] Actions:
  - `initializeFromServer(workoutData)` — load workout data into store. For exercises that came from the server (have DB IDs), keep those IDs. For any new empty sets added locally, generate IDs via `crypto.randomUUID()`.
  - `addExercise(exerciseId, exerciseName, category, section)` — add exercise to workout with a `crypto.randomUUID()` as the workout_exercise ID
  - `removeExercise(workoutExerciseId)` — remove exercise
  - `reorderExercise(workoutExerciseId: string, newSortOrder: number, newSection: SectionEnum)` — move exercise to a new position (and optionally a new section)
  - `addSet(workoutExerciseId)` — add a new empty set with a `crypto.randomUUID()` as the set ID. Optionally pre-fill weight/reps from the previous set.
  - `removeSet(setId)` — remove a set
  - `updateSet(setId, fields)` — update set fields (weight, reps, duration, distance, rpe, rir, is_warmup_set, completed)
  - `startRestTimer(seconds)` — start countdown
  - `tickRestTimer()` — decrement by 1 second
  - `cancelRestTimer()` — stop and reset
  - `tickElapsed()` — increment elapsed by 1 second
  - `toggleTimer()` — pause/resume elapsed timer
  - `getSerializableState()` — return the full state as a plain object for auto-save

### Workout Elapsed Timer

- [ ] Start counting up from 0 when the workout page loads
- [ ] Display as `HH:MM:SS` at the top of the page (always visible, sticky header)
- [ ] Pause/resume toggle button
- [ ] Use `setInterval` in a `useEffect`, call `tickElapsed()` every second
- [ ] Clean up interval on unmount

### Exercise List UI (Active Workout)

- [ ] Show exercises grouped by section (warm_up → main → cooldown) in a vertical scrolling list
- [ ] Section headers use `SECTION_LABELS` from `lib/workout-constants.ts`
- [ ] Each exercise card shows:
  - Exercise name + category badge
  - Section label
  - Collapsible set table (expanded for current exercise, collapsed for others)
  - "Add Set" button
  - Move up/down buttons (or drag to reorder)
  - Remove exercise button (with `ConfirmDialog`)
- [ ] "Add Exercise" floating button → opens same exercise picker as templates but adds to the workout directly
- [ ] When adding from freestyle, let user pick the section (warm_up, main, cooldown)
- [ ] Exercise picker filters out exercises where `deleted_at IS NOT NULL`

### Server Actions (Start Workout Only)

- [ ] `startWorkoutFromTemplate(templateId)` — in `app/(protected)/workouts/actions.ts`
- [ ] `startFreeWorkout(name)` — in `app/(protected)/workouts/actions.ts`
- [ ] `addExerciseToWorkout(workoutId, exerciseId, section, sortOrder)` — add exercise mid-workout (creates `workout_exercises` row)
- [ ] `removeExerciseFromWorkout(workoutExerciseId)` — remove exercise (cascades to any persisted sets)
- [ ] All actions: auth check, ownership check, rate limited

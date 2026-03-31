# Phase 6b — Active Workout: Sets, Timers, Auto-Save & Completion

## Done-State Check

Before starting, verify Phase 5a outputs exist: active workout Zustand store exists at `lib/stores/active-workout.ts`, exercise list renders on the active workout page, starting a workout from a template creates the correct DB rows.

## Context for Claude Code

This is part 2 of 3 for workout tracking. This phase adds set logging (the core data entry UI), the rest timer, auto-save to the server, and the complete/cancel flows. All weight stored in kg, distance in km, duration in seconds internally.

**Important:** Set rows in the Zustand store all have client-generated UUIDs (`crypto.randomUUID()`). The auto-save upsert uses these IDs — INSERT on first save, UPDATE on subsequent saves. The `saveWorkoutProgress` server action must handle both.

---

## Checklist

### Set Logging UI

- [ ] Each set is a row in a table/list within its exercise card:
  - Set number (auto-incremented)
  - Warm-up set toggle (checkbox or badge)
  - Weight input (show in user's preferred unit, convert to kg on save)
  - Reps input (integer)
  - Duration input (MM:SS format — convert to total seconds)
  - Distance input (show in user's preferred unit, convert to km on save)
  - RPE input (1–10 slider or dropdown)
  - RIR input (0–5 dropdown)
  - Completed checkbox (checkmark to mark set as done)
- [ ] NOT all fields visible at once — show/hide based on exercise category:
  - Strength: weight, reps, RPE, RIR (duration/distance hidden)
  - Cardio: duration, distance (weight/reps hidden)
  - Bodyweight: reps, duration (weight/distance hidden, unless user explicitly shows them)
  - Flexibility: duration (everything else hidden)
  - Let user manually show/hide any column via a "..." menu on the set table header
- [ ] "Add Set" button below the set table → calls `addSet(workoutExerciseId)` in the Zustand store. New set gets a `crypto.randomUUID()` ID and optionally pre-fills from the previous set's values.
- [ ] Swipe-to-delete or delete icon on each set row → calls `removeSet(setId)` in Zustand store
- [ ] All set changes update the Zustand store immediately (no server call per keystroke)

### Rest Timer

- [ ] When a set is marked as completed, auto-start the rest timer using:
  1. The set's `rest_seconds` if configured, OR
  2. The exercise's `default_rest_seconds` from the template, OR
  3. No timer if neither is set
- [ ] Countdown display: large circular or linear progress indicator with seconds remaining
- [ ] Audio/vibration alert when timer reaches 0 (use Web Audio API for audio, Vibration API for haptic)
- [ ] "Skip" button to dismiss early
- [ ] "+15s" / "−15s" adjustment buttons during countdown
- [ ] Rest timer between exercises: triggered when completing the last set of an exercise, uses `rest_between_exercises_seconds`
- [ ] Timer is overlay/toast-style — doesn't block interacting with the workout
- [ ] Timer state lives in the Zustand store (`restTimer` object)

### Auto-Save

- [ ] Every 30 seconds, sync the Zustand state to the server:
  - Call `saveWorkoutProgress(workoutId, exercises, sets)` server action
  - This action upserts all `workout_exercises` and `workout_sets` rows
  - The upsert uses `ON CONFLICT (id) DO UPDATE` — works because all IDs are pre-generated client-side
- [ ] Also trigger a save on every set completion (when `completed` is toggled to true)
- [ ] Show a subtle "Saved" indicator (small text or icon, e.g., a check with timestamp)
- [ ] Show "Saving..." during the save, "Saved" on success, "Save failed — retrying" on error (retry once)
- [ ] On page unload (`beforeunload`), attempt a final save via `navigator.sendBeacon` or a synchronous fetch

### Complete Workout

- [ ] "Finish Workout" button (prominent, bottom of page)
- [ ] Before completing, show a summary dialog:
  - Total duration (from elapsed timer)
  - Number of exercises with at least one completed set
  - Total sets completed
  - Total volume (sum of weight × reps for strength exercises)
  - Any incomplete sets (warn but don't block)
- [ ] Server action `completeWorkout(workoutId)` in `app/(protected)/workouts/actions.ts`:
  - Final save of all exercises/sets (same upsert as auto-save)
  - Set `status = completed`, `completed_at = now()`
  - Calculate `duration_seconds = EXTRACT(EPOCH FROM (now() - started_at))` — this is the server-derived duration, not the client timer
  - **Update streak**: get the user's timezone from `user_profiles.timezone`, resolve "today" in that timezone, call `updateStreak(userId, today)` (see Phase 9 for the streak utility)
  - Call `revalidatePath("/workouts")`
- [ ] Show success toast, redirect to workout detail page (`/workouts/${workoutId}`)

### Cancel Workout

- [ ] "Cancel Workout" option in a dropdown menu or as a secondary action
- [ ] `ConfirmDialog`: "Are you sure? This will discard all progress."
- [ ] Server action `cancelWorkout(workoutId)`: set `status = cancelled`, keep the data but mark as cancelled
- [ ] Call `revalidatePath("/workouts")`
- [ ] Redirect to `/workouts`

### Server Actions

- [ ] In `app/(protected)/workouts/actions.ts`:
  - `saveWorkoutProgress(workoutId, data)` — bulk upsert exercises and sets. Uses `ON CONFLICT (id) DO UPDATE` for both `workout_exercises` and `workout_sets`. Must be idempotent.
  - `completeWorkout(workoutId)` — finalize (see above)
  - `cancelWorkout(workoutId)` — mark cancelled
- [ ] All actions: auth check, ownership check, rate limited

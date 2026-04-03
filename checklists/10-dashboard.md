# Phase 10 — Dashboard

## Done-State Check

Before starting, verify all four pillars work: a workout can be completed (Phase 6c), a meal can be logged (Phase 7), a sleep entry can be logged (Phase 8), a mood entry can be logged (Phase 9).

## Context for Claude Code

The dashboard is the home page after login. It provides a glanceable "today" summary across all four pillars (workouts, nutrition, sleep, mental health) plus weekly trend sparklines and a consistency streak. Keep it simple and fast — this is a server component that fetches all data in parallel. No complex analytics for v1. Users should be able to understand their day in under 5 seconds.

---

## Checklist

### Dashboard Page

- [ ] Create page at `app/(protected)/dashboard/page.tsx` (server component)
- [ ] This is the default redirect after login and after onboarding
- [ ] Fetch today's data for all pillars in parallel using `Promise.all`
- [ ] **Resolve "today" using the user's timezone** from `user_profiles.timezone` — a user in PST at 11pm should see "today" as that PST date, not the UTC date
- [ ] Show user's name in a greeting: "Good morning, {name}" (time-of-day aware, using user's timezone)
- [ ] Responsive layout: stack cards vertically on mobile, 2-column grid on desktop

### Today's Workout Card

- [ ] Show: did the user work out today? (yes/no status)
- [ ] If yes: workout name, duration (formatted), number of exercises, total sets
- [ ] If in-progress: "Workout in progress — {name}" with a "Resume" link to `/workouts/active/{id}`
- [ ] If no: "No workout today" with a "Start Workout" CTA
- [ ] Query: `workouts` where `user_id = current` and `started_at` is today (in user's timezone)
- [ ] Link to: `/workouts`

### Today's Nutrition Card

- [ ] Show: calories consumed vs. target (progress ring or bar)
  - Consumed = sum of `calories_snapshot` from `meal_logs` for today — **never join to `foods` for totals**
  - Target = `user_profiles.calorie_target`
- [ ] Macro summary: protein / carbs / fat (small text or mini bars) — sum `_snapshot` columns
- [ ] Water intake: amount vs. `user_profiles.water_target_ml` — **not hardcoded 2000ml**
- [ ] If nothing logged: "No meals logged yet" with "Log Meal" CTA
- [ ] Query: `meal_logs` where `date = today` (snapshot columns only), `water_logs` where `date = today`
- [ ] Link to: `/nutrition`

### Today's Sleep Card

- [ ] Show: last night's sleep duration + quality rating (emoji)
- [ ] If not logged: "Sleep not logged" with "Log Sleep" CTA
- [ ] Query: `sleep_logs` where `user_id = current` and `date = today` (wake date convention)
- [ ] Link to: `/sleep`

### Today's Mood Card

- [ ] Show: today's mood emoji + emotion badges
- [ ] If not logged: "How are you feeling?" with "Log Mood" CTA
- [ ] Query: `mood_logs` where `date = today`
- [ ] Link to: `/mental-health`

### Weekly Trends Section

- [ ] Below the "today" cards, show a "This Week" section
- [ ] Four mini sparkline charts (Recharts, minimal — no axes, just the line/bars):
  - Workouts: number of workouts per day this week (bar sparkline, 7 bars)
  - Nutrition: daily calories this week (line sparkline, target as dotted line)
  - Sleep: duration per night this week (bar sparkline)
  - Mood: mood score per day this week (line sparkline)
- [ ] Each sparkline is tappable → navigates to that feature's full page
- [ ] If fewer than 2 days of data for a sparkline: show "Not enough data yet" instead

### Consistency Streak

- [ ] Read `current_streak` and `last_streak_date` directly from `user_profiles` — no table-scan calculation at read time
- [ ] Display as a simple badge or counter: "You've logged {N} days in a row"
- [ ] If streak is 0 or `last_streak_date` is null: don't show the streak section
- [ ] **No streak penalty messaging** — if the streak broke, just don't show it. Don't say "streak broken."

### Streak Utility

- [ ] Create `lib/streak.ts` with a shared `updateStreak(userId: string, logDate: Date)` utility:
  - Fetch `current_streak`, `last_streak_date`, and `timezone` from `user_profiles`
  - Resolve "today" and "yesterday" using the user's `timezone` (use `Intl.DateTimeFormat` or a lightweight date library)
  - The `logDate` parameter should already be in the user's local date
  - If `last_streak_date === today`: already counted today, no-op (idempotent — safe to call multiple times per day from different logging actions)
  - If `last_streak_date === yesterday`: increment `current_streak` by 1, set `last_streak_date = today`
  - If `last_streak_date` is older than yesterday (or null): reset `current_streak = 1`, set `last_streak_date = today`
  - Update `user_profiles` with new values
- [ ] This utility is called from: `completeWorkout`, `logMeal`, `logWater`, `logSleep`, `logMood`
- [ ] It must be imported from `lib/streak.ts` — do NOT put it in a `"use server"` file since it's a utility called by server actions, not a server action itself

### Body Stats Quick View

- [ ] If the user has logged body stats, show current weight (in preferred units via `lib/units.ts`) and trend arrow (up/down/stable vs. 7 days ago)
- [ ] Small text, not a full card — this is supplementary info
- [ ] If no body stats logged: don't show this section

### Performance

- [ ] All data fetching happens server-side in the page component (no client-side waterfalls)
- [ ] Use `Promise.all` to parallelize all queries
- [ ] Use `LoadingSkeleton` components while the page loads
- [ ] Target: dashboard should load in under 1 second on a warm connection
- [ ] Export page `metadata` using the app name from `lib/config.ts` — do not hardcode the app name

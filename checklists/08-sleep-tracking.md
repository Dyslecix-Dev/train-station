# Phase 8 — Sleep Tracking

## Done-State Check

Before starting, verify Phase 2b outputs exist: `sleep_logs` table exists with RLS policies enabled.

## Context for Claude Code

Sleep tracking is a simple manual log with bedtime, wake time (duration derived), and a 1–5 quality rating. One entry per day. We show a trend chart and weekly averages. This is a lightweight feature — keep the UI minimal. Use Conform + Zod for forms, server actions for mutations, Recharts for charts.

---

## Checklist

### Sleep Log Page

- [ ] Create page at `app/(protected)/sleep/page.tsx`
- [ ] Date selector at top (default: today, navigate by day). Use the shared `useDateParam` hook from `lib/hooks/use-date-param.ts` (param name `date`).
- [ ] If an entry exists for the selected date: show it with Edit/Delete options
- [ ] If no entry: show "Log Sleep" CTA

### Log Sleep Form

- [ ] "Log Sleep" button opens a sheet or inline form with:
  - Date (date picker, **default: today** — the wake date convention. Show a helper label: "Date you woke up")
  - Bedtime (time picker — e.g., "10:30 PM")
  - Wake time (time picker — e.g., "6:15 AM")
  - Duration (auto-calculated and displayed, not editable)
  - Quality (1–5 rating: radio group or star/emoji selector — labels: Awful, Poor, Fair, Good, Excellent)
  - Notes (textarea, optional, max 500 chars)
- [ ] Zod schema in `lib/validations/sleep.ts`: date required, bedtime required, wake_time required, quality 1–5 required, notes optional max 500

### Timestamp Construction Logic

The server action must construct full timestamps from the date + time inputs:

- [ ] If the bedtime time-of-day is **greater than** the wake time time-of-day (e.g., bedtime 10:30 PM, wake 6:15 AM — the normal overnight case):
  - `bedtime` timestamp = `(selected date − 1 day)` + bedtime time
  - `wake_time` timestamp = `selected date` + wake time time
- [ ] If the bedtime time-of-day is **less than or equal to** the wake time time-of-day (e.g., bedtime 1:00 PM, wake 3:00 PM — a daytime nap):
  - `bedtime` timestamp = `selected date` + bedtime time
  - `wake_time` timestamp = `selected date` + wake time time
- [ ] Calculate `duration_minutes = Math.round((wake_time - bedtime) / 60000)`
- [ ] **Never accept `duration_minutes` as a form input** — always derive it server-side

### Server Action: Log Sleep

- [ ] Create `app/(protected)/sleep/actions.ts` with `logSleep(formData)`:
  - Parse and validate with Zod
  - Construct timestamps using the logic above
  - Calculate `duration_minutes`
  - Upsert into `sleep_logs` (one per user per date)
  - **Update streak**: get user's timezone, resolve "today", call `updateStreak(userId, today)`
  - Call `revalidatePath("/sleep")`
- [ ] On success: close form, show toast

### Edit / Delete Sleep Entry

- [ ] Edit: pre-populate the form with existing values. The edit server action must **recalculate `duration_minutes`** from the updated bedtime/wake_time — never accept the old or form-supplied duration value.
- [ ] Delete: `ConfirmDialog` → server action `deleteSleepLog(id)` → verify ownership, delete
- [ ] Call `revalidatePath("/sleep")` on success
- [ ] Show toast on success

### Sleep Trend Chart

- [ ] Below the daily view, show a line chart (Recharts) with two y-axes:
  - Duration (hours) — bar or line
  - Quality (1–5) — line with dots
- [ ] Wrap in Suspense with `LoadingSkeleton` fallback
- [ ] Default range: last 14 days
- [ ] Range selector: 14d, 30d, 90d
- [ ] X-axis: dates. Show "no data" for days without entries (gaps in the line are fine)

### Weekly Average Card

- [ ] Show a summary card:
  - Average sleep duration this week (e.g., "7h 12m")
  - Average quality this week (e.g., "3.8 / 5")
  - Comparison to previous week (e.g., "+23 min", "−0.2 quality")
- [ ] Calculate from `sleep_logs` for the current week

### Server Actions

All in `app/(protected)/sleep/actions.ts`:

- [ ] `logSleep(formData)` — validate, construct timestamps, calculate duration_minutes, upsert; call `updateStreak`
- [ ] `deleteSleepLog(id)` — validate ownership, delete
- [ ] `getSleepTrend(days)` — query sleep_logs for the user, last N days, return array
- [ ] `getSleepWeeklyAverage()` — calculate current + previous week averages
- [ ] All actions: authenticated, ownership-checked, call `revalidatePath`

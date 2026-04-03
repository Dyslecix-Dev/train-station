# Phase 9 — Mental Health Tracking

## Done-State Check

Before starting, verify Phase 2b outputs exist: `mood_logs` table exists with RLS policies enabled, `ALLOWED_EMOTIONS` is exported from `lib/db/schema/mental-health.ts`.

## Context for Claude Code

Mental health tracking has three components: a 1–5 mood score, multi-select emotion tags from a fixed set, and an optional free-form journal entry. One entry per day. We show trends and weekly patterns. The journal is plain text stored as-is. Privacy is handled by Supabase RLS (user can only see their own data). Keep the UI warm and inviting — this is a sensitive feature.

**Important:** Import `ALLOWED_EMOTIONS` from `lib/db/schema/mental-health.ts`. Never redefine the emotion list in the UI or Zod schema — always import from the single source of truth.

---

## Checklist

### Mental Health Page

- [ ] Create page at `app/(protected)/mental-health/page.tsx`
- [ ] Date selector at top (default: today, navigate by day). Use the shared `useDateParam` hook from `lib/hooks/use-date-param.ts` (param name `date`).
- [ ] If an entry exists for the selected date: show mood, emotions, and journal with Edit/Delete options
- [ ] If no entry: show "How are you feeling today?" CTA

### Log Mood Form

- [ ] "Log Mood" opens a sheet or full-page form with:
  - Date (date picker, default: today)
  - Mood score (1–5): visual selector — use emoji or icons with labels:
    - 1 = Very Low (😞), 2 = Low (😕), 3 = Neutral (😐), 4 = Good (🙂), 5 = Very Good (😊)
  - Emotion tags (multi-select chips/badges — **import `ALLOWED_EMOTIONS` from `lib/db/schema/mental-health.ts`**, do not redefine the list):
    - anxious, stressed, calm, energized, motivated, tired, irritable, happy, sad, neutral
    - User can select multiple (at least 1 required)
  - Journal entry (textarea, optional, max 2000 chars, placeholder: "Write about how you're feeling...")
- [ ] Zod schema in `lib/validations/mood.ts`: date required, mood_score 1–5 required, emotions array min 1 from `ALLOWED_EMOTIONS`, journal_entry optional max 2000
- [ ] Server action `logMood(formData)` in `app/(protected)/mental-health/actions.ts`:
  - Validate with Zod
  - Upsert into `mood_logs` (one per user per date)
  - **Update streak**: get user's timezone, resolve "today", call `updateStreak(userId, today)`
  - Call `revalidatePath("/mental-health")`
- [ ] On success: close form, show encouraging toast (e.g., "Entry saved. Taking time to reflect is a great habit.")

### Display Mood Entry

- [ ] Show the mood as the emoji/icon with label
- [ ] Show selected emotions as colored badges/chips
- [ ] Show journal entry as a text block (preserve line breaks via `whitespace-pre-wrap`)
- [ ] Edit button → re-opens the form pre-populated
- [ ] Delete button → `ConfirmDialog` → server action

### Mood Trend Chart

- [ ] Line chart (Recharts) showing mood score over time
- [ ] Wrap in Suspense with `LoadingSkeleton` fallback
- [ ] Default range: last 14 days
- [ ] Range selector: 14d, 30d, 90d
- [ ] Y-axis: 1–5 with emoji labels
- [ ] Color the line or area based on mood (gradient from red/orange at 1 to green at 5)

### Emotion Frequency

- [ ] Below the trend chart, show emotion frequency for the selected range
- [ ] Bar chart or tag cloud: how often each emotion was selected
- [ ] E.g., "Motivated: 8 times, Tired: 6 times, Calm: 5 times" for the last 14 days

### Weekly Summary Card

- [ ] Average mood score this week
- [ ] Most frequent emotion this week
- [ ] Comparison to previous week
- [ ] Number of journal entries this week (encourage consistency)

### Server Actions

All in `app/(protected)/mental-health/actions.ts`:

- [ ] `logMood(formData)` — validate, upsert; call `updateStreak`
- [ ] `deleteMoodLog(id)` — validate ownership, delete
- [ ] `getMoodTrend(days)` — query mood_logs for last N days
- [ ] `getEmotionFrequency(days)` — aggregate emotion tags for last N days
- [ ] `getMoodWeeklyAverage()` — current + previous week
- [ ] All actions: authenticated, ownership-checked, call `revalidatePath`

### UX Considerations

- [ ] Use warm, non-clinical language throughout
- [ ] Don't show "streaks" for mental health specifically (pressure to log daily is counterproductive) — the global streak still counts mood logs, but the mental health page itself doesn't display streak info
- [ ] Journal entry should feel like a safe space — no word count pressure, no prompts beyond the placeholder
- [ ] Avoid data-heavy visualizations that might feel like scoring emotions

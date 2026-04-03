# Phase 11 — Settings & Polish

## Done-State Check

Before starting, verify Phase 10 outputs exist: dashboard renders at `/dashboard` with data from all four pillars, streak counter displays correctly.

## Context for Claude Code

Settings page covers profile editing, unit preferences, recalculating nutrition targets, data export, quick log flows, and account deletion. Also includes general UX polish: loading states, error states, responsive refinements. This phase ties up loose ends from all previous features.

---

## Checklist

### Settings Page

- [ ] Create page at `app/(protected)/settings/page.tsx`
- [ ] Organize into sections with clear headings (use Separator components between sections)

### Profile Section

- [ ] Display and edit: display name, age, height, weight, sex, activity level, primary goal
- [ ] Reuse Zod schemas from `lib/validations/onboarding.ts`
- [ ] Height and weight inputs respect the current `units_preference` (convert via `lib/units.ts`)
- [ ] Server action `updateProfile(formData)` in `app/(protected)/settings/actions.ts`: validate, update `user_profiles`
- [ ] Call `revalidatePath("/settings")` and `revalidatePath("/dashboard")` on success
- [ ] Show toast "Profile updated"

### Timezone Setting

- [ ] Display current timezone from `user_profiles.timezone`
- [ ] Allow changing it (select/autocomplete with common IANA timezone names)
- [ ] Server action `updateTimezone(timezone)`: update `user_profiles.timezone`
- [ ] Show a note: "Used for streak tracking and 'today' calculations. Auto-detected during onboarding."

### Water Target

- [ ] Number input: daily water goal in ml (or oz in imperial — convert to ml before saving)
- [ ] Read current value from `user_profiles.water_target_ml` — **never hardcode 2000ml**
- [ ] Min: 500ml. Max: 8000ml.
- [ ] Server action `updateWaterTarget(amount_ml)`: update `user_profiles.water_target_ml`
- [ ] Show a note: "Used as your daily target on the nutrition page and dashboard."
- [ ] Call `revalidatePath("/settings")` and `revalidatePath("/nutrition")`

### Units Preference

- [ ] Toggle: Imperial / Metric
- [ ] Server action `updateUnitsPreference(preference)`: update `user_profiles.units_preference`
- [ ] On change: all displayed values across the app reflect the new preference on next render
- [ ] Show a note: "All data is stored in metric. This only affects how values are displayed."
- [ ] Call `revalidatePath("/")` (clears all page caches since units affect every page)

### Recalculate Nutrition Targets

- [ ] Button: "Recalculate Targets"
- [ ] Uses `calculateTargets` from `lib/tdee.ts` with the user's current profile values (including the sanity clamping)
- [ ] Shows a confirmation dialog with old vs. new values before saving
- [ ] Server action `recalculateTargets()`: recalculate and update `calorie_target`, `protein_target_g`, `carbs_target_g`, `fat_target_g`, `fiber_target_g` in `user_profiles`
- [ ] Manual override fields: allow the user to directly edit any target value (number inputs) without recalculating
- [ ] Server action `updateTargetsManually(targets)`: update individual target values
- [ ] Call `revalidatePath("/settings")` and `revalidatePath("/nutrition")`

### Theme Setting

- [ ] Toggle: Light / Dark / System
- [ ] Already handled by next-themes — just expose the toggle in settings UI
- [ ] Persist via next-themes (uses cookie/localStorage)

### Data Export

- [ ] Button: "Export My Data"
- [ ] Server action `exportUserData()` in `app/(protected)/settings/actions.ts`:
  - Queries all user data: profile, workouts (with exercises and sets), templates, meal_logs (with food names), water_logs, body_stats_logs, sleep_logs, mood_logs, custom exercises, custom foods
  - Assembles into a structured JSON object with:
    - `version: 1` at the root (for future schema compatibility)
    - `exported_at: new Date().toISOString()`
    - Sections for each data type
  - Returns as a downloadable JSON file via `Response` with `Content-Disposition: attachment; filename="fitness-data-export-{date}.json"`
- [ ] Show loading state while generating
- [ ] Rate limit: 3 exports per hour per user

### Account Deletion

- [ ] Button: "Delete Account" (destructive styling, at the bottom of settings)
- [ ] `ConfirmDialog` with text input: user must type "DELETE" to confirm
- [ ] Server action `deleteAccount()` in `app/(protected)/settings/actions.ts`:
  - Delete the `user_profiles` row (cascades to all related data due to foreign keys)
  - Call `supabase.auth.admin.deleteUser(userId)` using the service role key to delete the auth user
  - Sign out the session
  - Redirect to `/login`
- [ ] Show a warning: "This will permanently delete all your data including workouts, nutrition logs, and settings. This cannot be undone."

### Quick Log Flows

- [ ] Create a "Quick Log" floating action button (FAB) or bottom sheet trigger, accessible from any page via the bottom navigation
- [ ] Quick Log options (each opens a minimal form in a sheet):
  - **Quick Meal**: meal type (select), food search (simplified — recent foods only), servings, done
  - **Quick Water**: preset buttons (250ml, 500ml, custom), done
  - **Quick Weight**: weight input in user's units, today's date, done
  - **Quick Sleep**: bedtime, wake time, quality, done
  - **Quick Mood**: mood 1–5, emotion tags, done (no journal)
- [ ] Each quick log calls the same server actions as the full forms
- [ ] The point is speed: each quick log should be completable in under 10 seconds

### Notification Preferences (Placeholder for v2)

- [ ] Show a "Notifications" section in settings
- [ ] Text: "Push notifications coming soon. We'll let you know when workout reminders and meal logging nudges are available."
- [ ] No actual functionality — just reserves the UI space

### Global UX Polish

- [ ] Verify all pages have proper loading states (`LoadingSkeleton` components)
- [ ] Verify all pages have proper empty states (`EmptyState` component)
- [ ] Verify all destructive actions have `ConfirmDialog`
- [ ] Verify all forms show validation errors inline (Conform error display)
- [ ] Verify all server actions show toast on success and on error
- [ ] Verify all server actions call `revalidatePath` for affected pages
- [ ] Verify all pages are responsive (mobile-first, looks good on desktop too)
- [ ] Verify dark mode works on all pages (no hardcoded colors, all using CSS variables or Tailwind classes)
- [ ] Verify bottom navigation highlights the active route
- [ ] Add TanStack Query **optimistic updates** for high-frequency actions: set completion toggle, water log quick-add/remove, meal log remove
- [ ] Add page titles using Next.js `metadata` exports on each page — import the app name from `lib/config.ts` for the title template (e.g., `"Dashboard | {appName}"`)
- [ ] Add `<meta name="description">` for each page — import the app description from `lib/config.ts`

### Server Actions

All in `app/(protected)/settings/actions.ts`:

- [ ] `updateProfile(formData)` — validate, update user_profiles
- [ ] `updateTimezone(timezone)` — update timezone
- [ ] `updateUnitsPreference(preference)` — update units_preference
- [ ] `updateWaterTarget(amount_ml)` — update water_target_ml
- [ ] `recalculateTargets()` — recalculate and update targets
- [ ] `updateTargetsManually(targets)` — update individual target values
- [ ] `exportUserData()` — assemble and return JSON
- [ ] `deleteAccount()` — delete all data + auth user
- [ ] All actions: authenticated, rate limited, call `revalidatePath`

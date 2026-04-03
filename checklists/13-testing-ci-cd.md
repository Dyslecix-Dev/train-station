# Phase 13 — Testing & CI/CD

## Done-State Check

Before starting, verify all previous phases are complete: service worker activates (Phase 12), offline workout flow works, all features are functional.

## Context for Claude Code

The boilerplate already has Vitest, Testing Library, Playwright, Lighthouse CI, MSW, and GitHub Actions configured. This phase ensures meaningful test coverage across the app. Focus on testing business logic (TDEE calculations, unit conversions, 1RM formulas, streak logic), critical server actions (auth guards, ownership checks, soft-delete fallback), form validation, and key user flows (onboarding, workout, meal logging). Don't aim for 100% coverage — aim for confidence that the core flows work.

---

## Checklist

### Unit Tests (Vitest)

#### Utility Functions

- [ ] Test `lib/tdee.ts`:
  - `calculateBMR` — test for male, female, other/average, edge cases (minimum age 13, extreme weights)
  - `calculateTDEE` — test all 5 activity levels
  - `calculateTargets` — test all 5 goals, verify macro math (protein + carbs + fat calories ≈ total calories), **verify sanity clamping** (e.g., age=13 + weight=500kg + extremely active should still produce clamped values within 1200–6000 cal range)
- [ ] Test `lib/units.ts`:
  - `kgToLb` / `lbToKg` — round-trip accuracy (convert kg→lb→kg, verify within 0.01)
  - `kmToMi` / `miToKm` — round-trip accuracy
  - `formatWeight` — imperial and metric output, edge case: 0 kg
  - `formatDistance` — imperial and metric output, edge case: 0 km
  - `formatDuration` — various second values (0, 45, 3600, 86400)
  - `parseDuration` — various string inputs ("1:23:45", "45:30", "0:45", "", "garbage")
  - Edge cases: NaN, negative numbers → should return 0 or reasonable default
- [ ] Test `lib/streak.ts` (`updateStreak`):
  - First log ever (null `last_streak_date`) → streak = 1
  - Log same day twice → streak unchanged (idempotent)
  - Log on consecutive days → streak increments
  - Gap of 2+ days → streak resets to 1
  - **Timezone edge case**: user in `America/Los_Angeles` (UTC-7) logs at 11pm local = 6am UTC next day. Verify streak resolves to the correct local date, not UTC date.
  - **Timezone edge case**: user in `Pacific/Auckland` (UTC+12) logs at 1am local = 1pm previous day UTC. Verify streak uses local date.
- [ ] Test exercise progress calculations:
  - Epley 1RM formula: `weight × (1 + reps / 30)` — verify with known values (e.g., 100kg × 5 reps = 116.67)
  - Pace calculation: `duration / distance` — handle division by zero (distance = 0 → return Infinity or null)
  - Edge cases: zero weight, zero reps, zero distance
- [ ] Test `lib/usda.ts` nutrient parsing / serving normalization:
  - USDA item with `servingSize = 28`, `nutrientPer100g = 500 kcal` → `calories per serving = 140`
  - USDA item with null `servingSize` → defaults to 100g serving
  - Missing nutrient (e.g., no fiber entry) → returns null, not 0

#### Zod Schemas

- [ ] Test all Zod validation schemas with valid and invalid inputs:
  - Onboarding schema (age bounds 13–120, height/weight bounds, enum values)
  - Template schema (name length min 1 / max 100, exercise array min 1)
  - Workout set schema (optional fields, RPE 1–10, RIR 0–5, out-of-range values rejected)
  - Meal log schema (servings > 0, valid meal types from `MEAL_TYPES`, invalid meal type rejected)
  - Sleep log schema (quality 1–5, out-of-range rejected)
  - Mood log schema (mood 1–5, emotions must be from `ALLOWED_EMOTIONS`, unknown emotion rejected)
  - Custom food schema (required fields present, numeric bounds ≥ 0)
  - Custom exercise schema (required fields, category → progress_metric_type mapping from `PROGRESS_METRIC_MAP`)

#### Zustand Stores

- [ ] Test `lib/stores/active-workout.ts`:
  - `addExercise` — adds to correct position, generates a UUID ID
  - `removeExercise` — removes and updates indices
  - `reorderExercise` — correct order after move, section change works
  - `addSet` — appends to correct exercise, generates a UUID ID, optionally pre-fills from previous set
  - `updateSet` — merges fields correctly (partial update)
  - `removeSet` — removes the correct set
  - `startRestTimer` / `tickRestTimer` — countdown logic, reaches 0
  - `tickElapsed` — increments correctly

### Component Tests (Testing Library)

#### Shared Components

- [ ] Test `ConfirmDialog` — renders title/description, calls onConfirm/onCancel
- [ ] Test `EmptyState` — renders message and CTA
- [ ] Test `PageHeader` — renders title, subtitle, action button
- [ ] Test `LoadingSkeleton` — renders correct variant

#### Feature Components

- [ ] Test onboarding step navigation — step 1 → 2 → 3 → 4, back navigation works
- [ ] Test exercise search/filter — search input filters list, category tabs filter
- [ ] Test set logging row — inputs update Zustand state, completed checkbox works
- [ ] Test rest timer display — shows countdown, skip button works
- [ ] Test food search — switching between Recent/Search/Custom tabs
- [ ] Test mood selector — selecting mood score and emotion tags (from `ALLOWED_EMOTIONS`)
- [ ] Test sleep form — bedtime/wake time calculates duration, **nap case** (bedtime 1pm, wake 3pm = same-day timestamps, not day-subtracted)

#### Accessibility

- [ ] Run `axe-core` assertions on:
  - Dashboard page
  - Onboarding wizard
  - Active workout page
  - Nutrition daily view
  - All dialog/sheet components
- [ ] Verify all form inputs have associated labels (including compact set logging table rows)
- [ ] Verify all interactive elements are keyboard accessible
- [ ] Verify color contrast meets WCAG AA (especially mood emoji colors and progress bars in both light and dark mode)
- [ ] **Active workout specific a11y**:
  - Rest timer countdown is announced to screen readers (use `aria-live="polite"` region)
  - Set inputs in compact table layout have `aria-label` attributes identifying the exercise and set number
  - Exercise reorder (move up/down buttons) is keyboard-accessible and announces the new position

### API Mocking (MSW)

- [ ] Create MSW handlers in `tests/mocks/handlers.ts` for:
  - USDA FoodData Central API — mock search and detail responses
  - Supabase Auth — mock login, sign-up, sign-out, getUser, getClaims
  - Resend email API — mock `POST /emails` endpoint (verify welcome email is sent during onboarding, without actually sending)
- [ ] Use MSW in component tests that depend on API calls
- [ ] Create realistic mock data fixtures in `tests/fixtures/`:
  - `exercises.ts` — 5–10 mock exercises across categories
  - `workouts.ts` — mock template, active workout with sets, completed workout
  - `foods.ts` — mock USDA food items and custom foods
  - `user-profile.ts` — mock user with completed onboarding, targets set, `timezone: "America/Los_Angeles"`

### E2E Tests (Playwright)

#### Critical Flows

- [ ] **Onboarding flow**: Sign up (via `/sign-up`) → complete 4-step onboarding → verify timezone was detected → verify welcome email sent (check Resend test inbox or mock) → land on dashboard with targets set
- [ ] **Workout from template**: Create template → add exercises → start workout → log sets → complete → verify in history
- [ ] **Freestyle workout**: Start empty workout → add exercises → log sets → complete → verify in history
- [ ] **Meal logging**: Search food → add to lunch → verify calorie count updates (from snapshots) → delete entry → verify count decreases
- [ ] **Sleep logging**: Log sleep → verify on dashboard → edit entry → verify changes → **test nap case** (bedtime 1pm, wake 3pm)
- [ ] **Mood logging**: Log mood with emotions → verify on dashboard → check trend chart renders

#### Edge Cases

- [ ] **Workout reordering**: Start workout → reorder exercises mid-workout → complete → verify order in history
- [ ] **Template editing**: Edit template → verify past workouts are unaffected (snapshot preserved)
- [ ] **Unit switching**: Change units preference in settings → verify all displayed values change (weight in workouts, food servings, body stats)
- [ ] **Soft-delete exercise**: Create custom exercise → use in a workout → complete workout → delete exercise → verify exercise shows "deleted" but workout history still shows the exercise name
- [ ] **Soft-delete food**: Create custom food → log a meal with it → delete food → verify meal log still shows correct nutrition
- [ ] **Account deletion**: Delete account → verify redirect to `/login` → verify cannot log back in

#### Responsive

- [ ] Run critical flow tests at mobile viewport (375×812) and desktop viewport (1440×900)
- [ ] Verify bottom nav on mobile, sidebar on desktop
- [ ] Verify sheets/dialogs render correctly on both viewports

### Lighthouse CI

- [ ] Configure Lighthouse CI to run on:
  - Dashboard page (authenticated)
  - Exercise list page
  - Nutrition daily page
- [ ] **Lighthouse authentication setup** (required — unauthenticated pages will just show the login form):
  - Create a dedicated Lighthouse test user in the test/staging database (seed script)
  - In the Lighthouse CI config, use a `puppeteerScript` to sign in via the UI and export cookies before each audit
  - Pass the session cookie to Lighthouse via `extraHeaders`
  - Never commit real credentials — use environment secrets injected in CI
- [ ] Thresholds (enforced in CI):
  - Performance: ≥ 90
  - Accessibility: ≥ 90
  - Best Practices: ≥ 90
  - SEO: ≥ 80 (this is an authenticated app, some SEO signals are structurally unavailable)
- [ ] PWA audit: verify installability, service worker, manifest

### GitHub Actions Workflows

- [ ] **Lint & Type Check workflow**: runs on PR
  - `pnpm lint`
  - `pnpm tsc --noEmit`
- [ ] **Unit & Component Test workflow**: runs on PR
  - `pnpm test` (Vitest)
  - Upload coverage report as artifact
- [ ] **E2E Test workflow**: runs on PR to main
  - Start the dev server or build + start
  - `pnpm playwright test`
  - Upload Playwright report and screenshots as artifacts
- [ ] **Lighthouse CI workflow**: runs on PR to main
  - Build the app
  - Run Lighthouse CI against the built app
  - Assert thresholds
  - Upload Lighthouse report as artifact
- [ ] Verify Dependabot is configured for weekly grouped updates
- [ ] Verify Husky pre-commit hook runs `lint-staged`

### Test Data Management

- [ ] Create a test database setup script (or use Supabase local dev with `supabase start`)
- [ ] Seed test data for E2E tests: a test user with profile (including timezone), templates, workouts, meals, sleep, mood
- [ ] Clean up test data after E2E test runs
- [ ] Ensure test data is isolated (each test run uses a unique user or cleans up)

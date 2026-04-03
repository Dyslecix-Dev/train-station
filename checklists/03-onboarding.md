# Phase 3 — Onboarding

## Done-State Check

Before starting, verify Phase 2b outputs exist: RLS policies are enabled on all tables (test with non-service-role client), `lib/db/index.ts` exports drizzle client, `lib/db/utils.ts` has `getCurrentUserProfile`.

## Context for Claude Code

After a user signs up via Supabase Auth, they must complete onboarding before accessing the app. Onboarding is a 4-step wizard that collects stats, detects the user's timezone, calculates TDEE (Mifflin-St Jeor), and sets nutrition targets. Data is saved to the `user_profiles` table. We use Conform for forms, Zod v4 for validation, and server actions to persist. The wizard should work as a single page with step transitions (not separate routes), using local React state for the current step.

**Important:** The server action file (`app/(protected)/onboarding/actions.ts`) must have `"use server"` at the top. The Zod schemas and TDEE utility functions go in separate `lib/` files — do NOT put them in the `"use server"` file.

---

## Checklist

### Routing & Guards

- [ ] Create onboarding page at `app/(protected)/onboarding/page.tsx`
- [ ] In the protected layout (`app/(protected)/layout.tsx`), check `user_profile.onboarding_completed` — if `false`, redirect to `/onboarding`
- [ ] In the onboarding page, check `user_profile.onboarding_completed` — if `true`, redirect to `/dashboard`

### Step 1: Basic Stats

- [ ] Fields: display name (text, required), age (number, required, 13–120), height (number, required — show in ft/in or cm based on a toggle, convert to cm before saving), weight (number, required — show in lb or kg based on toggle, convert to kg before saving), sex (select: male, female, other, prefer not to say)
- [ ] Include a units toggle (imperial/metric) that controls how height and weight inputs are displayed
- [ ] Validate with Zod schema (in `lib/validations/onboarding.ts`): all fields required, age 13–120, height 50–300 cm, weight 20–500 kg
- [ ] Display progress indicator showing step 1 of 4

### Step 2: Activity Level

- [ ] Radio group with 5 options, each with a short description:
  - Sedentary (desk job, little exercise)
  - Lightly active (light exercise 1–3 days/week)
  - Moderately active (moderate exercise 3–5 days/week)
  - Very active (hard exercise 6–7 days/week)
  - Extremely active (very hard exercise, physical job)
- [ ] Validate with Zod: required, must be one of the enum values
- [ ] Display progress indicator showing step 2 of 4

### Step 3: Primary Goal

- [ ] Radio group with 5 options, each with a short description:
  - Lose fat (calorie deficit, high protein)
  - Build muscle (calorie surplus, high protein)
  - Maintain (calorie maintenance)
  - Improve endurance (balanced macros, moderate surplus)
  - General health (balanced approach)
- [ ] Validate with Zod: required, must be one of the enum values
- [ ] Display progress indicator showing step 3 of 4

### Step 4: Review & Confirm

- [ ] Show a summary of all entered values
- [ ] Show calculated TDEE using Mifflin-St Jeor formula (from `lib/tdee.ts`)
- [ ] Show calculated calorie and macro targets
- [ ] Display all calculated values with the option to manually override each one
- [ ] Allow user to go back to any previous step and edit
- [ ] Display progress indicator showing step 4 of 4

### Timezone Detection

- [ ] On the client side (in the onboarding page component), detect the user's timezone:

  ```ts
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  ```

- [ ] Include `timezone` in the form submission payload — it is sent alongside the profile data
- [ ] The server action saves it to `user_profiles.timezone`

### Server Action

- [ ] Create `app/(protected)/onboarding/actions.ts` with a `completeOnboarding` server action
- [ ] Validate the full payload with a combined Zod schema (import from `lib/validations/onboarding.ts`)
- [ ] Upsert the `user_profiles` row with all values including `timezone`, set `onboarding_completed = true`
- [ ] Rate limit the action (5 calls per minute per user)
- [ ] After successful upsert, send a welcome email using the boilerplate's existing email infrastructure:

  ```ts
  import { sendEmail } from "@/lib/email";
  import WelcomeEmail from "@/emails/welcome";
  await sendEmail({ to: userEmail, subject: "Welcome to [App Name]!", react: WelcomeEmail({ name: displayName }) });
  ```

  Import the app name from `lib/config.ts` for the subject line. If the welcome template needs customization for the fitness app, update `emails/welcome.tsx`. Do not create a new template file.

- [ ] On success, call `revalidatePath("/")` and redirect to `/dashboard`
- [ ] On error, return error via Conform and show toast. Email send failure should be logged but should NOT block the redirect — onboarding success is more important than the welcome email.

### TDEE Utility

- [ ] Create `lib/tdee.ts` with pure functions:
  - `calculateBMR(weight_kg, height_cm, age, sex)` → number
    - Male: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5`
    - Female: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161`
    - Other/Prefer not to say: average of male and female formulas
  - `calculateTDEE(bmr, activityLevel)` → number
    - Multiply by activity factor: sedentary=1.2, lightly=1.375, moderate=1.55, very=1.725, extreme=1.9
  - `calculateTargets(tdee, goal, weight_kg)` → `{ calories, protein_g, carbs_g, fat_g, fiber_g }`
    - Calorie target based on goal: lose fat: TDEE − 500, build muscle: TDEE + 300, maintain: TDEE, improve endurance: TDEE + 200, general health: TDEE
    - Protein: 1.0g/lb body weight (lose fat, build muscle), 0.8g/lb (others) — convert from kg: `weight_kg × 2.2 × multiplier`
    - Fat: 25% of calories ÷ 9
    - Carbs: remaining calories ÷ 4
    - Fiber: 14g per 1000 calories
  - **Sanity clamping**: After calculation, clamp all values to safe ranges:
    - Calories: 1200–6000
    - Protein: 40–400g
    - Carbs: 50–800g
    - Fat: 20–300g
    - Fiber: 10–100g
- [ ] Export for use in both onboarding and settings (for recalculation)
- [ ] Add JSDoc comments explaining formulas

### UX Polish

- [ ] Animate step transitions (slide or fade) using Motion (already installed in boilerplate)
- [ ] Persist wizard state in local component state (if user navigates away, they restart — this is fine for onboarding)
- [ ] Show a loading state on the final submit button while the server action runs
- [ ] Handle back/forward browser navigation gracefully (prevent partial submissions)

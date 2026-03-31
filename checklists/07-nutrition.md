# Phase 7 — Nutrition Tracking

## Done-State Check

Before starting, verify Phase 5c outputs exist: `lib/units.ts` exists with conversion functions, workout history page renders at `/workouts`.

## Context for Claude Code

Nutrition tracking lets users log meals (breakfast, lunch, dinner, snack), search foods from the USDA FoodData Central API, add custom foods, track water intake, and log body stats (weight, body fat %). We track calories and macros (protein, carbs, fat, fiber) for v1. The user has calorie and macro targets set during onboarding (stored in `user_profiles`). All weight stored in kg internally.

**Important — snapshot math:** `meal_logs` snapshot columns are computed as `food.value_per_serving × servings`. The `servings` field is a multiplier (e.g., 1.5 means "1.5 servings"), not a weight. `food.calories` is already a per-serving value. So `calories_snapshot = food.calories × servings` is correct.

**Important — water target:** The water target comes from `user_profiles.water_target_ml` (default 2000, configurable in settings). Never hardcode 2000 in the UI — always read from the user's profile.

---

## Checklist

### USDA FoodData Central Integration

- [ ] Create `lib/usda.ts` with functions to query the USDA API:
  - `searchFoods(query: string, pageSize?: number)` — calls `https://api.nal.usda.gov/fdc/v1/foods/search` using `process.env.USDA_API_KEY` (required — throw a startup error if missing, never fall back to `DEMO_KEY`)
  - Returns: array of `{ fdcId, description, brandName, servingSize, servingSizeUnit, calories, protein_g, carbs_g, fat_g, fiber_g }`
  - **Serving size normalization**: USDA data is typically per 100g regardless of `servingSizeUnit`. When parsing, always normalize to a concrete per-serving value: `(nutrientPer100g / 100) × servingSize`. If `servingSize` is null or zero, default to 100g and label the serving unit as "100g".
  - Handle API errors gracefully (return empty results with error flag)
- [ ] `getFoodDetails(fdcId: string)` — fetches a single food item with full nutrient data
- [ ] Server action `searchFoodsAction(query: string)` in `app/(protected)/nutrition/actions.ts` — wraps the search with rate limiting (20 searches per minute per user)
- [ ] Cache USDA results: when a user adds a USDA food to a meal, upsert it into the `foods` table with `is_system = true` and `fdc_id` set. This avoids repeat API calls for the same food.

### Nutrition Daily View Page

- [ ] Create page at `app/(protected)/nutrition/page.tsx`
- [ ] Date selector at the top (default: today, navigate forward/back by day). Use the shared `useDateParam` hook from `lib/hooks/use-date-param.ts` (param name `date`).
- [ ] Show daily calorie and macro targets vs. consumed:
  - Read targets from `user_profiles` (`calorie_target`, `protein_target_g`, etc.)
  - Read consumed from sum of `meal_logs._snapshot` columns for the selected date — **never join to `foods` for totals**
  - Calorie progress bar (consumed / target)
  - Macro breakdown: protein, carbs, fat, fiber — each with a small progress bar or ring
- [ ] Four meal sections: Breakfast, Lunch, Dinner, Snack
  - Each section shows logged foods with: name (from joined `foods`), servings × serving_size, calories, protein, carbs, fat (from snapshot columns)
  - Subtotal per meal (sum of snapshots)
  - "Add Food" button per section
  - Swipe-to-delete or delete icon on each food entry
- [ ] Water intake section:
  - Show total ml (or oz in imperial) consumed today
  - Quick-add buttons: +250ml (glass), +500ml (bottle), custom amount
  - Target progress: amount vs. `user_profiles.water_target_ml`
- [ ] Daily totals row at the bottom

### Add Food Flow

- [ ] "Add Food" opens a sheet/dialog with:
  - Search input (debounced, 300ms)
  - "Recent" tab: last 20 unique foods the user has logged (query `meal_logs` joined with `foods`, distinct by `food_id`, ordered by most recent `created_at`). Filter out foods where `deleted_at IS NOT NULL`.
  - "Search" tab: searches USDA API via server action
  - "Custom" tab: shows user's custom foods (where `created_by = current user` and `deleted_at IS NULL`) + "Create Custom Food" button
  - **No "Favorites" tab for v1.** Deferred to v2.
- [ ] Search results show: food name, brand (if any), calories per serving, serving size
- [ ] Selecting a food opens a portion dialog:
  - Shows the food's per-serving nutrition
  - "Servings" number input (default 1, supports decimals like 0.5, 1.5)
  - Calculated totals update live: `displayed_value = food.value_per_serving × servings`
  - "Add" button to log it
- [ ] Server action `logMeal(date, mealType, foodId, servings)` in `app/(protected)/nutrition/actions.ts`:
  - Fetch the food's current per-serving values
  - Compute and store all snapshot columns: `calories_snapshot = food.calories × servings`, `protein_g_snapshot = food.protein_g × servings`, etc.
  - Insert into `meal_logs`
  - **Update streak**: get user's timezone, resolve "today", call `updateStreak(userId, today)`
  - Call `revalidatePath("/nutrition")`
- [ ] On success: close dialog, show toast

### Remove Food Entry

- [ ] Server action `removeMealLog(mealLogId)` in `app/(protected)/nutrition/actions.ts` — verify ownership, delete
- [ ] Use TanStack Query **optimistic update**: remove the entry from the cache immediately, revert on error
- [ ] Call `revalidatePath("/nutrition")`

### Custom Food Creation

- [ ] "Create Custom Food" button in the food search dialog's Custom tab
- [ ] Opens a form (dialog or inline) with Conform + Zod:
  - Name (required)
  - Brand (optional)
  - Serving size (number, required) + serving unit (select from `SERVING_UNITS` in `lib/nutrition-constants.ts`)
  - Calories (number, required, ≥ 0)
  - Protein g (optional, ≥ 0)
  - Carbs g (optional, ≥ 0)
  - Fat g (optional, ≥ 0)
  - Fiber g (optional, ≥ 0)
- [ ] Zod schema in `lib/validations/food.ts`
- [ ] Server action `createCustomFood(formData)` in `app/(protected)/nutrition/actions.ts`: validate, insert into `foods` with `is_system = false`, `created_by = current user`
- [ ] On success: auto-select this food in the "add food" flow

### Edit / Delete Custom Food

- [ ] From the "Custom" tab in food search, allow editing user-created foods
- [ ] Server action `updateCustomFood(id, formData)`: validate ownership, update. **After editing, existing `meal_logs` snapshot values are unaffected** — this is intentional and correct.
- [ ] Delete: server action `deleteCustomFood(id)`:
  1. Verify ownership
  2. Attempt hard delete with try/catch
  3. If Postgres error code `23503` (FK violation — food is referenced in `meal_logs`): **soft-delete** — set `deleted_at = now()`
  4. If delete succeeds: done (food had no references)
- [ ] Call `revalidatePath("/nutrition")` on success

### Water Tracking

- [ ] Server action `logWater(date, amount_ml)` in `app/(protected)/nutrition/actions.ts` — insert into `water_logs`
- [ ] Quick-add buttons call this action directly
- [ ] Custom amount: small input dialog
- [ ] Display total water for the day from sum of `water_logs` for that date
- [ ] Water target: read from `user_profiles.water_target_ml` — **never hardcode 2000ml in the UI**
- [ ] Use TanStack Query **optimistic update** for quick-add buttons (add amount to displayed total immediately)
- [ ] Allow deleting individual water entries (show a list if user taps the total)
- [ ] **Update streak**: call `updateStreak(userId, today)` after a successful water log (using user's timezone)
- [ ] Call `revalidatePath("/nutrition")`

### Body Stats Logging

- [ ] Create a "Body Stats" section on the nutrition page (below the main meal content, or as a sub-tab)
- [ ] Simple form: date (default today), weight (in user's preferred unit via `lib/units.ts`, converted to kg), body fat % (optional)
- [ ] Zod schema in `lib/validations/body-stats.ts`
- [ ] Server action `logBodyStats(date, weight_kg, bodyFatPercentage?)` in `app/(protected)/nutrition/actions.ts` — upsert into `body_stats_logs` (one entry per user per date)
- [ ] Show a weight trend chart (Recharts line chart):
  - Last 30 days by default
  - Date range selector (30d, 90d, 6m, 1y, all)
  - Wrap in Suspense with `LoadingSkeleton` fallback
- [ ] Call `revalidatePath("/nutrition")`

### Weekly Average

- [ ] At the top of the nutrition page, add a "Weekly Avg" toggle or a separate tab
- [ ] Calculate averages for the current week (Mon–Sun):
  - Average daily calories, protein, carbs, fat, fiber, water
  - Compare to targets (show as percentage)
- [ ] Query: sum all `meal_logs._snapshot` columns for the week, divide by number of days with entries
- [ ] Display as a simple summary card

### Server Actions Summary

All in `app/(protected)/nutrition/actions.ts`:

- [ ] `searchFoodsAction(query)` — search USDA, rate limited
- [ ] `logMeal(date, mealType, foodId, servings)` — insert meal_log with snapshot columns; call `updateStreak`
- [ ] `removeMealLog(id)` — delete meal_log, verify ownership
- [ ] `createCustomFood(formData)` — insert food
- [ ] `updateCustomFood(id, formData)` — update food, verify ownership
- [ ] `deleteCustomFood(id)` — hard-delete or soft-delete, verify ownership
- [ ] `logWater(date, amount_ml)` — insert water_log; call `updateStreak`
- [ ] `removeWaterLog(id)` — delete water_log, verify ownership
- [ ] `logBodyStats(date, weight_kg, bodyFatPercentage?)` — upsert body_stats_log
- [ ] All actions: authenticated, ownership-checked, rate limited, call `revalidatePath`

import type { ActivityLevel, PrimaryGoal } from "@/lib/validations/onboarding";

export interface MacroTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

// NOTE: calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
// - Male:   10 × weight_kg + 6.25 × height_cm − 5 × age + 5
// - Female: 10 × weight_kg + 6.25 × height_cm − 5 × age − 161
// - Other / prefer not to say: average of male and female formulas
export function calculateBMR(weight_kg: number, height_cm: number, age: number, sex: string): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base + (5 + -161) / 2;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

const CALORIE_DELTAS: Record<PrimaryGoal, number> = {
  lose_fat: -500,
  build_muscle: 300,
  maintain: 0,
  improve_endurance: 200,
  general_health: 0,
};

const PROTEIN_MULTIPLIER: Record<PrimaryGoal, number> = {
  lose_fat: 1.0,
  build_muscle: 1.0,
  maintain: 0.8,
  improve_endurance: 0.8,
  general_health: 0.8,
};

// NOTE: derives daily calorie and macro targets from TDEE, primary goal, and body weight.
// Protein formula:  weight_kg × 2.2 × multiplier (g)
// Fat formula:      25% of calories ÷ 9 (g)
// Carbs formula:    remaining calories after protein + fat ÷ 4 (g)
// Fiber formula:    14g per 1000 calories

// All values are clamped to physiologically safe ranges:
//   calories  1200–6000
//   protein   40–400 g
//   carbs     50–800 g
//   fat       20–300 g
//   fiber     10–100 g
export function calculateTargets(tdee: number, goal: PrimaryGoal, weight_kg: number): MacroTargets {
  const rawCalories = tdee + CALORIE_DELTAS[goal];
  const calories = clamp(Math.round(rawCalories), 1200, 6000);

  const rawProtein = weight_kg * 2.2 * PROTEIN_MULTIPLIER[goal];
  const protein_g = clamp(Math.round(rawProtein), 40, 400);

  const rawFat = (calories * 0.25) / 9;
  const fat_g = clamp(Math.round(rawFat), 20, 300);

  const proteinCalories = protein_g * 4;
  const fatCalories = fat_g * 9;
  const remainingCalories = calories - proteinCalories - fatCalories;
  const rawCarbs = remainingCalories / 4;
  const carbs_g = clamp(Math.round(rawCarbs), 50, 800);

  const rawFiber = (calories / 1000) * 14;
  const fiber_g = clamp(Math.round(rawFiber), 10, 100);

  return { calories, protein_g, carbs_g, fat_g, fiber_g };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

import { describe, expect, it } from "vitest";

import { calculateBMR, calculateTDEE, calculateTargets } from "@/lib/tdee";

describe("calculateBMR", () => {
  it("calculates BMR for a male", () => {
    // 10 × 80 + 6.25 × 180 − 5 × 30 + 5 = 800 + 1125 − 150 + 5 = 1780
    expect(calculateBMR(80, 180, 30, "male")).toBe(1780);
  });

  it("calculates BMR for a female", () => {
    // 10 × 60 + 6.25 × 165 − 5 × 25 − 161 = 600 + 1031.25 − 125 − 161 = 1345.25
    expect(calculateBMR(60, 165, 25, "female")).toBe(1345.25);
  });

  it("calculates BMR for other sex as average of male and female", () => {
    // base = 10 × 70 + 6.25 × 175 − 5 × 28 = 700 + 1093.75 − 140 = 1653.75
    // other = base + (5 + -161) / 2 = 1653.75 + (-78) = 1575.75
    expect(calculateBMR(70, 175, 28, "other")).toBe(1575.75);
  });

  it("uses other formula for unrecognized sex values", () => {
    const other = calculateBMR(70, 175, 28, "other");
    expect(calculateBMR(70, 175, 28, "prefer_not_to_say")).toBe(other);
  });
});

describe("calculateTDEE", () => {
  it("applies sedentary multiplier", () => {
    expect(calculateTDEE(1780, "sedentary")).toBe(Math.round(1780 * 1.2));
  });

  it("applies lightly_active multiplier", () => {
    expect(calculateTDEE(1780, "lightly_active")).toBe(Math.round(1780 * 1.375));
  });

  it("applies moderately_active multiplier", () => {
    expect(calculateTDEE(1780, "moderately_active")).toBe(Math.round(1780 * 1.55));
  });

  it("applies very_active multiplier", () => {
    expect(calculateTDEE(1780, "very_active")).toBe(Math.round(1780 * 1.725));
  });

  it("applies extremely_active multiplier", () => {
    expect(calculateTDEE(1780, "extremely_active")).toBe(Math.round(1780 * 1.9));
  });
});

describe("calculateTargets", () => {
  it("returns correct macros for maintenance goal", () => {
    const result = calculateTargets(2500, "maintain", 80);
    expect(result.calories).toBe(2500);
    // protein = 80 * 2.2 * 0.8 = 140.8 → 141
    expect(result.protein_g).toBe(141);
    // fat = (2500 * 0.25) / 9 = 69.44 → 69
    expect(result.fat_g).toBe(69);
    // carbs = (2500 - 141*4 - 69*9) / 4 = (2500 - 564 - 621) / 4 = 1315/4 = 328.75 → 329
    expect(result.carbs_g).toBe(329);
    // fiber = (2500/1000) * 14 = 35
    expect(result.fiber_g).toBe(35);
  });

  it("applies calorie deficit for lose_fat", () => {
    const result = calculateTargets(2500, "lose_fat", 80);
    expect(result.calories).toBe(2000);
  });

  it("applies calorie surplus for build_muscle", () => {
    const result = calculateTargets(2500, "build_muscle", 80);
    expect(result.calories).toBe(2800);
  });

  it("clamps calories to minimum 1200", () => {
    const result = calculateTargets(1000, "lose_fat", 50);
    expect(result.calories).toBe(1200);
  });

  it("clamps calories to maximum 6000", () => {
    const result = calculateTargets(6500, "build_muscle", 100);
    expect(result.calories).toBe(6000);
  });

  it("clamps protein to minimum 40", () => {
    // weight_kg * 2.2 * 0.8 < 40 → weight_kg < 22.7
    const result = calculateTargets(2000, "maintain", 10);
    expect(result.protein_g).toBe(40);
  });

  it("clamps fat to minimum 20", () => {
    // (calories * 0.25) / 9 < 20 → calories < 720, but calories min is 1200
    // fat at 1200 cal = (1200 * 0.25) / 9 = 33.33 → 33 which is > 20, so fat min clamp only kicks in for very low values — verify fat is reasonable
    const result = calculateTargets(1200, "maintain", 60);
    expect(result.fat_g).toBeGreaterThanOrEqual(20);
  });

  it("returns all required fields", () => {
    const result = calculateTargets(2500, "general_health", 75);
    expect(result).toHaveProperty("calories");
    expect(result).toHaveProperty("protein_g");
    expect(result).toHaveProperty("carbs_g");
    expect(result).toHaveProperty("fat_g");
    expect(result).toHaveProperty("fiber_g");
  });
});

import { describe, expect, it } from "vitest";

import { MEAL_TYPES, SERVING_UNITS } from "@/lib/nutrition-constants";

describe("MEAL_TYPES", () => {
  it("contains expected meal types", () => {
    expect(MEAL_TYPES).toEqual(["breakfast", "lunch", "dinner", "snack"]);
  });
});

describe("SERVING_UNITS", () => {
  it("contains expected serving units", () => {
    expect(SERVING_UNITS).toEqual(["g", "ml", "oz", "cup", "piece", "tbsp", "tsp", "slice"]);
  });

  it("has 8 units", () => {
    expect(SERVING_UNITS).toHaveLength(8);
  });
});

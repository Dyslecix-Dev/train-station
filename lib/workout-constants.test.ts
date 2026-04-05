import { describe, expect, it } from "vitest";

import { CATEGORY_LABELS, EXERCISE_CATEGORIES, MUSCLE_GROUP_LABELS, MUSCLE_GROUPS, PROGRESS_METRIC_MAP, SECTION_LABELS } from "@/lib/workout-constants";

describe("SECTION_LABELS", () => {
  it("has labels for all section keys", () => {
    expect(SECTION_LABELS).toHaveProperty("warm_up");
    expect(SECTION_LABELS).toHaveProperty("main");
    expect(SECTION_LABELS).toHaveProperty("cooldown");
  });
});

describe("EXERCISE_CATEGORIES", () => {
  it("contains expected categories", () => {
    expect(EXERCISE_CATEGORIES).toEqual(["strength", "cardio", "bodyweight", "flexibility", "other"]);
  });
});

describe("MUSCLE_GROUPS", () => {
  it("contains 12 muscle groups", () => {
    expect(MUSCLE_GROUPS).toHaveLength(12);
  });

  it("includes key muscle groups", () => {
    expect(MUSCLE_GROUPS).toContain("chest");
    expect(MUSCLE_GROUPS).toContain("back");
    expect(MUSCLE_GROUPS).toContain("full_body");
  });
});

describe("PROGRESS_METRIC_MAP", () => {
  it("maps every category to a metric type", () => {
    for (const category of EXERCISE_CATEGORIES) {
      expect(PROGRESS_METRIC_MAP[category]).toBeDefined();
    }
  });

  it("maps strength to estimated_1rm", () => {
    expect(PROGRESS_METRIC_MAP.strength).toBe("estimated_1rm");
  });

  it("maps cardio to best_pace", () => {
    expect(PROGRESS_METRIC_MAP.cardio).toBe("best_pace");
  });
});

describe("CATEGORY_LABELS", () => {
  it("has a label for every category", () => {
    for (const category of EXERCISE_CATEGORIES) {
      expect(typeof CATEGORY_LABELS[category]).toBe("string");
    }
  });
});

describe("MUSCLE_GROUP_LABELS", () => {
  it("has a label for every muscle group", () => {
    for (const group of MUSCLE_GROUPS) {
      expect(typeof MUSCLE_GROUP_LABELS[group]).toBe("string");
    }
  });
});

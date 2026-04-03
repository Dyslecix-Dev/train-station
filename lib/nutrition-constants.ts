export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const SERVING_UNITS = ["g", "ml", "oz", "cup", "piece", "tbsp", "tsp", "slice"] as const;

export type ServingUnit = (typeof SERVING_UNITS)[number];

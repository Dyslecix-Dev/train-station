import { boolean, date, index, integer, numeric, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { userProfiles } from "@/lib/db/schema/user-profiles";

export const foods = pgTable("foods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  brand: text("brand"),
  servingSize: numeric("serving_size", { precision: 8, scale: 2 }).notNull(),
  servingUnit: text("serving_unit").notNull(),
  calories: numeric("calories", { precision: 8, scale: 2 }).notNull(),
  proteinG: numeric("protein_g", { precision: 8, scale: 2 }),
  carbsG: numeric("carbs_g", { precision: 8, scale: 2 }),
  fatG: numeric("fat_g", { precision: 8, scale: 2 }),
  fiberG: numeric("fiber_g", { precision: 8, scale: 2 }),
  fdcId: text("fdc_id"),
  isSystem: boolean("is_system").notNull().default(false),
  createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const mealLogs = pgTable(
  "meal_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    mealType: text("meal_type", { enum: ["breakfast", "lunch", "dinner", "snack"] }).notNull(),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "restrict" }),
    servings: numeric("servings", { precision: 6, scale: 2 }).notNull().default("1"),
    caloriesSnapshot: numeric("calories_snapshot", { precision: 8, scale: 2 }).notNull(),
    proteinGSnapshot: numeric("protein_g_snapshot", { precision: 8, scale: 2 }),
    carbsGSnapshot: numeric("carbs_g_snapshot", { precision: 8, scale: 2 }),
    fatGSnapshot: numeric("fat_g_snapshot", { precision: 8, scale: 2 }),
    fiberGSnapshot: numeric("fiber_g_snapshot", { precision: 8, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("meal_logs_user_id_date_idx").on(t.userId, t.date)],
);

export const waterLogs = pgTable(
  "water_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    amountMl: integer("amount_ml").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("water_logs_user_id_date_idx").on(t.userId, t.date)],
);

export const bodyStatsLogs = pgTable(
  "body_stats_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 1 }),
    bodyFatPercentage: numeric("body_fat_percentage", { precision: 4, scale: 1 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.date), index("body_stats_logs_user_id_date_idx").on(t.userId, t.date)],
);

export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
export type MealLog = typeof mealLogs.$inferSelect;
export type NewMealLog = typeof mealLogs.$inferInsert;
export type WaterLog = typeof waterLogs.$inferSelect;
export type NewWaterLog = typeof waterLogs.$inferInsert;
export type BodyStatsLog = typeof bodyStatsLogs.$inferSelect;
export type NewBodyStatsLog = typeof bodyStatsLogs.$inferInsert;

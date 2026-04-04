import "dotenv/config";
import { isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema/index";
import { systemExercises } from "@/lib/db/seed/exercises";

const client = postgres(process.env.POSTGRES_URL_NON_POOLING!, { prepare: false });
const db = drizzle({ client, schema });

// System foods — common staples with per-serving macros (is_system = true)
const systemFoods = [
  // Proteins
  { name: "Chicken Breast (cooked)", servingSize: "140", servingUnit: "g", calories: "231", proteinG: "43.4", carbsG: "0", fatG: "5", fiberG: "0" },
  { name: "Salmon Fillet (cooked)", servingSize: "170", servingUnit: "g", calories: "367", proteinG: "34.4", carbsG: "0", fatG: "24.6", fiberG: "0" },
  { name: "Ground Beef 90/10 (cooked)", servingSize: "113", servingUnit: "g", calories: "200", proteinG: "22.7", carbsG: "0", fatG: "11.3", fiberG: "0" },
  { name: "Egg (large)", servingSize: "50", servingUnit: "g", calories: "72", proteinG: "6.3", carbsG: "0.4", fatG: "4.8", fiberG: "0" },
  { name: "Greek Yogurt (plain, nonfat)", servingSize: "170", servingUnit: "g", calories: "100", proteinG: "17", carbsG: "6", fatG: "0.7", fiberG: "0" },
  { name: "Tofu (firm)", servingSize: "126", servingUnit: "g", calories: "117", proteinG: "14", carbsG: "2.2", fatG: "7", fiberG: "1.1" },
  { name: "Whey Protein Powder", servingSize: "31", servingUnit: "g", calories: "120", proteinG: "24", carbsG: "3", fatG: "1.5", fiberG: "0" },
  { name: "Cottage Cheese (low-fat)", servingSize: "113", servingUnit: "g", calories: "81", proteinG: "14", carbsG: "3.2", fatG: "1.2", fiberG: "0" },

  // Carbs
  { name: "White Rice (cooked)", servingSize: "158", servingUnit: "g", calories: "206", proteinG: "4.3", carbsG: "44.5", fatG: "0.4", fiberG: "0.6" },
  { name: "Brown Rice (cooked)", servingSize: "158", servingUnit: "g", calories: "216", proteinG: "5", carbsG: "44.8", fatG: "1.8", fiberG: "3.5" },
  { name: "Oats (dry)", servingSize: "40", servingUnit: "g", calories: "154", proteinG: "5.3", carbsG: "27.4", fatG: "2.6", fiberG: "4.1" },
  { name: "Sweet Potato (baked)", servingSize: "150", servingUnit: "g", calories: "135", proteinG: "3", carbsG: "31.2", fatG: "0.2", fiberG: "4.5" },
  { name: "Whole Wheat Bread", servingSize: "43", servingUnit: "g", calories: "110", proteinG: "5", carbsG: "20", fatG: "1.5", fiberG: "3" },
  { name: "Banana", servingSize: "118", servingUnit: "g", calories: "105", proteinG: "1.3", carbsG: "27", fatG: "0.4", fiberG: "3.1" },
  { name: "Apple", servingSize: "182", servingUnit: "g", calories: "95", proteinG: "0.5", carbsG: "25.1", fatG: "0.3", fiberG: "4.4" },
  { name: "Pasta (cooked)", servingSize: "140", servingUnit: "g", calories: "220", proteinG: "8.1", carbsG: "43.2", fatG: "1.3", fiberG: "2.5" },

  // Fats
  { name: "Avocado", servingSize: "150", servingUnit: "g", calories: "240", proteinG: "3", carbsG: "12.8", fatG: "22", fiberG: "10" },
  { name: "Peanut Butter", servingSize: "32", servingUnit: "g", calories: "188", proteinG: "7", carbsG: "7.7", fatG: "16", fiberG: "1.6" },
  { name: "Almonds", servingSize: "28", servingUnit: "g", calories: "164", proteinG: "6", carbsG: "6.1", fatG: "14.2", fiberG: "3.5" },
  { name: "Olive Oil", servingSize: "14", servingUnit: "ml", calories: "119", proteinG: "0", carbsG: "0", fatG: "13.5", fiberG: "0" },

  // Vegetables
  { name: "Broccoli (cooked)", servingSize: "156", servingUnit: "g", calories: "55", proteinG: "3.7", carbsG: "11.2", fatG: "0.6", fiberG: "5.1" },
  { name: "Spinach (raw)", servingSize: "30", servingUnit: "g", calories: "7", proteinG: "0.9", carbsG: "1.1", fatG: "0.1", fiberG: "0.7" },
  { name: "Mixed Salad Greens", servingSize: "85", servingUnit: "g", calories: "15", proteinG: "1.3", carbsG: "2.5", fatG: "0.2", fiberG: "1.5" },

  // Dairy / Misc
  { name: "Whole Milk", servingSize: "244", servingUnit: "ml", calories: "149", proteinG: "8", carbsG: "12", fatG: "8", fiberG: "0" },
  { name: "Cheddar Cheese", servingSize: "28", servingUnit: "g", calories: "113", proteinG: "7", carbsG: "0.4", fatG: "9.3", fiberG: "0" },
  { name: "Honey", servingSize: "21", servingUnit: "g", calories: "64", proteinG: "0.1", carbsG: "17.3", fatG: "0", fiberG: "0" },
] as const;

async function seed() {
  console.log("Seeding database...");

  // System exercises
  if ("exercises" in schema) {
    // onConflictDoNothing won't deduplicate system exercises because the unique
    // constraint is (name, created_by) and Postgres treats two NULLs as distinct.
    // Fetch existing names first and skip those rows instead.
    const existing = await db.select({ name: schema.exercises.name }).from(schema.exercises).where(isNull(schema.exercises.createdBy));
    const existingNames = new Set(existing.map((e) => e.name));
    const toInsert = systemExercises.filter((e) => !existingNames.has(e.name));
    if (toInsert.length > 0) {
      await db.insert(schema.exercises).values(
        toInsert.map((e) => ({
          name: e.name,
          category: e.category,
          muscleGroups: [...e.muscleGroups],
          progressMetricType: e.progressMetricType,
          description: e.description,
          isSystem: true,
          createdBy: null,
        })),
      );
    }
    console.log(`  ✓ ${systemExercises.length} system exercises (${toInsert.length} inserted, ${existingNames.size} already present)`);
  } else {
    console.log("  ⏭ exercises table not yet in schema — skipping");
  }

  // System foods
  if ("foods" in schema) {
    const foods = (schema as Record<string, unknown>).foods as Parameters<typeof db.insert>[0];
    await db
      .insert(foods)
      .values(
        systemFoods.map((f) => ({
          name: f.name,
          servingSize: f.servingSize,
          servingUnit: f.servingUnit,
          calories: f.calories,
          proteinG: f.proteinG,
          carbsG: f.carbsG,
          fatG: f.fatG,
          fiberG: f.fiberG,
          isSystem: true,
          createdBy: null,
        })),
      )
      .onConflictDoNothing();
    console.log(`  ✓ ${systemFoods.length} system foods`);
  } else {
    console.log("  ⏭ foods table not yet in schema — skipping");
  }

  console.log("Seeding complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

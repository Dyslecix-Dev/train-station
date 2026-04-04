import { z } from "zod/v4";

export const basicStatsSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name must be 100 characters or fewer"),
  age: z.coerce.number().int().min(13, "Must be at least 13 years old").max(120, "Must be 120 years or younger"),
  // Stored in cm after conversion; 50–300 cm
  heightCm: z.coerce.number().min(50, "Height must be at least 50 cm").max(300, "Height must be at most 300 cm"),
  // Stored in kg after conversion; 20–500 kg
  weightKg: z.coerce.number().min(20, "Weight must be at least 20 kg").max(500, "Weight must be at most 500 kg"),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    error: "Please select a biological sex",
  }),
  unitsPreference: z.enum(["imperial", "metric"]),
});

export type BasicStatsValues = z.infer<typeof basicStatsSchema>;

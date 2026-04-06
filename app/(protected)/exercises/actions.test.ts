import { describe, expect, it } from "vitest";

// NOTE: tests the image validation logic and extension sanitization extracted from actions.ts

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_SIZE = 500 * 1024;

function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }
  if (file.size > IMAGE_MAX_SIZE) {
    return "Image too large (max 500 KB). Please compress it before uploading.";
  }
  return null;
}

function sanitizeExtension(fileName: string): string {
  const rawExt = fileName.split(".").pop() ?? "bin";
  return rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
}

describe("validateImageFile", () => {
  it("accepts JPEG images under size limit", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 100 * 1024 })).toBeNull();
  });

  it("accepts PNG images under size limit", () => {
    expect(validateImageFile({ type: "image/png", size: 100 * 1024 })).toBeNull();
  });

  it("accepts WebP images under size limit", () => {
    expect(validateImageFile({ type: "image/webp", size: 100 * 1024 })).toBeNull();
  });

  it("rejects GIF images", () => {
    expect(validateImageFile({ type: "image/gif", size: 100 })).toBe("Only JPEG, PNG, and WebP images are allowed.");
  });

  it("rejects SVG images", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 100 })).toBe("Only JPEG, PNG, and WebP images are allowed.");
  });

  it("rejects non-image types", () => {
    expect(validateImageFile({ type: "application/pdf", size: 100 })).toBe("Only JPEG, PNG, and WebP images are allowed.");
  });

  it("rejects images over 500KB", () => {
    expect(validateImageFile({ type: "image/png", size: 500 * 1024 + 1 })).toBe("Image too large (max 500 KB). Please compress it before uploading.");
  });

  it("accepts images exactly at 500KB", () => {
    expect(validateImageFile({ type: "image/png", size: 500 * 1024 })).toBeNull();
  });
});

describe("sanitizeExtension", () => {
  it("extracts normal extensions", () => {
    expect(sanitizeExtension("photo.png")).toBe("png");
    expect(sanitizeExtension("image.jpeg")).toBe("jpeg");
    expect(sanitizeExtension("file.webp")).toBe("webp");
  });

  it("strips special characters", () => {
    expect(sanitizeExtension("file.p<n>g")).toBe("png");
  });

  it("truncates long extensions to 10 characters", () => {
    expect(sanitizeExtension("file.verylongextension")).toBe("verylongex");
  });

  it("falls back to bin for empty extension", () => {
    expect(sanitizeExtension("file.")).toBe("bin");
  });

  it("handles multiple dots", () => {
    expect(sanitizeExtension("my.photo.jpg")).toBe("jpg");
  });
});

// Test PROGRESS_METRIC_MAP integration
import { EXERCISE_CATEGORIES, PROGRESS_METRIC_MAP } from "@/lib/workout-constants";

describe("PROGRESS_METRIC_MAP coverage", () => {
  it("has a metric for every exercise category", () => {
    for (const category of EXERCISE_CATEGORIES) {
      expect(PROGRESS_METRIC_MAP[category]).toBeDefined();
      expect(typeof PROGRESS_METRIC_MAP[category]).toBe("string");
    }
  });
});

// Test the createExerciseSchema validation (mirrored to avoid server imports)
import { z } from "zod/v4";

const createExerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  category: z.enum(EXERCISE_CATEGORIES, { error: "Please select a category" }),
});

describe("exercise form validation", () => {
  it("rejects form data without a name", () => {
    expect(createExerciseSchema.safeParse({ name: "", category: "strength" }).success).toBe(false);
  });

  it("rejects form data without a category", () => {
    expect(createExerciseSchema.safeParse({ name: "Squat" }).success).toBe(false);
  });

  it("accepts valid exercise form data", () => {
    expect(createExerciseSchema.safeParse({ name: "Squat", category: "strength" }).success).toBe(true);
  });
});

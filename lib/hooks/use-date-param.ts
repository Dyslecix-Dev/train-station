"use client";

import { parseAsString, useQueryState } from "nuqs";

// NOTE: shared hook for date-navigable pages (nutrition, sleep, mental health).
// Using the same `date` param name across all pages ensures that navigating between them preserves the selected date in the URL (e.g., ?date=2025-03-15).

export function useDateParam() {
  return useQueryState("date", parseAsString.withDefault(new Date().toISOString().split("T")[0]));
}

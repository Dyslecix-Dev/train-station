import { describe, expect, it, vi } from "vitest";

vi.mock("nuqs", () => ({
  parseAsString: {
    withDefault: (defaultVal: string) => ({ default: defaultVal }),
  },
  useQueryState: vi.fn().mockReturnValue(["2025-03-15", vi.fn()]),
}));

import { useDateParam } from "@/lib/hooks/use-date-param";

describe("useDateParam", () => {
  it("returns a tuple of [value, setter]", () => {
    const result = useDateParam();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe("string");
    expect(typeof result[1]).toBe("function");
  });
});

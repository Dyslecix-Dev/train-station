import { describe, expect, it, vi } from "vitest";

vi.mock("nuqs", () => ({
  parseAsString: {
    withDefault: (defaultVal: string) => ({ default: defaultVal }),
  },
  useQueryState: vi.fn().mockReturnValue(["", vi.fn()]),
}));

import { useSearchFilter } from "@/lib/hooks/use-search-params";

describe("useSearchFilter", () => {
  it("returns a tuple of [value, setter]", () => {
    const result = useSearchFilter();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe("string");
    expect(typeof result[1]).toBe("function");
  });

  it("defaults to empty string", () => {
    const [value] = useSearchFilter();
    expect(value).toBe("");
  });
});

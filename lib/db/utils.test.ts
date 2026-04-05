import { describe, expect, it, vi } from "vitest";

const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      userProfiles: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  userProfiles: { authUserId: "authUserId" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, val: unknown) => ({ col, val }),
}));

import { beforeEach } from "vitest";

import { getCurrentUserProfile, getUserTimezone } from "@/lib/db/utils";

describe("getCurrentUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns profile for authenticated user", async () => {
    const profile = { id: "p1", authUserId: "u1", displayName: "Alice" };
    const supabase = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) } };
    mockFindFirst.mockResolvedValueOnce(profile);

    const result = await getCurrentUserProfile(supabase as never);
    expect(result).toEqual(profile);
  });

  it("throws when user is not authenticated", async () => {
    const supabase = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("no session") }) } };

    await expect(getCurrentUserProfile(supabase as never)).rejects.toThrow("Unauthorized");
  });

  it("throws when profile is not found", async () => {
    const supabase = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) } };
    mockFindFirst.mockResolvedValueOnce(undefined);

    await expect(getCurrentUserProfile(supabase as never)).rejects.toThrow("User profile not found");
  });
});

describe("getUserTimezone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user timezone when profile exists", async () => {
    mockFindFirst.mockResolvedValueOnce({ timezone: "Europe/London" });
    const result = await getUserTimezone("u1");
    expect(result).toBe("Europe/London");
  });

  it("returns America/New_York as default when profile not found", async () => {
    mockFindFirst.mockResolvedValueOnce(undefined);
    const result = await getUserTimezone("u1");
    expect(result).toBe("America/New_York");
  });

  it("returns America/New_York when timezone is null", async () => {
    mockFindFirst.mockResolvedValueOnce({ timezone: null });
    const result = await getUserTimezone("u1");
    expect(result).toBe("America/New_York");
  });
});

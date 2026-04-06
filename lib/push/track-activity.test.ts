import { describe, expect, it, vi } from "vitest";

const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    update: (...args: unknown[]) => {
      mockUpdate(...args);
      return {
        set: (...sArgs: unknown[]) => {
          mockSet(...sArgs);
          return { where: (...wArgs: unknown[]) => mockWhere(...wArgs) };
        },
      };
    },
  },
}));

vi.mock("@/lib/db/schema/users", () => ({
  users: { id: "id", lastActiveAt: "lastActiveAt" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, val: unknown) => ({ col, val }),
}));

import { createClient } from "@/lib/supabase/server";
import { beforeEach } from "vitest";

import { trackActivity } from "@/lib/push/track-activity";

describe("trackActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates lastActiveAt for authenticated user", async () => {
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);

    await trackActivity();
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
  });

  it("does nothing when user is not authenticated", async () => {
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    await trackActivity();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

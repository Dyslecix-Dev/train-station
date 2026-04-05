import { describe, expect, it, vi } from "vitest";

const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockOnConflictDoUpdate = vi.fn();
const mockDelete = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => {
      mockInsert(...args);
      return {
        values: (...vArgs: unknown[]) => {
          mockValues(...vArgs);
          return {
            onConflictDoUpdate: (...cArgs: unknown[]) => {
              mockOnConflictDoUpdate(...cArgs);
            },
          };
        },
      };
    },
    delete: (...args: unknown[]) => {
      mockDelete(...args);
      return {
        where: (...wArgs: unknown[]) => {
          mockWhere(...wArgs);
        },
      };
    },
  },
}));

vi.mock("@/lib/db/schema/push-subscriptions", () => ({
  pushSubscriptions: { endpoint: "endpoint", userId: "userId", p256dh: "p256dh", auth: "auth" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, val: unknown) => ({ col, val }),
  and: (...args: unknown[]) => ({ and: args }),
}));

import { beforeEach } from "vitest";

import { subscribeToPush, unsubscribeFromPush } from "@/lib/push/actions";

describe("subscribeToPush", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a push subscription with upsert", async () => {
    const sub = { endpoint: "https://push.example.com", keys: { p256dh: "key1", auth: "key2" } };
    const result = await subscribeToPush(sub);
    expect(result).toEqual({ success: true });
    expect(mockValues).toHaveBeenCalledWith({
      userId: "user-1",
      endpoint: "https://push.example.com",
      p256dh: "key1",
      auth: "key2",
    });
    expect(mockOnConflictDoUpdate).toHaveBeenCalled();
  });
});

describe("unsubscribeFromPush", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the subscription for the authenticated user", async () => {
    const result = await unsubscribeFromPush("https://push.example.com");
    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
  });
});

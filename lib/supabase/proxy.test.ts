import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => ({ check: async () => ({ success: true, remaining: 9 }) }),
}));

import { createServerClient } from "@supabase/ssr";

const mockCreateServerClient = vi.mocked(createServerClient);

function makeGetClaims(user: object | null) {
  return vi.fn().mockResolvedValue({ data: { claims: user }, error: null });
}

function mockSupabase(user: object | null) {
  mockCreateServerClient.mockReturnValue({
    auth: { getClaims: makeGetClaims(user) },
  } as never);
}

function makeRequest(pathname: string) {
  return new NextRequest(new URL(`http://localhost${pathname}`));
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
});

const { updateSession } = await import("@/lib/supabase/proxy");

describe("proxy updateSession", () => {
  describe("unauthenticated user", () => {
    beforeEach(() => mockSupabase(null));

    it("redirects to /login for a protected route", async () => {
      const response = await updateSession(makeRequest("/dashboard"));
      expect(response.status).toBe(307);
      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("next")).toBe("/dashboard");
    });

    it("passes through the root public route", async () => {
      const response = await updateSession(makeRequest("/"));
      expect(response.status).not.toBe(307);
    });

    it("passes through auth paths", async () => {
      for (const path of ["/login", "/sign-up", "/forgot-password", "/confirm"]) {
        const response = await updateSession(makeRequest(path));
        expect(response.status).not.toBe(307);
      }
    });

    it("passes through /~offline", async () => {
      const response = await updateSession(makeRequest("/~offline"));
      expect(response.status).not.toBe(307);
    });

    it("passes through /api/ routes", async () => {
      const response = await updateSession(makeRequest("/api/health"));
      expect(response.status).not.toBe(307);
    });
  });

  describe("authenticated user", () => {
    beforeEach(() => mockSupabase({ id: "user-1", email: "test@example.com" }));

    it("redirects to / when visiting /login", async () => {
      const response = await updateSession(makeRequest("/login"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/");
    });

    it("redirects to / when visiting /sign-up", async () => {
      const response = await updateSession(makeRequest("/sign-up"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/");
    });

    it("redirects to / when visiting /forgot-password", async () => {
      const response = await updateSession(makeRequest("/forgot-password"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/");
    });

    it("allows access to protected routes", async () => {
      const response = await updateSession(makeRequest("/dashboard"));
      expect(response.status).not.toBe(307);
    });
  });
});

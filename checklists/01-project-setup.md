# Phase 1 — Project Setup & Configuration

## Context for Claude Code

We are building a fitness tracking PWA using Next.js 16 (App Router), React 19, TypeScript 5.9 (strict), Supabase (Postgres + Auth + Storage), Drizzle ORM, shadcn/ui (New York style), Tailwind CSS v4, and pnpm. The boilerplate is already scaffolded at [full-stack-boilerplate](https://github.com/Dyslecix-Dev/full-stack-boilerplate). This phase ensures the foundation is wired up correctly before building features.

**Critical — read before starting:**

- Next.js 16 uses `proxy.ts` (not `middleware.ts`) for request interception. The boilerplate already has this.
- `cookies()` and `headers()` from `next/headers` are **async** in Next.js 16. Always `await` them.
- Never create Supabase clients at module scope — always inside function bodies.

---

## Pre-flight: What the Boilerplate Already Provides

The boilerplate ships with these — **do not recreate them**. Only modify if a checklist item below says to:

- Supabase client utilities: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server component/action), `lib/supabase/proxy.ts` (session refresh)
- `proxy.ts` at project root (refreshes Supabase auth cookies on every request)
- Auth pages: login, sign-up, forgot-password, confirm callback
- Root layout with ThemeProvider (next-themes), Toaster (sonner), NuqsAdapter
- Sentry config: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`
- Global error boundary at `app/error.tsx`
- Not-found page at `app/not-found.tsx`
- `lib/logger.ts` with structured JSON logging (prod) / readable (dev), controlled by `LOG_LEVEL`
- Rate limiting via `lib/rate-limit.ts` (Upstash Redis in prod, in-memory fallback for dev)
- Husky pre-commit hook running lint-staged
- Prettier configured with 200 char width, CRLF, organize-imports + tailwindcss plugins
- ESLint configured
- Drizzle ORM with config at `drizzle.config.ts`
- PWA support via Serwist (service worker, manifest, offline fallback page)
- Recharts, Zustand, nuqs, Conform, Zod v4, Motion — all installed
- `lib/config.ts` — single source of truth for app name, description, and URL. Import from here, never hardcode.
- `lib/storage/` — Supabase Storage helpers (`uploadFile`, `deleteFile`, `getPublicUrl`, `getSignedUrl`) + `uploadFileAction` server action
- `lib/db/paginate.ts` — offset pagination helper for Drizzle queries
- `lib/email/` — Resend client + `sendEmail()` helper (renders HTML + plain-text automatically)
- `emails/` directory — React Email templates (`welcome.tsx`, `reset-password.tsx`, `otp.tsx`). Preview with `pnpm email:dev`.

---

## Checklist

### Environment Variables

- [x] Verify `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (this is the anon key — the boilerplate uses `PUBLISHABLE_KEY`, not `ANON_KEY`)
- [x] Verify `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to client)
- [x] Verify `.env.local` has `SUPABASE_JWT_SECRET` (used for JWT verification in the proxy)
- [x] Verify `POSTGRES_URL` (pooled, for runtime) and `POSTGRES_URL_NON_POOLING` (direct, for migrations) are set — these are the Vercel-Supabase integration names. Do NOT use `DATABASE_URL` / `DIRECT_URL`.
- [x] Verify `USDA_API_KEY` is set — required, not optional. Register for a free key at [USDA](https://fdc.nal.usda.gov/api-key-signup). Do NOT default to `DEMO_KEY`; it is shared across the internet and rate-limited to ~30 requests/IP/hour.
- [x] Verify `drizzle.config.ts` references `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` (not `DATABASE_URL` / `DIRECT_URL`)

### Route Group Restructure

- [x] The boilerplate ships with `app/auth/` and `app/protected/` (flat directories). Convert these to **route groups**: rename to `app/(auth)/` and `app/(protected)/`. Route groups prevent the folder name from appearing in the URL while allowing shared layouts.
- [x] After converting to `app/(auth)/`, update all internal links, redirects, and `emailRedirectTo` values in auth forms — the `auth/` segment is removed from URLs (e.g. `/auth/login` → `/login`).
- [x] Verify password reset flow exists: `/forgot-password` + `/update-password`
- [x] Verify email confirmation callback route exists at `app/(auth)/confirm/route.ts`

### Auth Guards (in `proxy.ts`)

- [x] After the route group rename, update the protection logic in `lib/supabase/proxy.ts`. Since `(auth)` does not appear in the URL, the proxy must check individual auth paths (e.g. `/login`, `/sign-up`) rather than a single `/auth/` prefix.
- [x] Verify `proxy.ts` redirects unauthenticated users away from protected routes
- [x] Verify `proxy.ts` redirects authenticated users away from auth pages (e.g. paths starting with `/login`, `/sign-up`, etc.)
- [x] The boilerplate already has `LogoutButton` component. Verify it calls `supabase.auth.signOut()` and redirects to `/login`.

### TanStack Query Provider

- [x] Create `components/query-provider.tsx` — a `"use client"` component that wraps children in `QueryClientProvider` from `@tanstack/react-query`
- [x] Add `QueryProvider` to the root layout (`app/layout.tsx`) wrapping the page content, alongside the existing ThemeProvider, Toaster, and NuqsAdapter

### Base Layout

- [x] Create a protected layout at `app/(protected)/layout.tsx` that:
  - Calls `supabase.auth.getClaims()` (fast, local JWT read — no network call) to get the user identity
  - Uses the `sub` (user ID) from claims to fetch the `user_profiles` row from the database
  - If no profile exists yet (first login), creates a bare `user_profiles` row with `auth_user_id = claims.sub`
  - Passes user profile data to children via React context or a Zustand store
  - Checks `onboarding_completed` — if `false`, redirects to `/onboarding`
  - **Do NOT use `getUser()` here** — it makes a network round-trip to Supabase on every page navigation. Reserve `getUser()` for sensitive server actions only.
- [x] Create `components/bottom-nav.tsx` — a mobile bottom navigation bar (PWA-first): Dashboard, Workouts, Nutrition, More (sleep + mental health + settings). Highlights the active route.
- [x] Create `components/sidebar-nav.tsx` — a desktop sidebar with the same links
- [x] Use responsive rendering: bottom nav on mobile (`md:hidden`), sidebar on desktop (`hidden md:block`) via Tailwind breakpoints
- [x] Verify dark mode toggle works via next-themes (already configured in boilerplate)

### Shared UI Components

- [x] Verify shadcn/ui is installed with New York style and these components are available: Button, Input, Label, Card, Dialog, Sheet, Select, Tabs, Progress, Badge, Separator, Skeleton, DropdownMenu. Add any missing via `pnpm dlx shadcn@latest add <name>`. Do NOT add the shadcn Form component — we use Conform for forms.
- [ ] Create `components/page-header.tsx` — reusable `PageHeader` (title + optional subtitle + optional action button)
- [ ] Create `components/empty-state.tsx` — reusable `EmptyState` (icon + message + optional CTA)
- [ ] Create `components/loading-skeleton.tsx` — reusable `LoadingSkeleton` that accepts a variant (card, list, detail)
- [ ] Create `components/confirm-dialog.tsx` — reusable `ConfirmDialog` (title, description, confirm/cancel actions, destructive variant)

### Shared Constants (Early Setup)

- [ ] Create `lib/workout-constants.ts` with:
  - `SECTION_LABELS` mapping: `{ warm_up: "Dynamic Warm-Up", main: "Main Routine", cooldown: "Static Cooldown" }`
  - `EXERCISE_CATEGORIES` array: `["strength", "cardio", "bodyweight", "flexibility", "other"]`
  - `MUSCLE_GROUPS` array: `["chest", "back", "shoulders", "biceps", "triceps", "core", "quadriceps", "hamstrings", "glutes", "calves", "full_body", "other"]`
  - `PROGRESS_METRIC_MAP` mapping category → progress_metric_type
- [ ] Create `lib/nutrition-constants.ts` with:
  - `MEAL_TYPES` array: `["breakfast", "lunch", "dinner", "snack"]`
  - `SERVING_UNITS` array: `["g", "ml", "oz", "cup", "piece", "tbsp", "tsp", "slice"]`

### `idb` Dependency

- [ ] Verify `idb` is installed (`pnpm add idb`). This is used in Phase 12 for the offline workout queue. Installing it now avoids a mid-build surprise.

### Verification

- [ ] Run `pnpm lint` — no errors
- [ ] Run `pnpm build` — builds successfully

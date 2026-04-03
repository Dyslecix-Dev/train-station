# Auth Patterns

## Stack

- **Provider**: Supabase Auth
- **Session**: Cookie-based via `@supabase/ssr`
- **Proxy**: Next.js proxy (session validation and route protection)

## How Auth Works (End-to-End)

1. User submits the login form (`components/login-form.tsx`) with email and password
2. The form calls `supabase.auth.signInWithPassword()`, which sets session cookies in the browser
3. On every subsequent request, `proxy.ts` runs and calls `supabase.auth.getClaims()` to validate the session
4. If the session is missing or expired, the proxy redirects to `/login?next=/original-path`
5. Protected pages (e.g., `app/(protected)/dashboard/page.tsx`) read the user's claims via `createClient()` from `lib/supabase/server.ts`

Sign-up follows a similar flow but routes through email confirmation (`/confirm`) before creating the session.

## Architecture

There are three Supabase client variants, each for a different context:

| Client                     | File                     | Context                                           |
| -------------------------- | ------------------------ | ------------------------------------------------- |
| `createClient()` (server)  | `lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| `createClient()` (browser) | `lib/supabase/client.ts` | Client Components (`"use client"`)                |
| `updateSession()`          | `lib/supabase/proxy.ts`  | Proxy (session refresh)                           |

### Fluid Compute Warning

**Never store the Supabase client in a global variable.** Always create a new client per function call. This is required for Next.js Fluid Compute compatibility.

```ts
// CORRECT
export async function myServerAction() {
  const supabase = await createClient();
  // use supabase...
}

// WRONG - will cause random logouts
const supabase = await createClient();
export async function myServerAction() {
  // don't do this
}
```

## Session Proxy

> **`proxy.ts` replaces `middleware.ts`**
>
> In Next.js 16, `middleware.ts` was renamed to `proxy.ts` and the exported function was renamed from `middleware()` to `proxy()`. The behavior is identical — it runs on every matched request before the page renders. If you're coming from a Next.js 14/15 project, this is the same concept; only the file name and export name changed. There is no `middleware.ts` in this project.
>
> See the [Next.js 16 docs](https://nextjs.org/docs/app/building-your-application/routing/middleware) for details.

The proxy in `proxy.ts` runs on every request (except static files/images). It:

1. Creates a Supabase server client with cookie access
2. Calls `supabase.auth.getClaims()` to validate/refresh the session
3. Redirects unauthenticated users to `/login` if they access protected routes

**Critical**: Do not add code between `createServerClient()` and `getClaims()` in the proxy. This can cause random session drops.

### Route matcher

```ts
// Matches all routes EXCEPT static files and images
"/((?!_next/static|_next/image|serwist|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)";
```

> **Note:** `serwist` is excluded so the service worker route bypasses the proxy. `favicon.ico` must be placed in the `app/` folder (not `public/`) so Next.js serves it as a route and the proxy matcher can correctly exclude it.

```ts

```

## Auth Routes

| Route              | Purpose                  | Component            |
| ------------------ | ------------------------ | -------------------- |
| `/login`           | Email/password login     | `LoginForm`          |
| `/sign-up`         | New account registration | `SignUpForm`         |
| `/sign-up-success` | Post-signup confirmation | Static page          |
| `/forgot-password` | Request password reset   | `ForgotPasswordForm` |
| `/update-password` | Set new password         | `UpdatePasswordForm` |
| `/confirm`         | Email OTP verification   | Route handler (GET)  |
| `/error`           | Auth error display       | Static page          |

## Protected Routes

Any route under `app/(protected)/` is guarded by the proxy. Both `(auth)` and `(protected)` are route groups — the parentheses do not appear in the URL. The proxy checks URL paths, not filesystem paths, so it checks for known auth page paths (e.g. `/login`, `/sign-up`) to identify auth pages and redirects everything else when unauthenticated.

To protect additional routes, update the condition in `lib/supabase/proxy.ts`:

```ts
const authPaths = ["/login", "/sign-up", "/sign-up-success", "/forgot-password", "/update-password", "/confirm", "/error"];

if (request.nextUrl.pathname !== "/" && !user && !authPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
  // redirect to login
}
```

## Auth Components

- **`AuthButton`** (server component): Shows the current user's email and a logout button when authenticated, or sign in/sign up links when not.
- **`LoginForm`** (client component): Email/password form using `supabase.auth.signInWithPassword()`. Redirects to `/dashboard` on success.
- **`SignUpForm`** (client component): Email/password form using `supabase.auth.signUp()`. Includes password confirmation. Redirects to `/sign-up-success`.
- **`LogoutButton`** (client component): Calls `supabase.auth.signOut()` and redirects to `/login`.

## Getting User Data in Server Components

### `getClaims()` vs `getUser()`

- **`getClaims()`** — reads the JWT locally (fast, no network call). Use it when you just need to check if a user is logged in or read basic info like `email` and `sub` from the token. This is what the proxy and `AuthButton` use.
- **`getUser()`** — makes a request to Supabase (slower, but returns guaranteed-current data). Use it when you need fresh user info like recently updated metadata, or when you need to verify the user still exists (e.g., before a sensitive action).

For most pages, `getClaims()` is the right choice:

```ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function MyComponent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  return <div>Hello, {data.claims.email}</div>;
}
```

## Supabase Email Confirmation Setup

For sign-up and password reset to work, you need to configure redirect URLs in the Supabase dashboard:

1. Go to [Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)
2. Set **Site URL** to `http://localhost:3000` (or your production domain)
3. Add these to **Redirect URLs**:
   - `http://localhost:3000/**` (for local development)
   - `https://your-production-domain.com/**` (for production)

These redirect URLs are used by the sign-up confirmation email (`emailRedirectTo` in `sign-up-form.tsx`) and the password reset email (`redirectTo` in `forgot-password-form.tsx`). Without them, users clicking confirmation links will see an error.

### Email confirmation behavior

By default, Supabase requires email confirmation before a user can sign in. You can change this:

1. Go to [Authentication → Providers → Email](https://supabase.com/dashboard/project/_/auth/providers)
2. Toggle "Confirm email" on or off depending on your needs

When confirmation is enabled, `supabase.auth.signUp()` creates the user but they can't sign in until they click the confirmation link. The full-stack boilerplate handles this by redirecting to `/sign-up-success` which tells the user to check their email.

## Supabase Emails vs. Resend Emails

This project has **two separate email systems** — don't confuse them:

| System                   | Purpose                                                            | Templates                                             | Configured in                  |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------ |
| **Supabase Auth emails** | Confirmation, password reset, magic links                          | Supabase dashboard → Authentication → Email Templates | Supabase dashboard             |
| **Resend + React Email** | Transactional emails your app sends (welcome, notifications, etc.) | `emails/` directory in this repo                      | `lib/email/`, `RESEND_API_KEY` |

Supabase sends its own emails for auth flows (sign-up confirmation, password reset). You can customize their content and appearance in the Supabase dashboard under **Authentication → Email Templates**, but they are not related to the React Email templates in `emails/`.

The React Email templates (`emails/welcome.tsx`, `emails/reset-password.tsx`, etc.) are for emails **your application** sends via Resend — for example, a welcome email after a user completes onboarding, or a notification email.

## Environment Variables

Auth requires these env vars (see `docs/environment.md` for full list):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (used in browser)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key (used in browser)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only, bypasses RLS)
- `SUPABASE_JWT_SECRET` - JWT verification secret

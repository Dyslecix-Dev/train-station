# Train Station

A fitness tracking PWA built with Next.js 16, Supabase, and Drizzle ORM. Tracks workouts, nutrition, sleep, and mental health in a mobile-first progressive web app.

## Features

| Pillar        | What it does                                                            |
| ------------- | ----------------------------------------------------------------------- |
| Workouts      | Templates, active tracking with sets/rest timers, history, 1RM progress |
| Nutrition     | USDA food search, meal logging, macros, water intake, body stats        |
| Sleep         | Bedtime/wake time logging, duration, quality, trend charts              |
| Mental Health | Mood score, emotion tags, journal entries, trend charts                 |
| Dashboard     | Today summary across all pillars, weekly trends, consistency streak     |

## Tech Stack

| Category      | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Framework     | Next.js 16, React 19, TypeScript 5.9                          |
| Database      | PostgreSQL (Supabase), Drizzle ORM                            |
| Auth          | Supabase Auth (cookie sessions, proxy-based route protection) |
| UI            | shadcn/ui (New York), Tailwind CSS v4, Radix UI               |
| State         | Zustand (active workout), TanStack Query, nuqs (URL params)   |
| Forms         | Conform, Zod v4                                               |
| PWA           | Serwist (service worker, offline workout, installable)        |
| Testing       | Vitest (unit), Playwright (e2e), Lighthouse CI (perf)         |
| Code Quality  | ESLint, Prettier, CI pipelines via GitHub Actions             |
| Animations    | Motion (Framer Motion)                                        |
| Charts        | Recharts                                                      |
| Email         | Resend + React Email (welcome email, transactional)           |
| Notifications | Sonner (toasts)                                               |
| Dark Mode     | next-themes (system, light, dark)                             |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) v10+
- A [Supabase](https://supabase.com/) project
- A [USDA FoodData Central API key](https://fdc.nal.usda.gov/api-key-signup) (free, required for nutrition search)

### Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials and `USDA_API_KEY`. See [docs/environment.md](docs/environment.md) for all variables.

3. **Configure Supabase Auth**

   In your [Supabase dashboard](https://supabase.com/dashboard) under **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`
   - Add `http://localhost:3000/**` to **Redirect URLs**

4. **Set up the database**

   ```bash
   pnpm db:push       # Push schema to Supabase
   pnpm db:seed       # Seed system exercises and foods
   ```

5. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
app/
  layout.tsx          # Root layout (theme, PWA, toasts, URL state, TanStack Query)
  page.tsx            # Landing page
  auth/               # Auth routes (login, sign-up, forgot-password, etc.)
  (protected)/        # Auth-guarded routes (dashboard, workouts, nutrition, etc.)
  ~offline/           # PWA offline fallback page
emails/               # React Email templates (welcome, reset-password, otp)
components/
  ui/                 # shadcn/ui primitives
  *.tsx               # Feature components
lib/
  db/                 # Drizzle ORM (client, schema, queries)
  email/              # Resend client + sendEmail helper
  storage/            # Supabase Storage helpers + upload action
  supabase/           # Supabase clients (server, browser, proxy)
  stores/             # Zustand stores (active-workout, etc.)
  hooks/              # Shared hooks (use-date-param, etc.)
  tdee.ts             # TDEE / BMR / macro target calculations
  units.ts            # Unit conversion (kg↔lb, km↔mi, formatters)
  streak.ts           # Streak update utility
  usda.ts             # USDA FoodData Central API integration
  config.ts           # App name, description, URL — single source of truth
  utils.ts            # cn() utility + helpers
proxy.ts              # Next.js 16 proxy (route protection + session refresh)
e2e/                  # Playwright E2E tests
drizzle/              # Generated migrations
checklists/           # Phased build checklists (00-MASTER-INDEX through 13)
docs/                 # Detailed documentation
.agents/skills/       # Claude Code agent skills
.github/workflows/    # CI pipelines (Vitest, Playwright, Lighthouse)
```

## Available Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `pnpm dev`              | Start development server       |
| `pnpm build`            | Build for production           |
| `pnpm start`            | Start production server        |
| `pnpm test`             | Run unit tests (Vitest)        |
| `pnpm test:e2e`         | Run E2E tests (Playwright)     |
| `pnpm lighthouse:local` | Build and run Lighthouse audit |
| `pnpm lint`             | Run ESLint                     |
| `pnpm format`           | Format code with Prettier      |
| `pnpm db:generate`      | Generate a database migration  |
| `pnpm db:migrate`       | Run pending migrations         |
| `pnpm db:push`          | Push schema to database (dev)  |
| `pnpm db:seed`          | Seed system exercises + foods  |
| `pnpm db:studio`        | Open Drizzle Studio            |
| `pnpm email:dev`        | Preview email templates (3001) |

## Documentation

Detailed guides for each area of the codebase:

- [Auth Patterns](docs/auth-patterns.md) — Supabase Auth, session management, route protection
- [CI/CD](docs/ci-cd.md) — GitHub Actions workflows, deployment
- [Deployment](docs/deployment.md) — Vercel, Docker, other platforms, production checklist
- [Component Patterns](docs/component-patterns.md) — shadcn/ui, styling, server vs client components, utility hooks
- [Database Patterns](docs/database-patterns.md) — Drizzle ORM, schema conventions, migrations, seeding
- [Email](docs/email.md) — Resend setup, sendEmail() helper, React Email templates
- [Environment Variables](docs/environment.md) — Required env vars, build-time validation
- [PWA](docs/pwa.md) — Service worker, manifest, offline support, push notifications
- [Testing](docs/testing.md) — Vitest, Playwright, Lighthouse CI configuration

## Build Phases

Work through the `checklists/` folder in order — each phase is self-contained and depends on the previous one completing. See [checklists/00-MASTER-INDEX.md](checklists/00-MASTER-INDEX.md) for the full build plan.

## Agent Skills (Claude Code)

Pre-configured [Claude Code](https://claude.ai/claude-code) agent skills in `.agents/skills/`:

| Skill                            | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| agent-email-inbox                | Resend inbox and email management patterns        |
| email-best-practices             | Email design, deliverability, and templates       |
| frontend-design                  | Frontend design best practices                    |
| react-email                      | React Email component patterns                    |
| resend                           | Resend API usage, sending patterns, and webhooks  |
| seo-audit                        | SEO auditing guidelines                           |
| shadcn                           | Component patterns, composition, forms, styling   |
| supabase-postgres-best-practices | PostgreSQL queries, schema, security, connections |
| systematic-debugging             | Root cause tracing and debugging strategies       |
| test-driven-development          | TDD workflow and testing anti-patterns            |
| vercel-react-best-practices      | React performance, rendering, bundle optimization |
| web-design-guidelines            | a11y, performance, and UX auditing guidelines     |

## Health Check & Uptime Monitoring

`GET /api/health` tests database connectivity:

- `200 { "status": "ok" }` — app and database are healthy
- `503 { "status": "error", "message": "Database connection failed" }` — database unreachable

Configure an uptime monitor (e.g., [Better Stack](https://betterstack.com/)) pointing to `https://your-domain.com/api/health`.

## Code Quality

- **ESLint** with Next.js, TypeScript, accessibility, and Prettier configs
- **Prettier** with import sorting and Tailwind class ordering
- **Build-time env validation** via Zod in `next.config.ts`
- **Security headers** (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **Lighthouse CI** enforces performance, accessibility, and best-practices scores above 90%

## License

[MIT](LICENSE)

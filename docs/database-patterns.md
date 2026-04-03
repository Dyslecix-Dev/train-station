# Database Patterns

## Stack

- **ORM**: Drizzle ORM (`drizzle-orm`)
- **Driver**: `postgres` (postgres.js)
- **Database**: PostgreSQL hosted on Supabase
- **Migrations**: Drizzle Kit (`drizzle-kit`)

## Schema

Schemas live in `lib/db/schema/`. Each domain gets its own file (e.g., `users.ts`). All schemas are re-exported from `lib/db/schema/index.ts`.

```ts
// lib/db/schema/user-profiles.ts
import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  displayName: text("display_name"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  timezone: text("timezone").notNull().default("America/New_York"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
```

### Adding a new table

1. Create a new file in `lib/db/schema/` (e.g., `posts.ts`)
2. Export the table from `lib/db/schema/index.ts`
3. Run `pnpm db:generate` to create a migration
4. Run `pnpm db:migrate` to apply it

## Database Client

The client is initialized in `lib/db/index.ts`:

```ts
import * as schema from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!, { prepare: false, max: 1 });
export const db = drizzle({ client, schema });
```

**Important**: `prepare: false` is required for Supabase transaction pool mode. Do not enable prepared statements.

## Drizzle Kit Configuration

`drizzle.config.ts` uses `POSTGRES_URL_NON_POOLING` for migrations (direct connection, not pooled). The runtime `lib/db/index.ts` uses `POSTGRES_URL` (pooled connection).

- **Migrations output**: `./drizzle/` directory
- **Schema source**: `./lib/db/schema/!(*test*).ts` — test files in the schema directory are excluded from migration generation

## Commands

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm db:push`     | Push schema directly (dev only)          |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate`  | Run pending migrations                   |
| `pnpm db:studio`   | Open Drizzle Studio GUI                  |

## Querying

Import `db` from `@/lib/db` and use Drizzle's query builder:

```ts
import { db } from "@/lib/db";
import { userProfiles, exercises } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";

// Select
const profile = await db.select().from(userProfiles).where(eq(userProfiles.authUserId, userId));

// Insert
await db.insert(userProfiles).values({ authUserId: userId });

// Update
await db.update(userProfiles).set({ displayName: "Alex" }).where(eq(userProfiles.id, profileId));

// Delete (soft-delete pattern for user-created exercises)
await db.update(exercises).set({ deletedAt: new Date() }).where(eq(exercises.id, exerciseId));

// Filter soft-deleted rows
const activeExercises = await db.select().from(exercises).where(isNull(exercises.deletedAt));
```

## Seeding

The seed script lives in `lib/db/seed.ts` and is run with:

```bash
pnpm db:seed
```

It inserts system exercises (visible to all users, `is_system = true`) across all categories (strength, cardio, bodyweight, flexibility). The seed uses `onConflictDoNothing()` so it is safe to run multiple times without duplicate key errors:

```ts
// lib/db/seed/exercises.ts
async function seedExercises() {
  await db
    .insert(schema.exercises)
    .values([
      { name: "Bench Press", category: "strength", isSystem: true, progressMetricType: "estimated_1rm", ... },
      // more exercises...
    ])
    .onConflictDoNothing();
}
```

The seed script uses `POSTGRES_URL_NON_POOLING` (direct connection) to avoid pooling issues during bulk inserts.

## Conventions

- Use `uuid` primary keys with `defaultRandom()`
- Include `createdAt` and `updatedAt` timestamps on all tables
- Use snake_case for column names in the database, camelCase in TypeScript
- One schema file per domain/table in `lib/db/schema/`

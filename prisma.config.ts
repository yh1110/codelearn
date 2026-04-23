import "dotenv/config";
import { defineConfig } from "prisma/config";

// Resolve a datasource URL without throwing at config-load time.
// `postinstall: prisma generate` runs in CI without a .env, and `prisma/config`
// `env()` throws `PrismaConfigEnvError` when the variable is missing which
// aborts `npm ci`. `prisma generate` does not actually connect to the database,
// so falling back to a valid-looking dummy URL is safe for generation. Actual
// connection commands (`db push` / `db seed`) will still fail fast if the real
// URL is not provided.
function resolveDatasourceUrl(): string {
  return (
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost:5432/placeholder"
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Schema engine (db push / migrate / seed) uses DIRECT_URL (port 5432) to
    // avoid the known pgbouncer "can-connect-to-database" hang on Supabase.
    // Runtime queries still use DATABASE_URL (port 6543 pooler) via the
    // Prisma driver adapter in `src/lib/prisma.ts`.
    url: resolveDatasourceUrl(),
    // Only consulted by `prisma migrate dev`. Supabase does not permit
    // Prisma to create an ephemeral shadow DB on the hosted instance, so
    // a local Docker Postgres (see docker-compose.yml) is used instead.
    // Leaving this undefined (not empty string) so `migrate dev` emits a
    // clear "SHADOW_DATABASE_URL is not set" error rather than a confusing
    // URL parse error; `prisma generate` does not read this field.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});

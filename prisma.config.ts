import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
    url: env("DIRECT_URL"),
  },
});

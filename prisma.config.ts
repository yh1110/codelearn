import { defineConfig, env } from "prisma/config";

// Prisma 7's config loader no longer auto-reads .env, so load it explicitly
// before env() is evaluated. Uses Node's built-in loader (>=20.12).
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // .env is optional at the filesystem level; env() below will throw
    // with a clearer message if DATABASE_URL is actually missing.
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

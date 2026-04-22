import { defineConfig } from "prisma/config";

// Prisma 7's config loader no longer auto-reads .env, so load it explicitly
// before the datasource block is evaluated. Uses Node's built-in loader
// (>=20.12); safe to skip if .env is absent (e.g. CI running prisma generate).
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // .env is optional; commands that actually need the URL will error at
    // call time with a PrismaConfigEnvError pointing at the missing var.
  }
}

// Resolve DATABASE_URL lazily so `prisma generate` (which does not need a
// live connection) can run in environments without the var set — notably
// CI, where the repo is checked out without a .env file.
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});

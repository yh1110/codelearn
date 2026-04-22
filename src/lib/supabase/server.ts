import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function readEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Create a Supabase client for Server Components / Server Actions / Route Handlers.
 * Returns `null` when Supabase env vars are not set so callers can fall back safely
 * during the pre-auth PoC phase (see issue #4 / #5).
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = readEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` is called from a Server Component where cookies are read-only.
          // Session refresh is handled by `src/proxy.ts`, so this is safe to ignore.
        }
      },
    },
  });
}

// Note: エッジランタイムで動作するため `import 'server-only'` は付けない
// (tech-stack.md § 2.12 の例外)。next.config / proxy (旧 middleware) 実行環境の
// 制約を参照。Node.js 専用 API / `server-only` モジュールはここに持ち込めない。
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 proxy (formerly middleware) — refreshes the Supabase auth session
 * so Server Components see an up-to-date token. Auth gating (redirects, role
 * checks) is intentionally deferred to issue #5; this file only keeps the
 * session cookie fresh.
 *
 * When Supabase env vars are missing (pre-setup), the proxy falls through so
 * the dev server keeps working without credentials.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    // Touch the session so `@supabase/ssr` performs a refresh if needed and
    // writes the rotated cookies via `setAll`. Session refresh is best-effort:
    // transient Supabase outages or malformed cookies must not break rendering.
    await supabase.auth.getUser();
  } catch {
    // Swallow; callers fall back to an unauthenticated state.
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, API routes, and static assets.
    // API routes that need auth perform their own requireAuth check (#5).
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

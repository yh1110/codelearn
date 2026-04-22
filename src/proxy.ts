// Note: エッジランタイムで動作するため `import 'server-only'` は付けない
// (tech-stack.md § 2.12 の例外)。next.config / proxy (旧 middleware) 実行環境の
// 制約を参照。Node.js 専用 API / `server-only` モジュールはここに持ち込めない。
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_PATHS = ["/login", "/auth/"] as const;

function isAuthPath(path: string): boolean {
  return AUTH_PATHS.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p));
}

/**
 * Next.js 16 proxy (formerly middleware). Responsibilities:
 * 1. Refresh the Supabase auth session cookie so Server Components see an
 *    up-to-date token.
 * 2. Redirect unauthenticated users to `/login` for protected routes, and
 *    bounce signed-in users away from `/login` back to home.
 *
 * When Supabase env vars are missing (pre-setup), the proxy falls through so
 * the dev server keeps working without credentials.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let response = NextResponse.next({ request });

  if (!url || !publishableKey) return response;

  const supabase = createServerClient(url, publishableKey, {
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

  let user: { id: string } | null = null;
  try {
    // Touch the session so `@supabase/ssr` performs a refresh if needed and
    // writes the rotated cookies via `setAll`.
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Swallow; transient Supabase outages fall through as unauthenticated.
  }

  const path = request.nextUrl.pathname;
  const authPath = isAuthPath(path);

  if (!user && !authPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    if (path !== "/") loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && path === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, API routes, and static assets.
    // API routes that need auth perform their own requireAuth check.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFrom(from: string | null): string {
  if (!from) return "/";
  // Only allow same-origin absolute paths to prevent open redirects.
  if (!from.startsWith("/") || from.startsWith("//")) return "/";
  return from;
}

function redirectWithError(request: NextRequest, message: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const from = safeFrom(request.nextUrl.searchParams.get("from"));

  if (!code) return redirectWithError(request, "認証コードがありません。");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirectWithError(request, "Supabase が構成されていません。");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Keep the raw Supabase error in logs for debugging, but never leak it to
    // the client URL — the message can disclose provider- / token-level
    // details that are not useful to end users.
    console.error("[auth/callback] exchangeCodeForSession failed:", error);
    return redirectWithError(request, "認証に失敗しました。もう一度お試しください。");
  }

  const dest = request.nextUrl.clone();
  dest.pathname = from;
  dest.search = "";
  return NextResponse.redirect(dest);
}

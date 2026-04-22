"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Provider = "github" | "google";

export default function LoginButtons({ from }: { from: string | null }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: Provider) {
    setError(null);
    setPending(provider);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase が構成されていません。");
        setPending(null);
        return;
      }
      const origin = window.location.origin;
      const callback = new URL("/auth/callback", origin);
      if (from?.startsWith("/")) callback.searchParams.set("from", from);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback.toString() },
      });
      if (error) {
        setError(error.message);
        setPending(null);
      }
      // On success the browser is redirected by the Supabase SDK, so we leave
      // `pending` set to keep the button disabled during the redirect.
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインインに失敗しました。");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pending !== null}
        onClick={() => signIn("github")}
      >
        <LogIn aria-hidden="true" />
        {pending === "github" ? "サインイン中..." : "GitHub でサインイン"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pending !== null}
        onClick={() => signIn("google")}
      >
        <LogIn aria-hidden="true" />
        {pending === "google" ? "サインイン中..." : "Google でサインイン"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

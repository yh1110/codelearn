import { LogOut, Pencil } from "lucide-react";
import Link from "next/link";

type ProfileHeroProps = {
  displayName: string;
  handle: string;
  initial: string;
  bio: string | null;
};

export function ProfileHero({ displayName, handle, initial, bio }: ProfileHeroProps) {
  return (
    <section
      className="relative mb-7 overflow-hidden rounded-[20px] p-7"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line-1)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.32 0.10 var(--accent-h)), oklch(0.22 0.04 220))",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background: "linear-gradient(180deg, transparent, var(--bg-1) 100%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex flex-wrap items-center gap-5">
        <div className="cm-avatar cm-avatar-xl" aria-hidden="true">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 font-bold text-[26px] tracking-tight">{displayName}</h1>
          <div className="mt-1 font-mono text-[13px]" style={{ color: "var(--text-3)" }}>
            @{handle}
          </div>
          {bio ? (
            <p
              className="mt-2 max-w-prose whitespace-pre-wrap text-[13px] leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              {bio}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/me/edit"
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] transition hover:bg-[var(--bg-3)]"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--line-2)",
              color: "var(--text-1)",
            }}
          >
            <Pencil className="size-3.5" aria-hidden="true" /> プロフィールを編集
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] transition hover:bg-[var(--bg-3)]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              <LogOut className="size-3.5" aria-hidden="true" /> サインアウト
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

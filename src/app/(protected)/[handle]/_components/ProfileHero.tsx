import type { ReactNode } from "react";

type ProfileHeroProps = {
  displayName: string;
  handle: string;
  initial: string;
  bio: string | null;
  /** Owner-only action buttons (edit / sign out). Hidden when viewing others. */
  actions?: ReactNode;
};

export function ProfileHero({ displayName, handle, initial, bio, actions }: ProfileHeroProps) {
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
            {handle}
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
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

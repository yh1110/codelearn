import { LogOut, Pencil } from "lucide-react";
import Link from "next/link";
import { settingsUrl } from "@/lib/routes";

export function ProfileOwnerActions() {
  return (
    <>
      <Link
        href={settingsUrl()}
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
    </>
  );
}

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { ProfileEditForm } from "./_components/ProfileEditForm";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const session = await requireAuth();
  const { profile } = session;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "720px" }}>
      <div className="mb-6">
        <Link
          href="/me"
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          プロフィールに戻る
        </Link>
      </div>

      <header className="mb-7">
        <h1 className="m-0 font-bold text-[24px] tracking-tight">プロフィール編集</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-3)" }}>
          表示名・ユーザー名・自己紹介・アバター画像 URL を編集できます。
        </p>
      </header>

      <section
        className="rounded-[16px] p-6"
        style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
      >
        <ProfileEditForm
          initial={{
            name: profile.name ?? "",
            username: profile.username ?? "",
            bio: profile.bio ?? "",
            avatarUrl: profile.avatarUrl ?? "",
          }}
        />
      </section>
    </div>
  );
}

import { BackLink } from "@/components/navigation/BackLink";
import { requireAuth } from "@/lib/auth";
import { profileUrl } from "@/lib/routes";
import { ProfileEditForm } from "./_components/ProfileEditForm";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const session = await requireAuth();
  const { profile } = session;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "720px" }}>
      <div className="mb-6">
        <BackLink fallbackHref={profileUrl(profile.handle)}>プロフィールに戻る</BackLink>
      </div>

      <header className="mb-7">
        <h1 className="m-0 font-bold text-[24px] tracking-tight">プロフィール編集</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-3)" }}>
          表示名・ハンドル・自己紹介・アバター画像 URL を編集できます。
        </p>
      </header>

      <section
        className="rounded-[16px] p-6"
        style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
      >
        <ProfileEditForm
          initial={{
            name: profile.name ?? "",
            handle: profile.handle,
            bio: profile.bio ?? "",
            avatarUrl: profile.avatarUrl ?? "",
          }}
        />
      </section>
    </div>
  );
}

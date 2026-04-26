"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileUrl } from "@/lib/routes";
import { UpdateProfileSchema } from "@/types/profile";

type FormValues = {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
};

type Props = {
  initial: FormValues;
};

// Cancel preserves the URL the user typed in: edits navigate back to that
// existing handle's profile, not to a stale value the user may have started
// typing into the form.

export function ProfileEditForm({ initial }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(UpdateProfileSchema) as Resolver<FormValues>,
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await updateProfileAction(values);

    if (result?.serverError) {
      setFormError(result.serverError);
      return;
    }
    if (result?.validationErrors) {
      setFormError("入力内容に誤りがあります");
      return;
    }

    // The handle may have changed; navigate using the freshly returned handle
    // so we land on the renamed profile URL rather than the prior one.
    const nextHandle = result?.data?.handle ?? values.handle;
    router.push(profileUrl(nextHandle));
    router.refresh();
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">表示名</Label>
        <Input
          id="profile-name"
          {...register("name")}
          aria-invalid={!!errors.name}
          autoComplete="name"
        />
        {errors.name && (
          <p className="text-xs text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-handle">ハンドル (URL 用)</Label>
        <Input
          id="profile-handle"
          {...register("handle")}
          placeholder="例: chii81020"
          aria-invalid={!!errors.handle}
          autoComplete="username"
        />
        <p className="text-xs text-muted-foreground">
          小文字英数字 / アンダースコア / ハイフン、2〜30 文字。プロフィール URL (/{"{"}ハンドル
          {"}"}) と作成したコレクションの URL に使われます。
        </p>
        <p className="text-xs text-muted-foreground">
          変更すると 90 日間は他のユーザーが取得できなくなります。旧 URL は無効になります。
        </p>
        {errors.handle && (
          <p className="text-xs text-destructive" role="alert">
            {errors.handle.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-bio">自己紹介</Label>
        <Textarea
          id="profile-bio"
          rows={4}
          {...register("bio")}
          placeholder="200 文字まで"
          aria-invalid={!!errors.bio}
        />
        {errors.bio && (
          <p className="text-xs text-destructive" role="alert">
            {errors.bio.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-avatar-url">アバター画像 URL</Label>
        {/* TODO: Replace with Supabase Storage upload (separate issue). */}
        <Input
          id="profile-avatar-url"
          type="url"
          {...register("avatarUrl")}
          placeholder="https://example.com/avatar.png"
          aria-invalid={!!errors.avatarUrl}
        />
        <p className="text-xs text-muted-foreground">
          現状は URL 直接入力のみ。アップロード機能は今後追加予定です。
        </p>
        {errors.avatarUrl && (
          <p className="text-xs text-destructive" role="alert">
            {errors.avatarUrl.message}
          </p>
        )}
      </div>

      {formError && (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          disabled={isSubmitting}
          onClick={() => router.push(profileUrl(initial.handle))}
          type="button"
          variant="outline"
        >
          キャンセル
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              保存中...
            </>
          ) : (
            "保存"
          )}
        </Button>
      </div>
    </form>
  );
}

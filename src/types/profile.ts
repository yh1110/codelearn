import { z } from "zod";
import { OFFICIAL_HANDLE } from "@/lib/routes";

const USERNAME_REGEX = /^[a-z0-9_-]+$/i;

// Reserved handles that own dedicated /courses/{handle}/... namespaces and so
// must never be claimed by an end user. `official` is the public alias for
// authorId IS NULL courses; expand this list as more reserved namespaces appear.
const RESERVED_USERNAMES: readonly string[] = [OFFICIAL_HANDLE];

// Empty strings from the edit form mean "clear this optional field". Normalise
// them to null up-front so the rest of the schema can stay tight.
const optionalText = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), schema.nullable());

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください").max(50, "50 文字以内で入力してください"),
  username: z
    .string()
    .trim()
    .min(2, "2 文字以上で入力してください")
    .max(30, "30 文字以内で入力してください")
    .regex(USERNAME_REGEX, "英数字、_、- のみ使用できます")
    .refine((v) => !RESERVED_USERNAMES.includes(v.toLowerCase()), "このユーザー名は使用できません"),
  bio: optionalText(z.string().trim().max(200, "200 文字以内で入力してください")),
  avatarUrl: optionalText(
    z
      .string()
      .trim()
      .max(500, "URL が長すぎます")
      .url("正しい URL を入力してください")
      .startsWith("https://", "https:// 始まりの URL を入力してください"),
  ),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

import { z } from "zod";

const USERNAME_REGEX = /^[a-z0-9_-]+$/i;

// Empty strings from the edit form mean "clear this optional field". Normalise
// them to null up-front so the rest of the schema can stay tight.
const optionalText = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), schema.nullable());

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください").max(50, "50 文字以内で入力してください"),
  username: optionalText(
    z
      .string()
      .trim()
      .min(2, "2 文字以上で入力してください")
      .max(30, "30 文字以内で入力してください")
      .regex(USERNAME_REGEX, "英数字、_、- のみ使用できます"),
  ),
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

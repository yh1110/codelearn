import { z } from "zod";

export const LessonSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug は小文字英数字とハイフンのみ");

const LessonBaseFields = {
  slug: LessonSlugSchema,
  title: z.string().min(1).max(120),
  contentMd: z.string().min(1).max(50_000),
  starterCode: z.string().max(50_000),
  expectedOutput: z.string().max(10_000).nullable(),
  order: z.number().int().min(0).max(10_000),
} as const;

export const CreateLessonSchema = z.object({
  courseId: z.cuid(),
  ...LessonBaseFields,
});

export const UpdateLessonSchema = z.object({
  id: z.cuid(),
  ...LessonBaseFields,
});

export const DeleteLessonSchema = z.object({
  id: z.cuid(),
});

export const TogglePublishLessonSchema = z.object({
  id: z.cuid(),
  isPublished: z.boolean(),
});

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>;

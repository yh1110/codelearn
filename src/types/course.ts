import { z } from "zod";

export const CourseSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug は小文字英数字とハイフンのみ");

export const CreateCourseSchema = z.object({
  slug: CourseSlugSchema,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  order: z.number().int().min(0).max(10_000),
});

export const UpdateCourseSchema = z.object({
  id: z.cuid(),
  slug: CourseSlugSchema,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  order: z.number().int().min(0).max(10_000),
});

export const DeleteCourseSchema = z.object({
  id: z.cuid(),
});

export const TogglePublishCourseSchema = z.object({
  id: z.cuid(),
  isPublished: z.boolean(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;

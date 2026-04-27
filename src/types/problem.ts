import { z } from "zod";

export const ProblemSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug は小文字英数字とハイフンのみ");

const ProblemBaseFields = {
  slug: ProblemSlugSchema,
  title: z.string().min(1).max(120),
  contentMd: z.string().min(1).max(50_000),
  starterCode: z.string().max(50_000),
  expectedOutput: z.string().max(10_000).nullable(),
  order: z.number().int().min(0).max(10_000),
} as const;

export const CreateProblemSchema = z.object({
  collectionId: z.cuid(),
  ...ProblemBaseFields,
});

export const UpdateProblemSchema = z.object({
  id: z.cuid(),
  ...ProblemBaseFields,
});

export const DeleteProblemSchema = z.object({
  id: z.cuid(),
});

export const TogglePublishProblemSchema = z.object({
  id: z.cuid(),
  isPublished: z.boolean(),
});

export type CreateProblemInput = z.infer<typeof CreateProblemSchema>;
export type UpdateProblemInput = z.infer<typeof UpdateProblemSchema>;

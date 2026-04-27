import { z } from "zod";

export const CollectionSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug は小文字英数字とハイフンのみ");

export const CreateCollectionSchema = z.object({
  slug: CollectionSlugSchema,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  order: z.number().int().min(0).max(10_000),
});

export const UpdateCollectionSchema = z.object({
  id: z.cuid(),
  slug: CollectionSlugSchema,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  order: z.number().int().min(0).max(10_000),
});

export const DeleteCollectionSchema = z.object({
  id: z.cuid(),
});

export const TogglePublishCollectionSchema = z.object({
  id: z.cuid(),
  isPublished: z.boolean(),
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;

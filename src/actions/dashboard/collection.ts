"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import {
  createCollection,
  deleteCollection,
  togglePublishCollection,
  updateCollection,
} from "@/services/collectionService";
import {
  CreateCollectionSchema,
  DeleteCollectionSchema,
  TogglePublishCollectionSchema,
  UpdateCollectionSchema,
} from "@/types/collection";

function revalidateDashboardAndExplore(): void {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/explore");
  revalidatePath("/", "layout");
}

export const createCollectionAction = actionClient
  .inputSchema(CreateCollectionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const collection = await createCollection({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndExplore();
    return { id: collection.id, slug: collection.slug };
  });

export const updateCollectionAction = actionClient
  .inputSchema(UpdateCollectionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const collection = await updateCollection({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndExplore();
    return { id: collection.id, slug: collection.slug };
  });

export const deleteCollectionAction = actionClient
  .inputSchema(DeleteCollectionSchema)
  .action(async ({ parsedInput, ctx }) => {
    await deleteCollection({
      id: parsedInput.id,
      authorId: ctx.userId,
    });
    revalidateDashboardAndExplore();
    return { id: parsedInput.id };
  });

export const togglePublishCollectionAction = actionClient
  .inputSchema(TogglePublishCollectionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const collection = await togglePublishCollection({
      id: parsedInput.id,
      authorId: ctx.userId,
      isPublished: parsedInput.isPublished,
    });
    revalidateDashboardAndExplore();
    return { id: collection.id, isPublished: collection.isPublished };
  });

"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import {
  createProblem,
  deleteProblem,
  togglePublishProblem,
  updateProblem,
} from "@/services/problemService";
import {
  CreateProblemSchema,
  DeleteProblemSchema,
  TogglePublishProblemSchema,
  UpdateProblemSchema,
} from "@/types/problem";

function revalidateDashboardAndExplore(): void {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/explore");
  revalidatePath("/", "layout");
}

export const createProblemAction = actionClient
  .inputSchema(CreateProblemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const problem = await createProblem({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndExplore();
    return { id: problem.id, slug: problem.slug, collectionId: problem.collectionId };
  });

export const updateProblemAction = actionClient
  .inputSchema(UpdateProblemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const problem = await updateProblem({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndExplore();
    return { id: problem.id, slug: problem.slug, collectionId: problem.collectionId };
  });

export const deleteProblemAction = actionClient
  .inputSchema(DeleteProblemSchema)
  .action(async ({ parsedInput, ctx }) => {
    await deleteProblem({
      id: parsedInput.id,
      authorId: ctx.userId,
    });
    revalidateDashboardAndExplore();
    return { id: parsedInput.id };
  });

export const togglePublishProblemAction = actionClient
  .inputSchema(TogglePublishProblemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const problem = await togglePublishProblem({
      id: parsedInput.id,
      authorId: ctx.userId,
      isPublished: parsedInput.isPublished,
    });
    revalidateDashboardAndExplore();
    return { id: problem.id, isPublished: problem.isPublished };
  });

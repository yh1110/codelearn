"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import {
  toggleCollectionBookmark,
  toggleCourseBookmark,
  toggleLessonBookmark,
  toggleProblemBookmark,
} from "@/services/bookmarkService";

const ToggleCourseBookmarkSchema = z.object({
  courseId: z.cuid(),
});

const ToggleLessonBookmarkSchema = z.object({
  lessonId: z.cuid(),
});

const ToggleCollectionBookmarkSchema = z.object({
  collectionId: z.cuid(),
});

const ToggleProblemBookmarkSchema = z.object({
  problemId: z.cuid(),
});

export const toggleCourseBookmarkAction = actionClient
  .inputSchema(ToggleCourseBookmarkSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await toggleCourseBookmark({
      userId: ctx.userId,
      courseId: parsedInput.courseId,
    });
    revalidatePath("/", "layout");
    return result;
  });

export const toggleLessonBookmarkAction = actionClient
  .inputSchema(ToggleLessonBookmarkSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await toggleLessonBookmark({
      userId: ctx.userId,
      lessonId: parsedInput.lessonId,
    });
    revalidatePath("/", "layout");
    return result;
  });

export const toggleCollectionBookmarkAction = actionClient
  .inputSchema(ToggleCollectionBookmarkSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await toggleCollectionBookmark({
      userId: ctx.userId,
      collectionId: parsedInput.collectionId,
    });
    revalidatePath("/", "layout");
    return result;
  });

export const toggleProblemBookmarkAction = actionClient
  .inputSchema(ToggleProblemBookmarkSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await toggleProblemBookmark({
      userId: ctx.userId,
      problemId: parsedInput.problemId,
    });
    revalidatePath("/", "layout");
    return result;
  });

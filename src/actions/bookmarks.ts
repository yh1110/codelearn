"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { toggleCourseBookmark, toggleLessonBookmark } from "@/services/bookmarkService";

const ToggleCourseBookmarkSchema = z.object({
  courseId: z.cuid(),
});

const ToggleLessonBookmarkSchema = z.object({
  lessonId: z.cuid(),
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

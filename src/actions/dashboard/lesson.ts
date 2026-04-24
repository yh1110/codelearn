"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import {
  createLesson,
  deleteLesson,
  togglePublishLesson,
  updateLesson,
} from "@/services/lessonService";
import {
  CreateLessonSchema,
  DeleteLessonSchema,
  TogglePublishLessonSchema,
  UpdateLessonSchema,
} from "@/types/lesson";

function revalidateDashboardAndCourses(): void {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/", "layout");
}

export const createLessonAction = actionClient
  .inputSchema(CreateLessonSchema)
  .action(async ({ parsedInput, ctx }) => {
    const lesson = await createLesson({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndCourses();
    return { id: lesson.id, slug: lesson.slug, courseId: lesson.courseId };
  });

export const updateLessonAction = actionClient
  .inputSchema(UpdateLessonSchema)
  .action(async ({ parsedInput, ctx }) => {
    const lesson = await updateLesson({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndCourses();
    return { id: lesson.id, slug: lesson.slug, courseId: lesson.courseId };
  });

export const deleteLessonAction = actionClient
  .inputSchema(DeleteLessonSchema)
  .action(async ({ parsedInput, ctx }) => {
    await deleteLesson({
      id: parsedInput.id,
      authorId: ctx.userId,
    });
    revalidateDashboardAndCourses();
    return { id: parsedInput.id };
  });

export const togglePublishLessonAction = actionClient
  .inputSchema(TogglePublishLessonSchema)
  .action(async ({ parsedInput, ctx }) => {
    const lesson = await togglePublishLesson({
      id: parsedInput.id,
      authorId: ctx.userId,
      isPublished: parsedInput.isPublished,
    });
    revalidateDashboardAndCourses();
    return { id: lesson.id, isPublished: lesson.isPublished };
  });

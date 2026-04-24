"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import {
  createCourse,
  deleteCourse,
  togglePublishCourse,
  updateCourse,
} from "@/services/courseService";
import {
  CreateCourseSchema,
  DeleteCourseSchema,
  TogglePublishCourseSchema,
  UpdateCourseSchema,
} from "@/types/course";

function revalidateDashboardAndCourses(): void {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/", "layout");
}

export const createCourseAction = actionClient
  .inputSchema(CreateCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const course = await createCourse({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndCourses();
    return { id: course.id, slug: course.slug };
  });

export const updateCourseAction = actionClient
  .inputSchema(UpdateCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const course = await updateCourse({
      authorId: ctx.userId,
      ...parsedInput,
    });
    revalidateDashboardAndCourses();
    return { id: course.id, slug: course.slug };
  });

export const deleteCourseAction = actionClient
  .inputSchema(DeleteCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    await deleteCourse({
      id: parsedInput.id,
      authorId: ctx.userId,
    });
    revalidateDashboardAndCourses();
    return { id: parsedInput.id };
  });

export const togglePublishCourseAction = actionClient
  .inputSchema(TogglePublishCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const course = await togglePublishCourse({
      id: parsedInput.id,
      authorId: ctx.userId,
      isPublished: parsedInput.isPublished,
    });
    revalidateDashboardAndCourses();
    return { id: course.id, isPublished: course.isPublished };
  });

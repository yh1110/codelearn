"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { completeLesson, completeProblem } from "@/services/progressService";

const CompleteLessonSchema = z.object({
  lessonId: z.cuid(),
});

const CompleteProblemSchema = z.object({
  problemId: z.cuid(),
});

export const completeLessonAction = actionClient
  .inputSchema(CompleteLessonSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await completeLesson({
      userId: ctx.userId,
      lessonId: parsedInput.lessonId,
    });
    revalidatePath("/", "layout");
    return result;
  });

export const completeProblemAction = actionClient
  .inputSchema(CompleteProblemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await completeProblem({
      userId: ctx.userId,
      problemId: parsedInput.problemId,
    });
    revalidatePath("/", "layout");
    return result;
  });

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { markAllAsRead, markAsRead } from "@/services/notificationService";

const MarkAsReadSchema = z.object({
  id: z.cuid(),
});

export const markNotificationAsReadAction = actionClient
  .inputSchema(MarkAsReadSchema)
  .action(async ({ parsedInput, ctx }) => {
    await markAsRead({ id: parsedInput.id, userId: ctx.userId });
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
    return { ok: true as const };
  });

export const markAllNotificationsAsReadAction = actionClient
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    const count = await markAllAsRead(ctx.userId);
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
    return { ok: true as const, count };
  });

"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { updateProfile } from "@/services/profileService";
import { UpdateProfileSchema } from "@/types/profile";

export const updateProfileAction = actionClient
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const profile = await updateProfile(ctx.userId, parsedInput);
    revalidatePath("/me", "layout");
    revalidatePath("/me/edit");
    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
    };
  });

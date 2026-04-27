"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { updateProfile } from "@/services/profileService";
import { UpdateProfileSchema } from "@/types/profile";

export const updateProfileAction = actionClient
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    // The Zod schema (UpdateProfileSchema) and ctx.userId (= the signed-in
    // user's Profile.id) together enforce the authorization rule: a user can
    // only update their own Profile, since the WHERE clause is keyed on
    // ctx.userId. There is no path through this action that updates another
    // user's profile — Layer B / C defence in depth from issue #72.
    const profile = await updateProfile(ctx.userId, parsedInput);
    // The handle (and therefore /{handle}) may have changed. Revalidate the
    // settings editor and the layout so any cached profile chrome refreshes.
    revalidatePath("/settings/profile");
    revalidatePath("/", "layout");
    return {
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
    };
  });

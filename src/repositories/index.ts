import "server-only";

import { ProfileRepository } from "./profile.repository";
import { ProgressRepository } from "./progress.repository";

export const progressRepository = new ProgressRepository();
export const profileRepository = new ProfileRepository();

export { ProfileRepository, ProgressRepository };

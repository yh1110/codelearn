import "server-only";

import type { Profile } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type ProfileUpsertInput = {
  authUserId: string;
  name?: string | null;
  /** Required on create. Update path leaves the existing handle untouched. */
  handle: string;
  avatarUrl?: string | null;
};

export type ProfileUpdateInput = {
  name?: string | null;
  handle?: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export class ProfileRepository extends BaseRepository {
  async findById(id: string): Promise<Profile | null> {
    return this.client.profile.findUnique({ where: { id } });
  }

  async findByAuthUserId(authUserId: string): Promise<Profile | null> {
    return this.client.profile.findUnique({ where: { authUserId } });
  }

  async findByHandle(handle: string): Promise<Profile | null> {
    return this.client.profile.findUnique({ where: { handle } });
  }

  async upsert(input: ProfileUpsertInput): Promise<Profile> {
    return this.client.profile.upsert({
      where: { authUserId: input.authUserId },
      update: {
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
      },
      create: {
        authUserId: input.authUserId,
        name: input.name ?? null,
        handle: input.handle,
        avatarUrl: input.avatarUrl ?? null,
      },
    });
  }

  async update(id: string, input: ProfileUpdateInput): Promise<Profile> {
    return this.client.profile.update({
      where: { id },
      data: input,
    });
  }
}

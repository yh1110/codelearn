import "server-only";

import type { Profile } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type ProfileUpsertInput = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

export type ProfileUpdateInput = {
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};

export class ProfileRepository extends BaseRepository {
  async findById(id: string): Promise<Profile | null> {
    return this.client.profile.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.client.profile.findUnique({ where: { username } });
  }

  async upsert(input: ProfileUpsertInput): Promise<Profile> {
    return this.client.profile.upsert({
      where: { id: input.id },
      update: {
        email: input.email ?? null,
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
      },
      create: {
        id: input.id,
        email: input.email ?? null,
        name: input.name ?? null,
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

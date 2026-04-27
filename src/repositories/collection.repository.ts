import "server-only";

import type { Collection, Problem } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CollectionWithProblemIds = Collection & { problems: Pick<Problem, "id">[] };

export type CollectionAuthor = {
  id: string;
  name: string | null;
  handle: string;
  avatarUrl: string | null;
};

const COLLECTION_AUTHOR_SELECT = {
  id: true,
  name: true,
  handle: true,
  avatarUrl: true,
} as const;

export type CollectionWithProblemsAndAuthor = CollectionWithProblemIds & {
  author: CollectionAuthor;
};

export type CollectionDetailWithAuthor = Collection & {
  problems: Problem[];
  author: CollectionAuthor;
};

export type CreateCollectionInput = {
  authorId: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type UpdateCollectionInput = {
  slug?: string;
  title?: string;
  description?: string;
  order?: number;
};

export class CollectionRepository extends BaseRepository {
  async findAllPublishedByNewest(): Promise<CollectionWithProblemsAndAuthor[]> {
    return this.client.collection.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        problems: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
        author: { select: COLLECTION_AUTHOR_SELECT },
      },
    });
  }

  async findPublishedByHandleAndSlugWithPublishedProblems(params: {
    handle: string;
    slug: string;
  }): Promise<CollectionDetailWithAuthor | null> {
    const { handle, slug } = params;
    const profile = await this.client.profile.findUnique({
      where: { handle },
      select: { id: true },
    });
    if (!profile) return null;

    return this.client.collection.findFirst({
      where: { slug, isPublished: true, authorId: profile.id },
      include: {
        problems: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
        author: { select: COLLECTION_AUTHOR_SELECT },
      },
    });
  }

  async findByAuthor(authorId: string): Promise<CollectionWithProblemIds[]> {
    return this.client.collection.findMany({
      where: { authorId },
      orderBy: { order: "asc" },
      include: {
        problems: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async findById(id: string): Promise<Collection | null> {
    return this.client.collection.findUnique({ where: { id } });
  }

  async create(input: CreateCollectionInput): Promise<Collection> {
    return this.client.collection.create({
      data: {
        authorId: input.authorId,
        slug: input.slug,
        title: input.title,
        description: input.description,
        order: input.order,
        isPublished: input.isPublished ?? false,
      },
    });
  }

  async update(id: string, input: UpdateCollectionInput): Promise<Collection> {
    return this.client.collection.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<Collection> {
    return this.client.collection.delete({ where: { id } });
  }

  async togglePublish(id: string, isPublished: boolean): Promise<Collection> {
    return this.client.collection.update({
      where: { id },
      data: { isPublished },
    });
  }
}

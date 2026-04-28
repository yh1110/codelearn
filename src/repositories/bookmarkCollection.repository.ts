import "server-only";

import type { BookmarkCollection, Collection, Problem } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CollectionBookmarkAuthor = {
  id: string;
  name: string | null;
  handle: string;
  avatarUrl: string | null;
};

export type CollectionBookmarkWithCollection = BookmarkCollection & {
  collection: Collection & {
    author: CollectionBookmarkAuthor;
    problems: Pick<Problem, "id">[];
  };
};

export class BookmarkCollectionRepository extends BaseRepository {
  async findByUser(userId: string): Promise<CollectionBookmarkWithCollection[]> {
    return this.client.bookmarkCollection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        collection: {
          include: {
            author: {
              select: { id: true, name: true, handle: true, avatarUrl: true },
            },
            problems: {
              where: { isPublished: true },
              select: { id: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
  }

  async find(userId: string, collectionId: string): Promise<BookmarkCollection | null> {
    return this.client.bookmarkCollection.findUnique({
      where: { userId_collectionId: { userId, collectionId } },
    });
  }

  async create(userId: string, collectionId: string): Promise<BookmarkCollection> {
    return this.client.bookmarkCollection.create({
      data: { userId, collectionId },
    });
  }

  async delete(userId: string, collectionId: string): Promise<void> {
    await this.client.bookmarkCollection.delete({
      where: { userId_collectionId: { userId, collectionId } },
    });
  }
}

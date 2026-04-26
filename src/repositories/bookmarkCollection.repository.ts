import "server-only";

import type { BookmarkCollection, Collection } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CollectionBookmarkWithCollection = BookmarkCollection & {
  collection: Collection & { author: { handle: string } };
};

export class BookmarkCollectionRepository extends BaseRepository {
  async findByUser(userId: string): Promise<CollectionBookmarkWithCollection[]> {
    return this.client.bookmarkCollection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        collection: {
          include: { author: { select: { handle: true } } },
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

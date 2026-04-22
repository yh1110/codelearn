import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export abstract class BaseRepository {
  constructor(protected readonly client: PrismaClient | Prisma.TransactionClient = prisma) {}

  async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return (this.client as PrismaClient).$transaction(fn);
  }
}

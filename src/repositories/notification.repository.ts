import "server-only";

import type { Notification, NotificationType } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CreateNotificationInput = {
  recipientId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  linkUrl?: string | null;
};

export class NotificationRepository extends BaseRepository {
  async findByRecipient(recipientId: string, limit = 20): Promise<Notification[]> {
    return this.client.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.client.notification.count({
      where: { recipientId, readAt: null },
    });
  }

  async findByIdForRecipient(id: string, recipientId: string): Promise<Notification | null> {
    return this.client.notification.findFirst({
      where: { id, recipientId },
    });
  }

  // Scoped by recipientId so a user cannot flip someone else's notification.
  async markAsRead(id: string, recipientId: string): Promise<number> {
    const result = await this.client.notification.updateMany({
      where: { id, recipientId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.client.notification.updateMany({
      where: { recipientId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.client.notification.create({
      data: {
        recipientId: input.recipientId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        linkUrl: input.linkUrl ?? null,
      },
    });
  }
}

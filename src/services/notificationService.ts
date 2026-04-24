import "server-only";

import type { Notification, NotificationType } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import { type NotificationRepository, notificationRepository } from "@/repositories";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function getNotifications(
  params: { userId: string; limit?: number },
  repository: NotificationRepository = notificationRepository,
): Promise<Notification[]> {
  const { userId } = params;
  const limit = clampLimit(params.limit);
  logInfo("notificationService.getNotifications.start", { userId, limit });
  try {
    const notifications = await repository.findByRecipient(userId, limit);
    logInfo("notificationService.getNotifications.success", {
      userId,
      count: notifications.length,
    });
    return notifications;
  } catch (error) {
    logError("notificationService.getNotifications.error", { userId, limit }, error);
    throw handleUnknownError(error);
  }
}

export async function getUnreadCount(
  userId: string,
  repository: NotificationRepository = notificationRepository,
): Promise<number> {
  logInfo("notificationService.getUnreadCount.start", { userId });
  try {
    const count = await repository.countUnread(userId);
    logInfo("notificationService.getUnreadCount.success", { userId, count });
    return count;
  } catch (error) {
    logError("notificationService.getUnreadCount.error", { userId }, error);
    throw handleUnknownError(error);
  }
}

export async function markAsRead(
  params: { id: string; userId: string },
  repository: NotificationRepository = notificationRepository,
): Promise<void> {
  const { id, userId } = params;
  logInfo("notificationService.markAsRead.start", { id, userId });
  try {
    // Two-step: look up ownership to distinguish "not found" vs "not yours"
    // vs "already read". markAsRead's updateMany filters by both id and
    // recipientId and returns 0 for any of those cases, so we need the
    // lookup to return the correct error shape.
    const existing = await repository.findByIdForRecipient(id, userId);
    if (!existing) {
      // Also covers the case where the notification exists but belongs to
      // someone else — findByIdForRecipient filters by recipientId, so the
      // caller cannot tell the two apart. Return NotFoundError either way
      // (avoid leaking existence of other users' notifications).
      throw new NotFoundError(`Notification not found: ${id}`);
    }
    await repository.markAsRead(id, userId);
    logInfo("notificationService.markAsRead.success", { id, userId });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) throw error;
    logError("notificationService.markAsRead.error", { id, userId }, error);
    throw handleUnknownError(error);
  }
}

export async function markAllAsRead(
  userId: string,
  repository: NotificationRepository = notificationRepository,
): Promise<number> {
  logInfo("notificationService.markAllAsRead.start", { userId });
  try {
    const count = await repository.markAllAsRead(userId);
    logInfo("notificationService.markAllAsRead.success", { userId, count });
    return count;
  } catch (error) {
    logError("notificationService.markAllAsRead.error", { userId }, error);
    throw handleUnknownError(error);
  }
}

export type CreateNotificationParams = {
  recipientId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  linkUrl?: string | null;
};

// Wrapper intended for future call sites (comments / likes / follows) so those
// services don't reach into the notification repository directly.
export async function createNotification(
  params: CreateNotificationParams,
  repository: NotificationRepository = notificationRepository,
): Promise<Notification> {
  logInfo("notificationService.createNotification.start", {
    recipientId: params.recipientId,
    type: params.type,
  });
  try {
    const created = await repository.create(params);
    logInfo("notificationService.createNotification.success", {
      id: created.id,
      recipientId: created.recipientId,
      type: created.type,
    });
    return created;
  } catch (error) {
    logError(
      "notificationService.createNotification.error",
      { recipientId: params.recipientId, type: params.type },
      error,
    );
    throw handleUnknownError(error);
  }
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}

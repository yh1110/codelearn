import "server-only";

import type { HandleReservation } from "@prisma/client";
import { BaseRepository } from "./base.repository";

const RESERVATION_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class HandleReservationRepository extends BaseRepository {
  async findByHandle(handle: string): Promise<HandleReservation | null> {
    return this.client.handleReservation.findUnique({ where: { handle } });
  }

  /**
   * Park a handle for {@link RESERVATION_DAYS} days starting from `now`.
   * Re-using the same handle resets the timer (intentional: a handle that
   * cycles through several owners restarts the cooldown each rename).
   */
  async reserve(handle: string, now: Date = new Date()): Promise<HandleReservation> {
    const releasedAt = new Date(now.getTime() + RESERVATION_DAYS * MS_PER_DAY);
    return this.client.handleReservation.upsert({
      where: { handle },
      update: { releasedAt },
      create: { handle, releasedAt },
    });
  }

  /** Remove reservations whose cooldown has elapsed. Idempotent. */
  async purgeExpired(now: Date = new Date()): Promise<number> {
    const result = await this.client.handleReservation.deleteMany({
      where: { releasedAt: { lte: now } },
    });
    return result.count;
  }
}

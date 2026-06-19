import { storeRepository } from "~/server/repositories/store-repository";
import type { AvailabilitySlotView } from "~/shared/reservation-types";
import { getTokyoDateRange } from "~/shared/tokyo-date";

export async function listVisibleSlots(storeId: string, now = new Date()): Promise<AvailabilitySlotView[]> {
  const range = getTokyoDateRange(now);
  return storeRepository.listSlotsByStore({ storeId, range });
}

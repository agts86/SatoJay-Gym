import { listBookedStartsByStore } from "~/server/repositories/booking-repository";
import type { AvailabilitySlotView } from "~/shared/reservation-types";
import { addDaysTokyo, createTokyoSlotUtc, formatTokyoDateKey, getTokyoDateRange } from "~/shared/tokyo-date";

const firstSlotHour = 10;
const lastSlotStartHour = 19;
const visibleDays = 30;

export async function listVisibleSlots(storeId: string, now = new Date()): Promise<AvailabilitySlotView[]> {
  const range = getTokyoDateRange(now);
  const bookedStarts = await listBookedStartsByStore({ storeId, range });
  return buildVisibleSlots({ bookedStarts, now, storeId });
}

export function buildVisibleSlots(params: { bookedStarts: Date[]; now: Date; storeId: string }): AvailabilitySlotView[] {
  const bookedStartKeys = new Set(params.bookedStarts.map((startsAt) => startsAt.toISOString()));
  const todayKey = formatTokyoDateKey(params.now);
  const slots: AvailabilitySlotView[] = [];

  for (let dayOffset = 0; dayOffset < visibleDays; dayOffset += 1) {
    const dateKey = addDaysTokyo(todayKey, dayOffset);
    slots.push(...buildSlotsForDate({ bookedStartKeys, dateKey, storeId: params.storeId }));
  }

  return slots;
}

export function isReservableGeneratedSlot(params: { endsAt: Date; now: Date; startsAt: Date }): boolean {
  const range = getTokyoDateRange(params.now);
  const startsAtHour = Number(formatTokyoHour(params.startsAt));
  return (
    params.startsAt >= range.from &&
    params.startsAt < range.to &&
    startsAtHour >= firstSlotHour &&
    startsAtHour <= lastSlotStartHour &&
    params.startsAt.getUTCMinutes() === 0 &&
    params.startsAt.getUTCSeconds() === 0 &&
    params.startsAt.getUTCMilliseconds() === 0 &&
    params.endsAt.getTime() - params.startsAt.getTime() === 3_600_000
  );
}

function buildSlotsForDate(params: { bookedStartKeys: Set<string>; dateKey: string; storeId: string }): AvailabilitySlotView[] {
  const slots: AvailabilitySlotView[] = [];
  for (let hour = firstSlotHour; hour <= lastSlotStartHour; hour += 1) {
    const startsAt = createTokyoSlotUtc(params.dateKey, hour);
    const endsAt = createTokyoSlotUtc(params.dateKey, hour + 1);
    const isBooked = params.bookedStartKeys.has(startsAt.toISOString());
    slots.push({
      id: `${params.storeId}_${startsAt.toISOString()}`,
      storeId: params.storeId,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      isBooked,
      selectable: !isBooked,
      label: isBooked ? "予約済み" : "予約可能",
    });
  }
  return slots;
}

function formatTokyoHour(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    hour12: false,
  }).format(date);
}

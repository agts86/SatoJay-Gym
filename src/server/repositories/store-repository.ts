import type { AvailabilitySlot, Store } from "@prisma/client";
import { prisma } from "~/server/prisma/client";
import { KANTO_PREFECTURES, type AvailabilitySlotView, type Prefecture, type StoreSummary } from "~/shared/reservation-types";

interface SlotSearchCondition {
  storeId: string;
  range: {
    from: Date;
    to: Date;
  };
}

function toPrefecture(value: string): Prefecture {
  if (KANTO_PREFECTURES.includes(value as Prefecture)) {
    return value as Prefecture;
  }
  return "東京都";
}

function toStoreSummary(store: Store): StoreSummary {
  return {
    id: store.id,
    name: store.name,
    prefecture: toPrefecture(store.prefecture),
    access: store.access,
    businessHours: "24時間営業",
    facilities: store.facilities,
    programs: store.programs,
    priceText: store.priceText,
  };
}

function toSlotView(slot: AvailabilitySlot & { booking: { id: string } | null }): AvailabilitySlotView {
  const isBooked = slot.booking !== null;
  return {
    id: slot.id,
    storeId: slot.storeId,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    isBooked,
    selectable: !isBooked,
    label: isBooked ? "予約済み" : "予約可能",
  };
}

export const storeRepository = {
  listPrefectures(): Prefecture[] {
    return [...KANTO_PREFECTURES];
  },

  async listStoresByPrefecture(prefecture: Prefecture): Promise<StoreSummary[]> {
    const stores = await prisma.store.findMany({
      where: { prefecture },
      orderBy: { name: "asc" },
    });
    return stores.map(toStoreSummary);
  },

  async listStores(): Promise<StoreSummary[]> {
    const stores = await prisma.store.findMany({
      orderBy: [{ prefecture: "asc" }, { name: "asc" }],
    });
    return stores.map(toStoreSummary);
  },

  async listSlotsByStore({ range, storeId }: SlotSearchCondition): Promise<AvailabilitySlotView[]> {
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        storeId,
        startsAt: {
          gte: range.from,
          lt: range.to,
        },
      },
      include: {
        booking: {
          select: { id: true },
        },
      },
      orderBy: { startsAt: "asc" },
    });
    return slots.map(toSlotView);
  },

  async findStore(storeId: string): Promise<StoreSummary | null> {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    return store ? toStoreSummary(store) : null;
  },
};

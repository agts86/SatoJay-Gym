import type { Store } from "@prisma/client";
import { prisma } from "~/server/prisma/client";
import { KANTO_PREFECTURES, type Prefecture, type StoreSummary } from "~/shared/reservation-types";

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

  async findStore(storeId: string): Promise<StoreSummary | null> {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    return store ? toStoreSummary(store) : null;
  },
};

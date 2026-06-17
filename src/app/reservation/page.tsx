import { ReservationSelectClient } from "~/features/reservation/reservation-select-client";
import { storeRepository } from "~/server/repositories/store-repository";
import { listVisibleSlots } from "~/server/services/availability-service";
import type { AvailabilitySlotView, Prefecture, StoreSummary } from "~/shared/reservation-types";

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const storesByPrefecture = await buildStores();
  const slotsByStore = await buildSlots(storesByPrefecture);
  return <ReservationSelectClient slotsByStore={slotsByStore} storesByPrefecture={storesByPrefecture} />;
}

async function buildStores(): Promise<Record<Prefecture, StoreSummary[]>> {
  const prefectures = storeRepository.listPrefectures();
  const entries = await Promise.all(prefectures.map(async (prefecture) => [prefecture, await storeRepository.listStoresByPrefecture(prefecture)] as const));
  return Object.fromEntries(entries) as Record<Prefecture, StoreSummary[]>;
}

async function buildSlots(storesByPrefecture: Record<Prefecture, StoreSummary[]>): Promise<Record<string, AvailabilitySlotView[]>> {
  const stores = Object.values(storesByPrefecture).flat();
  const entries = await Promise.all(stores.map(async (store) => [store.id, await listVisibleSlots(store.id)] as const));
  return Object.fromEntries(entries);
}

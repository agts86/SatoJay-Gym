"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AvailabilitySlotView, Prefecture, StoreSummary } from "~/shared/reservation-types";
import { KANTO_PREFECTURES } from "~/shared/reservation-types";
import { scrapeIds } from "~/shared/scrape-ids";
import { toTokyoDisplay } from "~/shared/tokyo-date";
import { useReservationDraft } from "./reservation-draft-store";

interface ReservationSelectClientProps {
  storesByPrefecture: Record<Prefecture, StoreSummary[]>;
  slotsByStore: Record<string, AvailabilitySlotView[]>;
}

export function ReservationSelectClient({ storesByPrefecture, slotsByStore }: ReservationSelectClientProps) {
  const router = useRouter();
  const { draft, setPrefecture, setStore, setSlot } = useReservationDraft();
  const prefecture = draft.prefecture ?? "東京都";
  const stores = storesByPrefecture[prefecture] ?? [];
  const slots = draft.store ? (slotsByStore[draft.store.id] ?? []) : [];

  return (
    <main className="page-shell">
      <h1 className="section-title">体験予約</h1>
      <div className="grid two">
        <section className="grid">
          <PrefectureSelect prefecture={prefecture} onChange={setPrefecture} />

          <StoreList selectedStoreId={draft.store?.id} stores={stores} onSelect={setStore} />
        </section>

        <section>
          <h2>空きカレンダー</h2>
          <AvailabilityCalendar
            selectedSlotId={draft.slot?.id}
            slots={slots}
            storeSelected={Boolean(draft.store)}
            onSelect={setSlot}
          />
          <div id={scrapeIds.reservation.selectedSlot} className="card" style={{ marginTop: 18 }}>
            {draft.slot ? toTokyoDisplay(draft.slot.startsAt) : "未選択"}
          </div>
          <button
            className="button"
            disabled={!draft.store || !draft.slot}
            id={scrapeIds.reservation.nextButton}
            onClick={() => router.push("/reservation/form")}
            style={{ marginTop: 18 }}
            type="button"
          >
            次へ
            <ArrowRight size={18} aria-hidden />
          </button>
        </section>
      </div>
    </main>
  );
}

function PrefectureSelect({ prefecture, onChange }: { prefecture: Prefecture; onChange: (prefecture: Prefecture) => void }) {
  return (
    <label className="field" htmlFor={scrapeIds.reservation.prefectureSelect}>
      都道府県
      <select id={scrapeIds.reservation.prefectureSelect} value={prefecture} onChange={(event) => onChange(event.target.value as Prefecture)}>
        {KANTO_PREFECTURES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function StoreList({
  selectedStoreId,
  stores,
  onSelect,
}: {
  selectedStoreId?: string;
  stores: StoreSummary[];
  onSelect: (store: StoreSummary) => void;
}) {
  return (
    <div id={scrapeIds.reservation.storeList} className="grid">
      {stores.length === 0 ? <p className="muted">該当店舗がありません。</p> : null}
      {stores.map((store) => (
        <button
          className="card"
          data-scrape={scrapeIds.reservation.storeCard}
          key={store.id}
          onClick={() => onSelect(store)}
          style={{ textAlign: "left", borderColor: selectedStoreId === store.id ? "var(--accent)" : undefined }}
          type="button"
        >
          <strong>{store.name}</strong>
          <p className="muted">{store.access}</p>
          <p>{store.businessHours}</p>
          <p>{store.programs.join(" / ")}</p>
          <p>{store.priceText}</p>
        </button>
      ))}
    </div>
  );
}

function AvailabilityCalendar({
  selectedSlotId,
  slots,
  storeSelected,
  onSelect,
}: {
  selectedSlotId?: string;
  slots: AvailabilitySlotView[];
  storeSelected: boolean;
  onSelect: (slot: AvailabilitySlotView) => void;
}) {
  return (
    <div id={scrapeIds.reservation.availabilityCalendar} className="grid" style={{ maxHeight: 620, overflow: "auto" }}>
      {!storeSelected ? <p className="muted">店舗を選択してください。</p> : null}
      {storeSelected && slots.length === 0 ? <p className="muted">選択可能な枠がありません。</p> : null}
      {slots.map((slot) => (
        <button
          className="card"
          data-scrape={scrapeIds.reservation.availableSlot}
          disabled={!slot.selectable}
          key={slot.id}
          onClick={() => onSelect(slot)}
          style={{ borderColor: selectedSlotId === slot.id ? "var(--signal)" : undefined }}
          type="button"
        >
          <strong>{toTokyoDisplay(slot.startsAt)}</strong>
          <span style={{ marginLeft: 12 }}>{slot.label}</span>
        </button>
      ))}
    </div>
  );
}

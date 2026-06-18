"use client";

import { ArrowRight, Building2, CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AvailabilitySlotView, Prefecture, StoreSummary } from "~/shared/reservation-types";
import { KANTO_PREFECTURES } from "~/shared/reservation-types";
import { scrapeIds } from "~/shared/scrape-ids";
import { formatTokyoDateKey, toTokyoDisplay } from "~/shared/tokyo-date";
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
      <div className="reservation-page-header">
        <div className="reservation-title-block">
          <p className="eyebrow">Trial Reservation</p>
          <h1 className="section-title">無料体験予約</h1>
        </div>
        <StepIndicator />
      </div>

      <div className="reservation-layout">
        <section className="reservation-store-panel">
          <PrefectureSelect prefecture={prefecture} onChange={setPrefecture} />

          <StoreList selectedStoreId={draft.store?.id} stores={stores} onSelect={setStore} />
        </section>

        <section className="reservation-calendar-panel">
          <div className="calendar-heading">
            <p className="muted">10:00〜20:00 / 1時間枠</p>
          </div>
          <SelectionSummary slot={draft.slot} store={draft.store} />
          <AvailabilityCalendar
            selectedSlotId={draft.slot?.id}
            slots={slots}
            storeSelected={Boolean(draft.store)}
            onSelect={setSlot}
          />
          <button
            className="button reservation-next-button"
            data-testid="reservation-next-button"
            disabled={!draft.store || !draft.slot}
            id={scrapeIds.reservation.nextButton}
            onClick={() => router.push("/reservation/form")}
            type="button"
          >
            <CalendarDays size={26} aria-hidden />
            無料体験を予約する
            <ArrowRight size={24} aria-hidden />
          </button>
          {!draft.slot ? <p className="reservation-next-help">日時を選択するとボタンを押せるようになります</p> : null}
        </section>
      </div>
    </main>
  );
}

function SelectionSummary({ slot, store }: { slot?: AvailabilitySlotView; store?: StoreSummary }) {
  return (
    <div className="reservation-selection-summary">
      <article className="selection-summary-card" data-testid="selected-store">
        <span>選択中の店舗</span>
        <div className="selection-summary-main">
          <MapPin size={22} aria-hidden />
          <div>
            <strong>{store?.name ?? "店舗を選択してください"}</strong>
          </div>
          <Building2 className="selection-summary-bg-icon" size={42} aria-hidden />
        </div>
      </article>
      <ChevronRight className="selection-summary-arrow" size={24} aria-hidden />
      <article id={scrapeIds.reservation.selectedSlot} className="selection-summary-card selected-slot-card">
        <span>選択中の日時</span>
        <div className="selection-summary-main">
          <CalendarDays size={23} aria-hidden />
          <strong>{slot ? `✓ ${toTokyoDisplay(slot.startsAt)}` : "日時を選択してください"}</strong>
        </div>
      </article>
    </div>
  );
}

function StepIndicator() {
  const steps = ["店舗選択", "日時選択", "情報入力", "完了"];

  return (
    <ol className="reservation-steps" aria-label="予約ステップ" data-testid="reservation-steps">
      {steps.map((step, index) => (
        <li className={index < 2 ? "active" : undefined} key={step}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
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
    <div id={scrapeIds.reservation.storeList} className="store-list" data-testid="store-list">
      {stores.length === 0 ? <p className="muted">該当店舗がありません。</p> : null}
      {stores.map((store) => {
        const selected = selectedStoreId === store.id;

        return (
          <button
            className={selected ? "store-card selected" : "store-card"}
            data-prefecture={store.prefecture}
            data-scrape={scrapeIds.reservation.storeCard}
            data-store-id={store.id}
            data-store-name={store.name}
            data-testid="store-card"
            key={store.id}
            onClick={() => onSelect(store)}
            type="button"
          >
            <span className="store-card-header">
              <strong>{store.name}</strong>
              {selected ? <span className="selected-badge">選択中</span> : null}
            </span>
            <span className="store-access">{store.access}</span>
            <span className="store-feature-list">
              {store.programs.slice(0, 3).map((program) => (
                <span className="store-feature" key={program}>
                  {program}
                </span>
              ))}
            </span>
          </button>
        );
      })}
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
  const calendarWeeks = buildCalendarWeeks(slots);
  const [weekIndex, setWeekIndex] = useState(0);
  const currentWeekIndex = Math.min(weekIndex, Math.max(calendarWeeks.length - 1, 0));
  const currentWeek = calendarWeeks[currentWeekIndex];

  return (
    <div id={scrapeIds.reservation.availabilityCalendar} className="availability-calendar">
      {!storeSelected ? <p className="muted">店舗を選択してください。</p> : null}
      {storeSelected && slots.length === 0 ? <p className="muted">選択可能な枠がありません。</p> : null}
      {currentWeek ? (
        <section className="calendar-week">
          <header className="calendar-week-header">
            <button
              className="calendar-nav-button"
              data-scrape={scrapeIds.reservation.previousWeekButton}
              data-testid={scrapeIds.reservation.previousWeekButton}
              disabled={currentWeekIndex === 0}
              id={scrapeIds.reservation.previousWeekButton}
              onClick={() => setWeekIndex((current) => Math.max(current - 1, 0))}
              type="button"
            >
              前の週
            </button>
            <div>
              <span>{currentWeek.weekLabel}</span>
              <small>{currentWeek.availableCount}枠 空き</small>
            </div>
            <button
              className="calendar-nav-button"
              data-scrape={scrapeIds.reservation.nextWeekButton}
              data-testid={scrapeIds.reservation.nextWeekButton}
              disabled={currentWeekIndex >= calendarWeeks.length - 1}
              id={scrapeIds.reservation.nextWeekButton}
              onClick={() => setWeekIndex((current) => Math.min(current + 1, calendarWeeks.length - 1))}
              type="button"
            >
              次の週
            </button>
          </header>
          <div className="calendar-table-wrap">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th scope="col">時間</th>
                  {currentWeek.days.map((day) => (
                    <th key={day.dateKey} scope="col">
                      <span>{formatMonthDayLabel(day.dateKey)}</span>
                      <small>{formatWeekdayLabel(day.dateKey)}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentWeek.times.map((time) => (
                  <tr key={time}>
                    <th scope="row">{time}</th>
                    {currentWeek.days.map((day) => {
                      const slot = day.slotsByTime.get(time);
                      if (!slot) {
                        return <td key={`${day.dateKey}-${time}`}>—</td>;
                      }
                      return (
                        <td key={slot.id}>
                          <button
                            aria-label={`${formatDateLabel(day.dateKey)} ${time} ${slot.label}`}
                            className={selectedSlotId === slot.id ? "calendar-slot selected" : "calendar-slot"}
                            data-scrape={scrapeIds.reservation.availableSlot}
                            data-selectable={slot.selectable ? "true" : "false"}
                            data-slot-id={slot.id}
                            data-starts-at={`${day.dateKey}T${time}:00+09:00`}
                            data-starts-at-utc={slot.startsAt}
                            data-store-id={slot.storeId}
                            disabled={!slot.selectable}
                            onClick={() => onSelect(slot)}
                            type="button"
                          >
                            {selectedSlotId === slot.id ? "✓" : slot.selectable ? "○" : "×"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function buildCalendarWeeks(slots: AvailabilitySlotView[]): {
  availableCount: number;
  days: { dateKey: string; slotsByTime: Map<string, AvailabilitySlotView> }[];
  times: string[];
  weekLabel: string;
}[] {
  const groupedByDate = new Map<string, AvailabilitySlotView[]>();
  for (const slot of slots) {
    const dateKey = formatTokyoDateKey(new Date(slot.startsAt));
    groupedByDate.set(dateKey, [...(groupedByDate.get(dateKey) ?? []), slot]);
  }

  const dateKeys = [...groupedByDate.keys()].sort();
  const weeks: string[][] = [];
  for (let index = 0; index < dateKeys.length; index += 7) {
    weeks.push(dateKeys.slice(index, index + 7));
  }

  return weeks.map((weekDateKeys) => {
    const days = weekDateKeys.map((dateKey) => {
      const slotsByTime = new Map<string, AvailabilitySlotView>();
      for (const slot of groupedByDate.get(dateKey) ?? []) {
        slotsByTime.set(formatTimeLabel(slot.startsAt), slot);
      }
      return { dateKey, slotsByTime };
    });
    const times = [...new Set(days.flatMap((day) => [...day.slotsByTime.keys()]))].sort();
    return {
      availableCount: days.reduce(
        (count, day) => count + [...day.slotsByTime.values()].filter((slot) => slot.selectable).length,
        0,
      ),
      days,
      times,
      weekLabel: `${formatDateLabel(weekDateKeys[0])}〜${formatDateLabel(weekDateKeys[weekDateKeys.length - 1])}`,
    };
  });
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function formatMonthDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function formatWeekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(date);
}

function formatTimeLabel(date: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

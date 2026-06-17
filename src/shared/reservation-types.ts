export const KANTO_PREFECTURES = [
  "東京都",
  "神奈川県",
  "千葉県",
  "埼玉県",
  "栃木県",
  "群馬県",
  "茨城県",
] as const;

export type Prefecture = (typeof KANTO_PREFECTURES)[number];

export interface StoreSummary {
  id: string;
  name: string;
  prefecture: Prefecture;
  access: string;
  businessHours: "24時間営業";
  facilities: string[];
  programs: string[];
  priceText: string;
}

export interface AvailabilitySlotView {
  id: string;
  storeId: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  selectable: boolean;
  label: "予約済み" | "予約可能";
}

export interface ReservationDraft {
  prefecture: Prefecture;
  store: StoreSummary;
  slot: AvailabilitySlotView;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trainingGoal: string;
  customerNote: string;
}

export interface AdminBookingRow {
  id: string;
  bookingNumber: string;
  storeName: string;
  startsAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trainingGoal: string;
  customerNote: string;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const SLOT_ALREADY_BOOKED_MESSAGE = "枠が埋まりましたので別の日時を選んでください";

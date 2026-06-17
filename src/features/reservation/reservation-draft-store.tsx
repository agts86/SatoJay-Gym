"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AvailabilitySlotView, Prefecture, ReservationDraft, StoreSummary } from "~/shared/reservation-types";

const storageKey = "satojay-reservation-draft";

interface DraftContextValue {
  draft: Partial<ReservationDraft>;
  setPrefecture: (prefecture: Prefecture) => void;
  setStore: (store: StoreSummary) => void;
  setSlot: (slot: AvailabilitySlotView) => void;
  updateCustomer: (customer: Pick<ReservationDraft, "customerName" | "customerEmail" | "customerPhone" | "trainingGoal" | "customerNote">) => void;
  clear: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function ReservationDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Partial<ReservationDraft>>(readStoredDraft);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  const value: DraftContextValue = {
    draft,
    setPrefecture: (prefecture) => setDraft((current) => ({ ...current, prefecture, store: undefined, slot: undefined })),
    setStore: (store) => setDraft((current) => ({ ...current, prefecture: store.prefecture, store, slot: undefined })),
    setSlot: (slot) => setDraft((current) => ({ ...current, slot })),
    updateCustomer: (customer) => setDraft((current) => ({ ...current, ...customer })),
    clear: () => setDraft({}),
  };

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

function readStoredDraft(): Partial<ReservationDraft> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.sessionStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Partial<ReservationDraft>) : {};
  } catch {
    return {};
  }
}

export function useReservationDraft() {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useReservationDraft must be used inside ReservationDraftProvider");
  }
  return context;
}

export function isDraftReadyForForm(
  draft: Partial<ReservationDraft>,
): draft is Pick<ReservationDraft, "prefecture" | "store" | "slot"> & Partial<ReservationDraft> {
  return Boolean(draft.prefecture && draft.store && draft.slot);
}

export function isDraftReadyForConfirm(draft: Partial<ReservationDraft>): draft is ReservationDraft {
  return Boolean(
    draft.prefecture &&
      draft.store &&
      draft.slot &&
      draft.customerName &&
      draft.customerEmail &&
      draft.customerPhone &&
      draft.trainingGoal,
  );
}

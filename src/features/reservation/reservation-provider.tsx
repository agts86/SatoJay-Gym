"use client";

import { ReservationDraftProvider } from "./reservation-draft-store";

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  return <ReservationDraftProvider>{children}</ReservationDraftProvider>;
}

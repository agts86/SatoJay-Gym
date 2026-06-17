"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { submitBooking, type ActionState } from "~/server/actions";
import { scrapeIds } from "~/shared/scrape-ids";
import { ReservationSummary } from "./reservation-summary";
import { isDraftReadyForConfirm, useReservationDraft } from "./reservation-draft-store";

const initialState: ActionState = { ok: false, message: "" };

export function ReservationConfirmClient() {
  const router = useRouter();
  const { draft } = useReservationDraft();
  const [state, action, pending] = useActionState(submitBooking, initialState);

  useEffect(() => {
    if (!isDraftReadyForConfirm(draft)) {
      router.replace("/reservation");
    }
  }, [draft, router]);

  useEffect(() => {
    if (state.ok && state.bookingNumber) {
      sessionStorage.setItem("satojay-last-booking-number", state.bookingNumber);
      router.push("/reservation/thanks");
    }
  }, [router, state]);

  if (!isDraftReadyForConfirm(draft)) {
    return null;
  }

  return (
    <main className="page-shell" id={scrapeIds.confirm.page}>
      <h1 className="section-title">予約内容確認</h1>
      <div className="grid two">
        <ReservationSummary draft={draft} />
        <section className="card">
          <p>氏名: {draft.customerName}</p>
          <p>メール: {draft.customerEmail}</p>
          <p>電話番号: {draft.customerPhone}</p>
          <p>目的: {draft.trainingGoal}</p>
          <p>備考: {draft.customerNote || "なし"}</p>
          {state.message ? <p style={{ color: state.ok ? "var(--accent)" : "#b91c1c" }}>{state.message}</p> : null}
          <form action={action} className="grid">
            <input name="storeId" type="hidden" value={draft.store.id} />
            <input name="slotId" type="hidden" value={draft.slot.id} />
            <input name="customerName" type="hidden" value={draft.customerName} />
            <input name="customerEmail" type="hidden" value={draft.customerEmail} />
            <input name="customerPhone" type="hidden" value={draft.customerPhone} />
            <input name="trainingGoal" type="hidden" value={draft.trainingGoal} />
            <input name="customerNote" type="hidden" value={draft.customerNote} />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="button secondary" onClick={() => router.push("/reservation/form")} type="button">
                <ArrowLeft size={18} aria-hidden />
                戻る
              </button>
              <button className="button" disabled={pending} id={scrapeIds.confirm.submitButton} type="submit">
                <Send size={18} aria-hidden />
                {pending ? "送信中" : "送信する"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

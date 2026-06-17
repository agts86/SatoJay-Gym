"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { reservationCustomerSchema } from "~/shared/reservation-schema";
import { scrapeIds } from "~/shared/scrape-ids";
import { ReservationSummary } from "./reservation-summary";
import { isDraftReadyForForm, useReservationDraft } from "./reservation-draft-store";

type FieldErrors = Record<string, string>;

export function ReservationFormClient() {
  const router = useRouter();
  const { draft, updateCustomer } = useReservationDraft();
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isDraftReadyForForm(draft)) {
      router.replace("/reservation");
    }
  }, [draft, router]);

  if (!isDraftReadyForForm(draft)) {
    return null;
  }

  return (
    <main className="page-shell">
      <h1 className="section-title">予約者情報</h1>
      <div className="grid two">
        <ReservationSummary draft={draft} />
        <form
          className="grid"
          id={scrapeIds.form.reservationForm}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const parsed = reservationCustomerSchema.safeParse(Object.fromEntries(formData));
            if (!parsed.success) {
              setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
              return;
            }
            updateCustomer(parsed.data);
            router.push("/reservation/confirm");
          }}
        >
          <CustomerField id={scrapeIds.form.customerName} label="氏名" name="customerName" defaultValue={draft.customerName} error={errors.customerName} />
          <CustomerField id={scrapeIds.form.customerEmail} label="メールアドレス" name="customerEmail" defaultValue={draft.customerEmail} error={errors.customerEmail} />
          <CustomerField id={scrapeIds.form.customerPhone} label="電話番号" name="customerPhone" defaultValue={draft.customerPhone} error={errors.customerPhone} />
          <CustomerField id={scrapeIds.form.trainingGoal} label="トレーニング目的" name="trainingGoal" defaultValue={draft.trainingGoal} error={errors.trainingGoal} />
          <label className="field" htmlFor={scrapeIds.form.customerNote}>
            備考
            <textarea defaultValue={draft.customerNote} id={scrapeIds.form.customerNote} name="customerNote" rows={5} />
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="button secondary" onClick={() => router.push("/reservation")} type="button">
              <ArrowLeft size={18} aria-hidden />
              戻る
            </button>
            <button className="button" id={scrapeIds.form.submitButton} type="submit">
              確認へ
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function CustomerField(props: { id: string; label: string; name: string; defaultValue?: string; error?: string }) {
  return (
    <label className="field" htmlFor={props.id}>
      {props.label}
      <input defaultValue={props.defaultValue} id={props.id} name={props.name} />
      {props.error ? <span style={{ color: "#b91c1c" }}>{props.error}</span> : null}
    </label>
  );
}

"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReservationCustomerInput } from "~/shared/reservation-schema";
import { reservationCustomerSchema } from "~/shared/reservation-schema";
import { scrapeIds } from "~/shared/scrape-ids";
import { ReservationSummary } from "./reservation-summary";
import { isDraftReadyForForm, useReservationDraft } from "./reservation-draft-store";

type RequiredCustomerFieldName = keyof Pick<ReservationCustomerInput, "customerName" | "customerEmail" | "customerPhone" | "trainingGoal">;
type FieldErrors = Partial<Record<RequiredCustomerFieldName, string>>;

interface CustomerFieldDefinition {
  id: string;
  label: string;
  name: RequiredCustomerFieldName;
  required: true;
}

interface CustomerFieldProps extends CustomerFieldDefinition {
  defaultValue?: string;
  error?: string;
}

const customerFields = [
  { id: scrapeIds.form.customerName, label: "氏名", name: "customerName", required: true },
  { id: scrapeIds.form.customerEmail, label: "メールアドレス", name: "customerEmail", required: true },
  { id: scrapeIds.form.customerPhone, label: "電話番号", name: "customerPhone", required: true },
  { id: scrapeIds.form.trainingGoal, label: "トレーニング目的", name: "trainingGoal", required: true },
] satisfies CustomerFieldDefinition[];

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
              setErrors(toFieldErrors(parsed.error.issues));
              return;
            }
            updateCustomer(parsed.data);
            router.push("/reservation/confirm");
          }}
        >
          {customerFields.map((field) => (
            <CustomerField key={field.name} {...field} defaultValue={draft[field.name]} error={errors[field.name]} />
          ))}
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

function CustomerField({ defaultValue, error, id, label, name, required }: CustomerFieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required ? <span className="required-mark">※</span> : null}
      </span>
      <input defaultValue={defaultValue} id={id} name={name} />
      {error ? <span style={{ color: "#b91c1c" }}>{error}</span> : null}
    </label>
  );
}

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of issues) {
    const fieldName = issue.path[0];
    if (isRequiredCustomerFieldName(fieldName)) {
      fieldErrors[fieldName] = issue.message;
    }
  }
  return fieldErrors;
}

function isRequiredCustomerFieldName(value: PropertyKey | undefined): value is RequiredCustomerFieldName {
  return customerFields.some((field) => field.name === value);
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { scrapeIds } from "~/shared/scrape-ids";

export function ReservationThanksClient() {
  const [bookingNumber] = useState(readLastBookingNumber);

  return (
    <main className="page-shell" id={scrapeIds.thanks.page}>
      <h1 className="section-title">予約完了</h1>
      <section className="card" id={scrapeIds.thanks.summary}>
        <p>体験予約を受け付けました。</p>
        <p>
          予約番号: <strong id={scrapeIds.thanks.number}>{bookingNumber || "確認中"}</strong>
        </p>
      </section>
      <Link className="button secondary" href="/" style={{ marginTop: 24 }}>
        LPへ戻る
      </Link>
    </main>
  );
}

function readLastBookingNumber(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.sessionStorage.getItem("satojay-last-booking-number") ?? "";
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { StoreSummary } from "~/shared/reservation-types";
import { scrapeIds } from "~/shared/scrape-ids";

export function AdminStoreList({ stores }: { stores: StoreSummary[] }) {
  return (
    <div className="grid three" id={scrapeIds.admin.storeList}>
      {stores.map((store) => (
        <Link className="card" data-scrape={scrapeIds.admin.storeCard} href={`/admin/bookings/${store.id}`} key={store.id}>
          <strong>{store.name}</strong>
          <p className="muted">{store.prefecture}</p>
          <span style={{ alignItems: "center", display: "inline-flex", gap: 8 }}>
            予約を見る
            <ArrowRight size={16} aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}

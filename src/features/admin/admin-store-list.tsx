import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { KANTO_PREFECTURES, type Prefecture, type StoreSummary } from "~/shared/reservation-types";
import { scrapeIds } from "~/shared/scrape-ids";

interface AdminStoreListProps {
  stores: StoreSummary[];
}

interface StoreGroup {
  prefecture: Prefecture;
  stores: StoreSummary[];
}

function groupStoresByPrefecture(stores: StoreSummary[]): StoreGroup[] {
  return KANTO_PREFECTURES.map((prefecture) => ({
    prefecture,
    stores: stores.filter((store) => store.prefecture === prefecture),
  })).filter((group) => group.stores.length > 0);
}

export function AdminStoreList({ stores }: AdminStoreListProps) {
  const storeGroups = groupStoresByPrefecture(stores);

  return (
    <div className="admin-store-list" id={scrapeIds.admin.storeList}>
      {storeGroups.map((group) => (
        <section className="admin-store-group" key={group.prefecture} aria-labelledby={`admin-store-group-${group.prefecture}`}>
          <div className="admin-store-group-header">
            <h2 id={`admin-store-group-${group.prefecture}`}>{group.prefecture}</h2>
            <span>{group.stores.length}店舗</span>
          </div>
          <div className="grid three">
            {group.stores.map((store) => (
              <Link className="card admin-store-card" data-scrape={scrapeIds.admin.storeCard} href={`/admin/bookings/${store.id}`} key={store.id}>
                <strong>{store.name}</strong>
                <span>
                  予約を見る
                  <ArrowRight size={16} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

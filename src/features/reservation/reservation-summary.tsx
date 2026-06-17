import type { ReservationDraft } from "~/shared/reservation-types";
import { scrapeIds } from "~/shared/scrape-ids";
import { toTokyoDisplay } from "~/shared/tokyo-date";

export function ReservationSummary({ draft }: { draft: Pick<ReservationDraft, "prefecture" | "store" | "slot"> }) {
  return (
    <dl id={scrapeIds.thanks.summary} className="card">
      <dt>都道府県</dt>
      <dd>{draft.prefecture}</dd>
      <dt>店舗</dt>
      <dd>{draft.store.name}</dd>
      <dt>予約日時</dt>
      <dd>{toTokyoDisplay(draft.slot.startsAt)}</dd>
    </dl>
  );
}

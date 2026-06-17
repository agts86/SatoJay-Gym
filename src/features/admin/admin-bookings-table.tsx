import type { AdminBookingRow } from "~/shared/reservation-types";
import { scrapeIds } from "~/shared/scrape-ids";
import { toTokyoDisplay } from "~/shared/tokyo-date";

export function AdminBookingsTable({ bookings }: { bookings: AdminBookingRow[] }) {
  if (bookings.length === 0) {
    return <p className="card">予約がありません。</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table id={scrapeIds.admin.bookingsTable} style={{ borderCollapse: "collapse", minWidth: 920, width: "100%" }}>
        <thead>
          <tr>
            <th>店舗</th>
            <th>日時</th>
            <th>氏名</th>
            <th>メール</th>
            <th>電話</th>
            <th>目的</th>
            <th>備考</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr data-scrape={scrapeIds.admin.bookingRow} key={booking.id}>
              <td data-scrape={scrapeIds.admin.bookingStore}>{booking.storeName}</td>
              <td data-scrape={scrapeIds.admin.bookingDatetime}>{toTokyoDisplay(booking.startsAt)}</td>
              <td data-scrape={scrapeIds.admin.bookingCustomerName}>{booking.customerName}</td>
              <td data-scrape={scrapeIds.admin.bookingCustomerEmail}>{booking.customerEmail}</td>
              <td data-scrape={scrapeIds.admin.bookingCustomerPhone}>{booking.customerPhone}</td>
              <td>{booking.trainingGoal}</td>
              <td>{booking.customerNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

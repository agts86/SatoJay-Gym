import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminBookingsTable } from "~/features/admin/admin-bookings-table";
import { listBookingsByStore } from "~/server/repositories/booking-repository";
import { adminSessionCookieName, verifySession } from "~/server/services/admin-auth-service";

export const dynamic = "force-dynamic";

export default async function StoreBookingsPage({ params }: { params: Promise<{ storeId: string }> }) {
  await requireAdmin();
  const { storeId } = await params;
  const bookings = await listBookingsByStore(storeId);

  return (
    <main className="page-shell">
      <Link className="button secondary" href="/admin/bookings">
        店舗一覧へ戻る
      </Link>
      <h1 className="section-title">予約一覧</h1>
      <AdminBookingsTable bookings={bookings} />
    </main>
  );
}

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  if (!verifySession(cookieStore.get(adminSessionCookieName)?.value).ok) {
    redirect("/admin/login");
  }
}

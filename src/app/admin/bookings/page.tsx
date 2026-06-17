import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminStoreList } from "~/features/admin/admin-store-list";
import { storeRepository } from "~/server/repositories/store-repository";
import { adminSessionCookieName, verifySession } from "~/server/services/admin-auth-service";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await requireAdmin();
  const stores = await storeRepository.listStores();
  return (
    <main className="page-shell">
      <h1 className="section-title">店舗一覧</h1>
      <AdminStoreList stores={stores} />
    </main>
  );
}

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  if (!verifySession(cookieStore.get(adminSessionCookieName)?.value).ok) {
    redirect("/admin/login");
  }
}

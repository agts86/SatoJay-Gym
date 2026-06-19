import { ReservationThanksClient } from "~/features/reservation/reservation-thanks-client";

interface ReservationThanksPageProps {
  searchParams: Promise<{
    orderId?: string | string[];
  }>;
}

export default async function ReservationThanksPage({ searchParams }: ReservationThanksPageProps) {
  const params = await searchParams;
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  return <ReservationThanksClient orderId={orderId ?? ""} />;
}

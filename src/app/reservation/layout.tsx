import { ReservationProvider } from "~/features/reservation/reservation-provider";

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return <ReservationProvider>{children}</ReservationProvider>;
}

import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import type { AdminBookingRow, Result } from "~/shared/reservation-types";
import type { CreateBookingInput } from "~/shared/reservation-schema";

export type BookingPersistenceError =
  | { type: "UNIQUE_SLOT_CONFLICT"; slotId: string }
  | { type: "BOOKING_NUMBER_CONFLICT"; bookingNumber: string }
  | { type: "UNKNOWN_PERSISTENCE_ERROR" };

export interface PersistedBooking {
  id: string;
  bookingNumber: string;
}

export async function createBooking(
  input: CreateBookingInput & { bookingNumber: string },
): Promise<Result<PersistedBooking, BookingPersistenceError>> {
  try {
    const booking = await db.booking.create({
      data: {
        bookingNumber: input.bookingNumber,
        storeId: input.storeId,
        slotId: input.slotId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        trainingGoal: input.trainingGoal,
        customerNote: input.customerNote,
      },
      select: {
        id: true,
        bookingNumber: true,
      },
    });
    return { ok: true, value: booking };
  } catch (error) {
    return { ok: false, error: mapCreateError(error, input) };
  }
}

export async function listBookingsByStore(storeId: string): Promise<AdminBookingRow[]> {
  const bookings = await db.booking.findMany({
    where: { storeId },
    include: {
      store: { select: { name: true } },
      slot: { select: { startsAt: true } },
    },
    orderBy: {
      slot: {
        startsAt: "asc",
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    storeName: booking.store.name,
    startsAt: booking.slot.startsAt.toISOString(),
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    trainingGoal: booking.trainingGoal,
    customerNote: booking.customerNote ?? "",
  }));
}

function mapCreateError(error: unknown, input: CreateBookingInput & { bookingNumber: string }): BookingPersistenceError {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : String(error.meta?.target ?? "");
    if (target.includes("slotId")) {
      return { type: "UNIQUE_SLOT_CONFLICT", slotId: input.slotId };
    }
    return { type: "BOOKING_NUMBER_CONFLICT", bookingNumber: input.bookingNumber };
  }
  return { type: "UNKNOWN_PERSISTENCE_ERROR" };
}

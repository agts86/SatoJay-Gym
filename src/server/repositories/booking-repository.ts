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
    const replayedBooking = await findSameBookingReplay(error, input);
    if (replayedBooking) {
      return { ok: true, value: replayedBooking };
    }
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
  if (isUniqueConflictOn(error, "slotId")) {
    return { type: "UNIQUE_SLOT_CONFLICT", slotId: input.slotId };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { type: "BOOKING_NUMBER_CONFLICT", bookingNumber: input.bookingNumber };
  }
  return { type: "UNKNOWN_PERSISTENCE_ERROR" };
}

async function findSameBookingReplay(
  error: unknown,
  input: CreateBookingInput & { bookingNumber: string },
): Promise<PersistedBooking | null> {
  if (!isUniqueConflictOn(error, "slotId")) {
    return null;
  }

  const booking = await db.booking.findUnique({
    where: { slotId: input.slotId },
    select: {
      id: true,
      bookingNumber: true,
      storeId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      trainingGoal: true,
      customerNote: true,
    },
  });

  if (!booking || !isSameBookingInput(booking, input)) {
    return null;
  }

  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
  };
}

function isSameBookingInput(
  booking: {
    storeId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    trainingGoal: string;
    customerNote: string | null;
  },
  input: CreateBookingInput,
): boolean {
  return (
    booking.storeId === input.storeId &&
    booking.customerName === input.customerName &&
    booking.customerEmail === input.customerEmail &&
    booking.customerPhone === input.customerPhone &&
    booking.trainingGoal === input.trainingGoal &&
    (booking.customerNote ?? "") === input.customerNote
  );
}

function isUniqueConflictOn(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : String(error.meta?.target ?? "");
  return target.includes(field);
}

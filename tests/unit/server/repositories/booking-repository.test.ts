import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    booking: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("~/server/db", () => ({
  db: dbMock,
}));

const bookingInput = {
  bookingNumber: "GYM-20260616-0002",
  storeId: "store_1",
  slotId: "slot_1",
  customerName: "佐藤 太郎",
  customerEmail: "taro@example.com",
  customerPhone: "03-1234-5678",
  trainingGoal: "体験",
  customerNote: "",
};

describe("booking-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the existing booking when a duplicate slot write is the same submission replay", async () => {
    dbMock.booking.create.mockRejectedValueOnce(uniqueConflict("slotId"));
    dbMock.booking.findUnique.mockResolvedValueOnce({
      id: "booking_1",
      bookingNumber: "GYM-20260616-0001",
      storeId: bookingInput.storeId,
      customerName: bookingInput.customerName,
      customerEmail: bookingInput.customerEmail,
      customerPhone: bookingInput.customerPhone,
      trainingGoal: bookingInput.trainingGoal,
      customerNote: bookingInput.customerNote,
    });

    const { createBooking } = await import("~/server/repositories/booking-repository");
    const result = await createBooking(bookingInput);

    expect(result).toEqual({
      ok: true,
      value: { id: "booking_1", bookingNumber: "GYM-20260616-0001" },
    });
  });

  it("keeps returning a slot conflict when the existing booking is a different customer", async () => {
    dbMock.booking.create.mockRejectedValueOnce(uniqueConflict("slotId"));
    dbMock.booking.findUnique.mockResolvedValueOnce({
      id: "booking_1",
      bookingNumber: "GYM-20260616-0001",
      storeId: bookingInput.storeId,
      customerName: "別の予約者",
      customerEmail: "other@example.com",
      customerPhone: bookingInput.customerPhone,
      trainingGoal: bookingInput.trainingGoal,
      customerNote: bookingInput.customerNote,
    });

    const { createBooking } = await import("~/server/repositories/booking-repository");
    const result = await createBooking(bookingInput);

    expect(result).toEqual({
      ok: false,
      error: { type: "UNIQUE_SLOT_CONFLICT", slotId: bookingInput.slotId },
    });
  });
});

function uniqueConflict(field: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
    meta: { target: [field] },
  });
}

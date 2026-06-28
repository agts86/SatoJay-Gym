import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateBookingInput } from "~/shared/reservation-schema";

const { dbMock, txMock } = vi.hoisted(() => {
  const dbMock = {
    availabilitySlot: {
      findUnique: vi.fn(),
    },
    booking: {
      create: vi.fn(),
    },
  };
  return { dbMock, txMock: dbMock };
});

vi.mock("~/server/prisma/client", () => ({
  prisma: dbMock,
}));

describe("booking-repository", () => {
  beforeEach(() => {
    txMock.availabilitySlot.findUnique.mockReset();
    txMock.booking.create.mockReset();
  });

  it("creates a booking with the provided client after checking the slot belongs to the store", async () => {
    txMock.availabilitySlot.findUnique.mockResolvedValueOnce({ storeId: "store_1" });
    txMock.booking.create.mockResolvedValueOnce({ id: "booking_1", bookingNumber: "GYM-20260616-0001" });

    const { createBooking } = await import("~/server/repositories/booking-repository");
    const result = await createBooking({ client: dbMock, input: createInput() });

    expect(txMock.availabilitySlot.findUnique).toHaveBeenCalledWith({
      where: { id: "slot_1" },
      select: { storeId: true },
    });
    expect(txMock.booking.create).toHaveBeenCalledWith({
      data: {
        bookingNumber: "GYM-20260616-0001",
        storeId: "store_1",
        slotId: "slot_1",
        customerName: "佐藤 太郎",
        customerEmail: "taro@example.com",
        customerPhone: "03-1234-5678",
        trainingGoal: "体験",
        customerNote: "",
      },
      select: {
        id: true,
        bookingNumber: true,
      },
    });
    expect(txMock.availabilitySlot.findUnique.mock.invocationCallOrder[0]).toBeLessThan(txMock.booking.create.mock.invocationCallOrder[0]);
    expect(result).toEqual({
      ok: true,
      value: { id: "booking_1", bookingNumber: "GYM-20260616-0001" },
    });
  });

  it("does not create a booking when the slot does not belong to the submitted store", async () => {
    txMock.availabilitySlot.findUnique.mockResolvedValueOnce({ storeId: "store_2" });

    const { createBooking } = await import("~/server/repositories/booking-repository");
    const result = await createBooking({ client: dbMock, input: createInput() });

    expect(txMock.booking.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      error: { type: "SLOT_STORE_MISMATCH", slotId: "slot_1", storeId: "store_1" },
    });
  });
});

function createInput(): CreateBookingInput & { bookingNumber: string } {
  return {
    submissionToken: "01234567-89ab-cdef-0123-456789abcdef",
    storeId: "store_1",
    slotId: "slot_1",
    customerName: "佐藤 太郎",
    customerEmail: "taro@example.com",
    customerPhone: "03-1234-5678",
    trainingGoal: "体験",
    customerNote: "",
    bookingNumber: "GYM-20260616-0001",
  };
}

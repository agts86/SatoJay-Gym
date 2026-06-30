import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateBookingInput } from "~/shared/reservation-schema";

const { dbMock, txMock } = vi.hoisted(() => {
  const dbMock = {
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
    txMock.booking.create.mockReset();
  });

  it("creates a booking for the submitted generated slot time", async () => {
    txMock.booking.create.mockResolvedValueOnce({ id: "booking_1", bookingNumber: "GYM-20260616-0001" });

    const { createBooking } = await import("~/server/repositories/booking-repository");
    const result = await createBooking({ client: dbMock, input: createInput() });

    expect(txMock.booking.create).toHaveBeenCalledWith({
      data: {
        bookingNumber: "GYM-20260616-0001",
        storeId: "store_1",
        startsAt: new Date("2026-06-16T01:00:00.000Z"),
        endsAt: new Date("2026-06-16T02:00:00.000Z"),
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
    expect(result).toEqual({
      ok: true,
      value: { id: "booking_1", bookingNumber: "GYM-20260616-0001" },
    });
  });
});

function createInput(): CreateBookingInput & { bookingNumber: string } {
  return {
    submissionToken: "01234567-89ab-cdef-0123-456789abcdef",
    storeId: "store_1",
    startsAt: "2026-06-16T01:00:00.000Z",
    endsAt: "2026-06-16T02:00:00.000Z",
    customerName: "佐藤 太郎",
    customerEmail: "taro@example.com",
    customerPhone: "03-1234-5678",
    trainingGoal: "体験",
    customerNote: "",
    bookingNumber: "GYM-20260616-0001",
  };
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { SLOT_ALREADY_BOOKED_MESSAGE } from "~/shared/reservation-types";

const { createBookingMock, txMock, withTransactionMock } = vi.hoisted(() => {
  const txMock = { name: "transaction-client" };
  const withTransactionMock = vi.fn(async (callback: (tx: typeof txMock) => unknown) => callback(txMock));
  const createBookingMock = vi.fn(async () => ({
    ok: false,
    error: { type: "UNIQUE_SLOT_CONFLICT" },
  }));
  return { createBookingMock, txMock, withTransactionMock };
});

vi.mock("~/server/repositories/booking-repository", () => ({
  createBooking: createBookingMock,
}));

vi.mock("~/server/prisma/functions", () => ({
  withTransaction: withTransactionMock,
}));

describe("booking-service", () => {
  beforeEach(() => {
    createBookingMock.mockClear();
    withTransactionMock.mockClear();
  });

  it("reuses the in-flight result for the same submission token", async () => {
    createBookingMock.mockResolvedValueOnce({
      ok: true,
      value: { id: "booking_1", bookingNumber: "GYM-20260616-0001" },
    });

    const { createReservation } = await import("~/server/services/booking-service");
    const input = {
      submissionToken: "01234567-89ab-cdef-0123-456789abcdef",
      storeId: "store_1",
      startsAt: "2026-06-16T01:00:00.000Z",
      endsAt: "2026-06-16T02:00:00.000Z",
      customerName: "佐藤 太郎",
      customerEmail: "taro@example.com",
      customerPhone: "03-1234-5678",
      trainingGoal: "体験",
      customerNote: "",
    };
    const [first, second] = await Promise.all([
      createReservation(input, new Date("2026-06-16T00:00:00+09:00")),
      createReservation(input, new Date("2026-06-16T00:00:00+09:00")),
    ]);

    expect(first).toEqual(second);
    expect(first).toEqual({
      ok: true,
      value: { bookingId: "booking_1", bookingNumber: "GYM-20260616-0001" },
    });
    expect(createBookingMock).toHaveBeenCalledTimes(1);
    expect(withTransactionMock).toHaveBeenCalledTimes(1);
    expect(createBookingMock).toHaveBeenCalledWith({
      client: txMock,
      input: expect.objectContaining({
        storeId: "store_1",
        startsAt: "2026-06-16T01:00:00.000Z",
        endsAt: "2026-06-16T02:00:00.000Z",
        bookingNumber: expect.stringMatching(/^GYM-20260616-\d{4}$/),
      }),
    });
  });

  it("generates a human-readable booking number for a Tokyo business date", async () => {
    const { generateBookingNumber } = await import("~/server/services/booking-service");

    expect(generateBookingNumber("2026-06-16")).toMatch(/^GYM-20260616-\d{4}$/);
  });

  it("maps slot unique conflicts to the required customer-facing message", async () => {
    createBookingMock.mockResolvedValueOnce({
      ok: false,
      error: { type: "UNIQUE_SLOT_CONFLICT" },
    });

    const { createReservation } = await import("~/server/services/booking-service");
    const result = await createReservation(
      {
        submissionToken: "fedcba98-7654-3210-fedc-ba9876543210",
        storeId: "store_1",
        startsAt: "2026-06-16T01:00:00.000Z",
        endsAt: "2026-06-16T02:00:00.000Z",
        customerName: "佐藤 太郎",
        customerEmail: "taro@example.com",
        customerPhone: "03-1234-5678",
        trainingGoal: "体験",
        customerNote: "",
      },
      new Date("2026-06-16T00:00:00+09:00"),
    );

    expect(result).toEqual({
      ok: false,
      error: { type: "SLOT_ALREADY_BOOKED", message: SLOT_ALREADY_BOOKED_MESSAGE },
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { SLOT_ALREADY_BOOKED_MESSAGE } from "~/shared/reservation-types";

vi.mock("~/server/repositories/booking-repository", () => ({
  createBooking: vi.fn(async () => ({
    ok: false,
    error: { type: "UNIQUE_SLOT_CONFLICT" },
  })),
}));

describe("booking-service", () => {
  it("generates a human-readable booking number for a Tokyo business date", async () => {
    const { generateBookingNumber } = await import("~/server/services/booking-service");

    expect(generateBookingNumber("2026-06-16")).toMatch(/^GYM-20260616-\d{4}$/);
  });

  it("maps slot unique conflicts to the required customer-facing message", async () => {
    const { createReservation } = await import("~/server/services/booking-service");
    const result = await createReservation({
      storeId: "store_1",
      slotId: "slot_1",
      customerName: "佐藤 太郎",
      customerEmail: "taro@example.com",
      customerPhone: "03-1234-5678",
      trainingGoal: "体験",
      customerNote: "",
    });

    expect(result).toEqual({
      ok: false,
      error: { type: "SLOT_ALREADY_BOOKED", message: SLOT_ALREADY_BOOKED_MESSAGE },
    });
  });
});

import { describe, expect, it } from "vitest";
import { createBookingInputSchema, reservationCustomerSchema } from "~/shared/reservation-schema";

describe("reservationCustomerSchema", () => {
  it("accepts required fields and a loose hyphenated phone number", () => {
    const result = reservationCustomerSchema.safeParse({
      customerName: "佐藤 太郎",
      customerEmail: "taro@example.com",
      customerPhone: "03-1234-5678",
      trainingGoal: "体験トレーニング",
      customerNote: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required fields and invalid email/phone", () => {
    const result = reservationCustomerSchema.safeParse({
      customerName: "",
      customerEmail: "invalid",
      customerPhone: "abc",
      trainingGoal: "",
      customerNote: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["customerName", "customerEmail", "customerPhone", "trainingGoal"]),
    );
  });
});

describe("createBookingInputSchema", () => {
  it("accepts generated slot times instead of a persisted slot id", () => {
    const result = createBookingInputSchema.safeParse({
      submissionToken: "01234567-89ab-cdef-0123-456789abcdef",
      storeId: "store_1",
      startsAt: "2026-06-16T01:00:00.000Z",
      endsAt: "2026-06-16T02:00:00.000Z",
      customerName: "佐藤 太郎",
      customerEmail: "taro@example.com",
      customerPhone: "03-1234-5678",
      trainingGoal: "体験トレーニング",
      customerNote: "",
    });

    expect(result.success).toBe(true);
  });
});

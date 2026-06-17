import { describe, expect, it } from "vitest";
import { reservationCustomerSchema } from "~/shared/reservation-schema";

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

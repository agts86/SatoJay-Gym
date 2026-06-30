import { describe, expect, it, vi } from "vitest";

const listBookedStartsByStore = vi.fn(async () => [new Date("2026-06-16T01:00:00.000Z")]);

vi.mock("~/server/repositories/booking-repository", () => ({
  listBookedStartsByStore,
}));

describe("availability-service", () => {
  it("generates slots from today through 30 days in Tokyo time and overlays bookings", async () => {
    const { listVisibleSlots } = await import("~/server/services/availability-service");

    const slots = await listVisibleSlots("store_1", new Date("2026-06-16T00:00:00.000Z"));

    expect(listBookedStartsByStore).toHaveBeenCalledWith({
      storeId: "store_1",
      range: {
        from: new Date("2026-06-15T15:00:00.000Z"),
        to: new Date("2026-07-15T15:00:00.000Z"),
      },
    });
    expect(slots).toHaveLength(300);
    expect(slots[0]).toEqual({
      id: "store_1_2026-06-16T01:00:00.000Z",
      storeId: "store_1",
      startsAt: "2026-06-16T01:00:00.000Z",
      endsAt: "2026-06-16T02:00:00.000Z",
      isBooked: true,
      selectable: false,
      label: "予約済み",
    });
    expect(slots[1]).toMatchObject({
      startsAt: "2026-06-16T02:00:00.000Z",
      selectable: true,
      label: "予約可能",
    });
  });
});

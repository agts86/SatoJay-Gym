import { describe, expect, it, vi } from "vitest";

const listSlotsByStore = vi.fn(async () => []);

vi.mock("~/server/repositories/store-repository", () => ({
  storeRepository: {
    listSlotsByStore,
  },
}));

describe("availability-service", () => {
  it("requests slots from today through 30 days in Tokyo time", async () => {
    const { listVisibleSlots } = await import("~/server/services/availability-service");

    await listVisibleSlots("store_1", new Date("2026-06-16T00:00:00.000Z"));

    expect(listSlotsByStore).toHaveBeenCalledWith({
      storeId: "store_1",
      range: {
        from: new Date("2026-06-15T15:00:00.000Z"),
        to: new Date("2026-07-15T15:00:00.000Z"),
      },
    });
  });
});

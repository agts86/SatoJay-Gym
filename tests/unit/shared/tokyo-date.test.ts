import { describe, expect, it } from "vitest";
import { createTokyoSlotUtc, formatTokyoDateKey, getTokyoDateRange, toTokyoDisplay } from "~/shared/tokyo-date";

describe("tokyo-date", () => {
  it("formats business dates in Asia/Tokyo", () => {
    expect(formatTokyoDateKey(new Date("2026-06-15T15:00:00.000Z"))).toBe("2026-06-16");
  });

  it("creates UTC instants for Tokyo hourly slots", () => {
    expect(createTokyoSlotUtc("2026-06-16", 10).toISOString()).toBe("2026-06-16T01:00:00.000Z");
    expect(createTokyoSlotUtc("2026-06-16", 20).toISOString()).toBe("2026-06-16T11:00:00.000Z");
  });

  it("returns a 30-day visible range including today", () => {
    const range = getTokyoDateRange(new Date("2026-06-16T00:00:00.000Z"));

    expect(range.from.toISOString()).toBe("2026-06-15T15:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-07-15T15:00:00.000Z");
  });

  it("displays reservation datetime in Japanese Tokyo time", () => {
    expect(toTokyoDisplay("2026-06-16T01:00:00.000Z")).toContain("2026/06/16");
  });
});

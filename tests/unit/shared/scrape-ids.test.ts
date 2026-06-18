import { describe, expect, it } from "vitest";
import { scrapeIds } from "~/shared/scrape-ids";

describe("scrapeIds", () => {
  it("keeps required stable selectors for scraping practice", () => {
    expect(scrapeIds.lp.hero).toBe("hero");
    expect(scrapeIds.lp.trainers).toBe("trainers");
    expect(scrapeIds.reservation.availableSlot).toBe("available-slot");
    expect(scrapeIds.reservation.previousWeekButton).toBe("calendar-previous-week");
    expect(scrapeIds.reservation.nextWeekButton).toBe("calendar-next-week");
    expect(scrapeIds.form.customerEmail).toBe("customer-email");
    expect(scrapeIds.thanks.summary).toBe("reservation-summary");
    expect(scrapeIds.admin.bookingDatetime).toBe("booking-datetime");
  });
});

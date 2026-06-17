import { expect, test } from "@playwright/test";

test("LP exposes stable sections and reservation CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.locator("#programs")).toBeVisible();
  await expect(page.locator("#pricing")).toBeVisible();
  await expect(page.locator("#trainers")).toBeVisible();
  await expect(page.locator("#access")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
  await expect(page.locator("#reservation-cta a[href='/reservation']").first()).toBeVisible();
});

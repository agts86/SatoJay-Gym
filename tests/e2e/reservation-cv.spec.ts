import { expect, test } from "@playwright/test";

test("サンクスページはorderIdクエリを予約番号として表示できる", async ({ page }) => {
  await page.goto("/reservation/thanks?orderId=GYM-20260619-9999");

  await expect(page.locator("#reservation-thanks")).toBeVisible();
  await expect(page.locator("#reservation-number")).toHaveText("GYM-20260619-9999");
});

test("LPから無料体験予約を完了し、サンクスページでオーダーIDを確認できる", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });

  await page.goto("/");
  await page.locator("a.bot_open[href='/reservation']").first().click();

  await expect(page).toHaveURL(/\/reservation$/);
  await expect(page.locator("#reservation-next-button")).toBeDisabled();

  const storeCard = page.locator('[data-scrape="store-card"]').first();
  await expect(storeCard).toBeVisible();
  await storeCard.click();

  const availableSlot = page.locator('[data-scrape="available-slot"][data-selectable="true"]').first();
  await expect(availableSlot).toBeVisible();
  await expect(availableSlot).toHaveAttribute("data-starts-at", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+09:00$/);
  await availableSlot.click();

  const nextButton = page.locator("#reservation-next-button");
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expect(page).toHaveURL(/\/reservation\/form$/);
  await page.locator("#customer-name").fill("佐藤 太郎");
  await page.locator("#customer-email").fill(`satojay-e2e-${Date.now()}@example.com`);
  await page.locator("#customer-phone").fill("03-1234-5678");
  await page.locator("#training-goal").fill("無料体験予約のE2E確認");
  await page.locator("#customer-note").fill("Playwright CV flow");
  await page.locator("#reservation-submit-button").click();

  await expect(page).toHaveURL(/\/reservation\/confirm$/);
  await page.locator("#reservation-confirm-submit-button").click();

  await expect(page).toHaveURL(/\/reservation\/thanks$/, { timeout: 15_000 });
  await expect(page.locator("#reservation-thanks")).toBeVisible();
  await expect(page.locator("#reservation-number")).toHaveText(/^GYM-\d{8}-\d{4}$/);
});

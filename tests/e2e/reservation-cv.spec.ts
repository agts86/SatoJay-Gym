import { expect, type Page, test } from "@playwright/test";
import { SLOT_ALREADY_BOOKED_MESSAGE } from "~/shared/reservation-types";

interface SelectedReservation {
  slotId: string;
  storeId: string;
}

interface CustomerInput {
  customerEmail: string;
  customerName: string;
  customerNote: string;
  customerPhone: string;
  trainingGoal: string;
}

const duplicateCustomer: CustomerInput = {
  customerEmail: "satojay-duplicate-e2e@example.com",
  customerName: "佐藤 太郎",
  customerNote: "Playwright duplicate CV flow",
  customerPhone: "03-1234-5678",
  trainingGoal: "同一枠予約のE2E確認",
};

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

test("同じ予約内容を別画面で先にCVされた場合、確認画面で停止中の予約送信はエラーになる", async ({ baseURL, browser, page }) => {
  await clearReservationSession(page);
  await page.goto("/reservation");

  const selectedReservation = await selectFirstAvailableReservation(page);
  await page.locator("#reservation-next-button").click();
  await fillCustomerForm(page, duplicateCustomer);
  await page.locator("#reservation-submit-button").click();
  await expect(page).toHaveURL(/\/reservation\/confirm$/);
  await expect(page.locator("#reservation-confirm-submit-button")).toBeEnabled();

  const contextB = await browser.newContext();
  try {
    const pageB = await contextB.newPage();
    await clearReservationSession(pageB);
    await pageB.goto(`${baseURL ?? "http://127.0.0.1:3000"}/reservation`);
    await selectReservation(pageB, selectedReservation);
    await pageB.locator("#reservation-next-button").click();
    await fillCustomerForm(pageB, duplicateCustomer);
    await pageB.locator("#reservation-submit-button").click();
    await expect(pageB).toHaveURL(/\/reservation\/confirm$/);
    await pageB.locator("#reservation-confirm-submit-button").click();
    await expect(pageB).toHaveURL(/\/reservation\/thanks$/, { timeout: 15_000 });
    await expect(pageB.locator("#reservation-number")).toHaveText(/^GYM-\d{8}-\d{4}$/);

    await page.locator("#reservation-confirm-submit-button").click();
    await expect(page).toHaveURL(/\/reservation\/confirm$/);
    await expect(page.locator("#reservation-confirm-message")).toHaveText(SLOT_ALREADY_BOOKED_MESSAGE);
  } finally {
    await contextB.close();
  }
});

async function clearReservationSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
}

async function selectFirstAvailableReservation(page: Page): Promise<SelectedReservation> {
  await expect(page.locator("#reservation-next-button")).toBeDisabled();

  const storeCard = page.locator('[data-scrape="store-card"]').first();
  await expect(storeCard).toBeVisible();
  await storeCard.click();

  const availableSlot = page.locator('[data-scrape="available-slot"][data-selectable="true"]').first();
  await expect(availableSlot).toBeVisible();
  await availableSlot.click();

  return {
    slotId: await requireAttribute(availableSlot, "data-slot-id"),
    storeId: await requireAttribute(storeCard, "data-store-id"),
  };
}

async function selectReservation(page: Page, selectedReservation: SelectedReservation): Promise<void> {
  await expect(page.locator("#reservation-next-button")).toBeDisabled();
  await page.locator(`[data-store-id="${selectedReservation.storeId}"]`).click();

  const slot = page.locator(`[data-slot-id="${selectedReservation.slotId}"]`);
  await expect(slot).toBeVisible();
  await expect(slot).toHaveAttribute("data-selectable", "true");
  await slot.click();
  await expect(page.locator("#reservation-next-button")).toBeEnabled();
}

async function fillCustomerForm(page: Page, customer: CustomerInput): Promise<void> {
  await page.locator("#customer-name").fill(customer.customerName);
  await page.locator("#customer-email").fill(customer.customerEmail);
  await page.locator("#customer-phone").fill(customer.customerPhone);
  await page.locator("#training-goal").fill(customer.trainingGoal);
  await page.locator("#customer-note").fill(customer.customerNote);
}

async function requireAttribute(locator: ReturnType<Page["locator"]>, name: string): Promise<string> {
  const value = await locator.getAttribute(name);
  expect(value).not.toBeNull();
  return value ?? "";
}

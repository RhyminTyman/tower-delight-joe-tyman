import { test, expect } from "@playwright/test";

test.describe("Route detail card", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/tow-001");
  });

  test("shows PO number, dispatcher, keys, type, driver, and truck info", async ({ page }) => {
    await expect(page.getByText(/po #/i)).toBeVisible();
    await expect(page.getByText(/123/, { exact: true })).toBeVisible();
    await expect(page.getByText(/dispatcher/i)).toBeVisible();
    await expect(page.getByText(/kyle ed/i)).toBeVisible();
    await expect(page.getByText(/has keys/i)).toBeVisible();
    await expect(page.getByText(/no/, { exact: true })).toBeVisible();
    await expect(page.getByText(/type/i)).toBeVisible();
    await expect(page.getByText(/light/i)).toBeVisible();
    await expect(page.getByText(/driver/i)).toBeVisible();
    await expect(page.getByText(/truck/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /call dispatch/i })).toBeVisible();
  });
});


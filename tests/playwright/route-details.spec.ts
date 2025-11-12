import { test, expect } from "@playwright/test";

test.describe("Route detail card", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/tow-001");
  });

  test("shows PO number, dispatcher, keys, type, driver, and truck info", async ({ page }) => {
    // PO number is visible
    await expect(page.getByText(/po #/i)).toBeVisible();
    
    // Route details are visible
    await expect(page.getByText(/dispatcher/i)).toBeVisible();
    await expect(page.getByText(/has keys/i)).toBeVisible();
    await expect(page.getByText(/type/i)).toBeVisible();
    await expect(page.getByText(/driver/i)).toBeVisible();
    await expect(page.getByText(/truck/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /call dispatch/i })).toBeVisible();
  });
});


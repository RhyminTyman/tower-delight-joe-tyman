import { test, expect } from "@playwright/test";

test.describe("Next action guidance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/primary");
  });

  test("pins the next best action above the call-to-action button", async ({ page }) => {
    await expect(page.getByText(/next best action/i)).toBeVisible();
    await expect(page.getByText(/scan vin & capture 4-angle photos/i)).toBeVisible();
    await expect(
      page.getByText(/pre-fills impound intake and officer sign-off./i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /start capture/i })).toBeVisible();
  });
});


import { test, expect } from "@playwright/test";

test.describe("Edit tow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/tow-001/edit");
  });

  test("shows edit form with all tow fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /edit tow/i })).toBeVisible();
    
    // Tow information section
    await expect(page.getByText(/tow information/i)).toBeVisible();
    await expect(page.getByLabel(/ticket id/i)).toBeVisible();
    await expect(page.getByLabel(/vehicle description/i)).toBeVisible();
    await expect(page.getByLabel(/po number/i)).toBeVisible();
    await expect(page.getByLabel(/type/i)).toBeVisible();
    await expect(page.getByLabel(/dispatcher/i)).toBeVisible();
    await expect(page.getByLabel(/has keys/i)).toBeVisible();
    
    // Pickup section
    await expect(page.getByText(/pickup location/i)).toBeVisible();
    await expect(page.getByLabel(/location name/i).first()).toBeVisible();
    await expect(page.getByLabel(/street address/i).first()).toBeVisible();
    await expect(page.getByLabel(/distance\/eta/i).first()).toBeVisible();
    
    // Destination section
    await expect(page.getByText(/destination/i)).toBeVisible();
    await expect(page.getByLabel(/location name/i).nth(1)).toBeVisible();
    await expect(page.getByLabel(/street address/i).nth(1)).toBeVisible();
    await expect(page.getByLabel(/distance\/eta/i).nth(1)).toBeVisible();
    
    // Submit button
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
  });

  test("has cancel link that goes back to tow detail", async ({ page }) => {
    await expect(page.getByRole("link", { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /cancel/i })).toHaveAttribute("href", "/tow/tow-001");
  });

  test("displays current address values in form fields", async ({ page }) => {
    const pickupTitle = page.getByLabel(/location name/i).first();
    await expect(pickupTitle).toHaveValue(/kyle's motors/i);
  });
});


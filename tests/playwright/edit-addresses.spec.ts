import { test, expect } from "@playwright/test";

test.describe("Edit tow addresses", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/primary/edit");
  });

  test("shows edit form with pickup and destination fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /edit addresses/i })).toBeVisible();
    
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
    await expect(page.getByRole("link", { name: /cancel/i })).toHaveAttribute("href", "/tow/primary");
  });

  test("displays current address values in form fields", async ({ page }) => {
    const pickupTitle = page.getByLabel(/location name/i).first();
    await expect(pickupTitle).toHaveValue(/kyle's motors/i);
  });
});


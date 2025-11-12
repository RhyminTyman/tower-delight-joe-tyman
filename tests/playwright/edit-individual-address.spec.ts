import { test, expect } from "@playwright/test";

test.describe("Edit individual address", () => {
  test("can edit pickup address", async ({ page }) => {
    await page.goto("/tow/tow-001/address/pickup");
    
    await expect(page.getByRole("heading", { name: /edit pickup/i })).toBeVisible();
    await expect(page.getByText(/update the pickup location details/i)).toBeVisible();
    
    await expect(page.getByLabel(/location name/i)).toBeVisible();
    await expect(page.getByLabel(/street address/i)).toBeVisible();
    await expect(page.getByLabel(/distance/i)).toBeVisible();
    
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /cancel/i }).first()).toHaveAttribute("href", "/tow/tow-001");
  });

  test("can edit destination address", async ({ page }) => {
    await page.goto("/tow/tow-001/address/destination");
    
    await expect(page.getByRole("heading", { name: /edit destination/i })).toBeVisible();
    await expect(page.getByText(/update the destination location details/i)).toBeVisible();
    
    await expect(page.getByLabel(/location name/i)).toBeVisible();
    await expect(page.getByLabel(/street address/i)).toBeVisible();
    await expect(page.getByLabel(/distance/i)).toBeVisible();
    
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /cancel/i }).first()).toHaveAttribute("href", "/tow/tow-001");
  });

  test("displays current pickup address values", async ({ page }) => {
    await page.goto("/tow/tow-001/address/pickup");
    
    const locationName = page.getByLabel(/location name/i);
    await expect(locationName).toHaveValue(/kyle's motors/i);
  });
});


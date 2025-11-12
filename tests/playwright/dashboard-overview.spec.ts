import { test, expect } from "@playwright/test";

test.describe("Tow list overview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows active tows list header", async ({ page }) => {
    await expect(page.getByText(/tower delight · driver ops/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /active tows/i })).toBeVisible();
    // Badge showing count - use more specific selector to avoid "Active" status text
    await expect(page.locator('header').getByText(/active$/i)).toBeVisible();
  });

  test("displays tow cards with key information", async ({ page }) => {
    // Check for status badge (could be "En Route", "Waiting", etc.)
    await expect(page.getByText(/pickup/i).first()).toBeVisible();
    await expect(page.getByText(/destination/i).first()).toBeVisible();
    
    // Check for at least one tow card with driver name
    const towCards = page.locator('a[href^="/tow/"]');
    await expect(towCards.first()).toBeVisible();
  });

  test("shows floating action button to add new tow", async ({ page }) => {
    await expect(page.locator('a[href="/tow/new"][title="Add New Tow"]')).toBeVisible();
  });
});

test.describe("Tow detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/tow-001");
  });

  test("shows tow header with navigation", async ({ page }) => {
    // Back button
    await expect(page.locator('a[title="Back to all tows"]')).toBeVisible();
    
    // Tow number in header
    await expect(page.getByText(/tow #/i)).toBeVisible();
    
    // Edit icon
    await expect(page.locator('a[title="Edit tow"]')).toBeVisible();
    
    // Note icon
    await expect(page.locator('a[title="Add note"]')).toBeVisible();
  });

  test("displays status banner", async ({ page }) => {
    // Status banner should be visible (could be any status)
    const statusBanner = page.locator('div').filter({ hasText: /waiting|dispatched|en route|on scene|towing|completed/i }).first();
    await expect(statusBanner).toBeVisible();
  });

  test("shows vehicle information", async ({ page }) => {
    // Vehicle section label
    await expect(page.getByText(/vehicle/i).first()).toBeVisible();
  });

  test("displays collapsible route map section", async ({ page }) => {
    // Route map heading
    await expect(page.getByText(/route map/i)).toBeVisible();
    
    // Pickup and destination labels
    await expect(page.getByText(/pickup/i).first()).toBeVisible();
    await expect(page.getByText(/destination/i).first()).toBeVisible();
  });

  test("has individual edit icons for pickup and destination", async ({ page }) => {
    // Edit pickup icon - wait for the collapsible section to be open
    await page.waitForTimeout(500);
    
    const pickupEditIcon = page.locator('a[href*="/address/pickup"][title="Edit pickup"]');
    await expect(pickupEditIcon).toBeVisible();
    
    // Edit destination icon
    const destinationEditIcon = page.locator('a[href*="/address/destination"][title="Edit destination"]');
    await expect(destinationEditIcon).toBeVisible();
  });

  test("displays route details card", async ({ page }) => {
    // PO number label
    await expect(page.getByText(/po #/i)).toBeVisible();
    
    // Call Dispatch link (not button)
    await expect(page.getByRole('link', { name: /call dispatch/i })).toBeVisible();
    
    // Dispatcher label
    await expect(page.getByText(/dispatcher/i)).toBeVisible();
  });

  test("shows status timeline", async ({ page }) => {
    // Statuses heading
    await expect(page.getByText(/statuses/i)).toBeVisible();
    
    // At least some status labels should be visible
    const statusLabels = page.locator('p.text-sm.font-medium.text-foreground');
    await expect(statusLabels.first()).toBeVisible();
  });
});


import { test, expect } from "@playwright/test";

test.describe("Tow list overview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows active tows list", async ({ page }) => {
    await expect(page.getByText(/tower delight · driver ops/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /active tows/i })).toBeVisible();
    await expect(page.getByText(/active/i)).toBeVisible();
  });

  test("displays tow cards with key information", async ({ page }) => {
    await expect(page.getByText(/en route/i)).toBeVisible();
    await expect(page.getByText(/pickup:/i)).toBeVisible();
    await expect(page.getByText(/drop-off:/i)).toBeVisible();
  });
});

test.describe("Tow detail dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/primary");
  });

  test("shows driver identity and current duty status", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /jordan alvarez/i })).toBeVisible();
    await expect(page.getByText(/heavy duty operator · unit hd-12 · peterbilt 567/i)).toBeVisible();
    await expect(page.getByText(/on call/i)).toBeVisible();
  });

  test("renders the live map header with status controls", async ({ page }) => {
    await expect(page.getByText(/en route/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /update status/i })).toBeVisible();
    await expect(page.getByText(/pickup/i)).toBeVisible();
    await expect(page.getByText(/destination/i)).toBeVisible();
    await expect(page.getByText(/kyle's motors/i)).toBeVisible();
    await expect(page.getByText(/830 south 17th street, columbus oh 43206/i)).toBeVisible();
  });

  test("has edit addresses button in header", async ({ page }) => {
    await expect(page.getByRole("link", { name: /edit addresses/i })).toBeVisible();
  });

  test("has edit icon next to pickup address", async ({ page }) => {
    const editIcon = page.locator('a[href="/tow/primary/edit"][title="Edit addresses"]').first();
    await expect(editIcon).toBeVisible();
  });
});


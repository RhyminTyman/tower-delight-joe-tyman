import { test, expect } from "@playwright/test";

test.describe("Dispatch status timeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("lists each timeline entry with label and timestamp", async ({ page }) => {
    const entries = [
      { label: "Waiting", time: "10:55 AM" },
      { label: "Dispatched", time: "10:56 AM" },
      { label: "En Route", time: "10:57 AM" },
      { label: "On Scene", time: "--" },
      { label: "Towing", time: "--" },
    ];

    for (const entry of entries) {
      await expect(page.getByText(entry.label, { exact: true })).toBeVisible();
      await expect(page.getByText(entry.time, { exact: true })).toBeVisible();
    }
  });

  test("highlights the active stage in the timeline", async ({ page }) => {
    const activeNode = page.locator(".animate-pulse");
    await expect(activeNode.first()).toBeVisible();
    await expect(page.getByText(/en route/i)).toBeVisible();
  });
});


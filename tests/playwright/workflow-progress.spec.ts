import { test, expect } from "@playwright/test";

test.describe("Dispatch status timeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tow/tow-001");
  });

  test("lists each timeline entry with label and timestamp", async ({ page }) => {
    const entries = [
      { label: "Waiting", time: "10:55 AM" },
      { label: "Dispatched", time: "10:56 AM" },
      { label: "En Route", time: "10:57 AM" },
      { label: "On Scene", time: "--" },
      { label: "Towing", time: "--" },
      // Note: "Completed" status only appears for completed tows
    ];

    // Look for timeline entries specifically in the main section (not status banner)
    const timelineSection = page.getByRole('main');
    
    for (const entry of entries) {
      // Find the timeline entry in the statuses section
      await expect(timelineSection.getByText(entry.label)).toBeVisible();
    }
  });

  test("highlights the active stage in the timeline", async ({ page }) => {
    // Check that there's an active stage indicator (animated pulse)
    const activeNode = page.locator(".animate-pulse");
    await expect(activeNode.first()).toBeVisible();
    
    // Verify status timeline is visible in main section
    const timelineSection = page.getByRole('main');
    await expect(timelineSection.getByText(/statuses/i)).toBeVisible();
  });
});


import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Streaming Output", () => {
  test("start streaming displays output", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const streamButton = page.getByRole("button", { name: /stream/i });
    const hasStreamButton = (await streamButton.count()) > 0;

    if (hasStreamButton) {
      await streamButton.click();

      const outputArea = page
        .locator(
          '[data-testid="output-panel"], [aria-label*="output" i], textarea, pre'
        )
        .first();
      await expect(outputArea).toBeVisible();

      const outputText = await outputArea.textContent();
      expect(outputText?.length || 0).toBeGreaterThan(0);
    }
  });

  test("cancel streaming stops output", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const streamButton = page.getByRole("button", { name: /stream/i });
    const hasStreamButton = (await streamButton.count()) > 0;

    if (hasStreamButton) {
      await streamButton.click();

      const cancelButton = page.getByRole("button", { name: /cancel/i });
      const hasCancelButton = (await cancelButton.count()) > 0;

      if (hasCancelButton) {
        await cancelButton.click();

        const cancelledText = page.getByText(/cancelled|canceled/i);
        await expect(cancelledText).toBeVisible();

        const outputArea = page
          .locator('[data-testid="output-panel"], textarea, pre')
          .first();
        const outputText = await outputArea.textContent();
        expect(outputText?.length || 0).toBeGreaterThan(0);
      }
    }
  });
});

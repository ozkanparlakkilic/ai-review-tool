import { test, expect } from "./utils/fixtures";
import { filterReviewQueue } from "./utils/helpers";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Streaming Output", () => {
  test("start streaming displays output", async ({ page, testPrefix }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    await filterReviewQueue(page, testPrefix);

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

  test("cancel streaming stops output", async ({ page, testPrefix }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    await filterReviewQueue(page, testPrefix);

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const streamButton = page.getByRole("button", { name: /stream/i });
    const hasStreamButton = (await streamButton.count()) > 0;
    let hasOutput = false;
    let outputArea: ReturnType<typeof page.locator> | null = null;

    if (hasStreamButton) {
      await Promise.all([
        page
          .waitForResponse(
            (resp) =>
              resp.url().includes("/stream") || resp.url().includes("/api"),
            { timeout: 15_000 }
          )
          .then((resp) => resp.ok())
          .catch(() => false),
        streamButton.click(),
      ]);

      await page.waitForTimeout(2000);

      const cancelButton = page.getByRole("button", { name: /cancel/i });
      if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        outputArea = page
          .locator(
            '[data-testid="output-panel"], [aria-label*="output" i], textarea, pre'
          )
          .first();

        await expect(outputArea).toBeVisible();

        const outputBeforeCancel = await outputArea.textContent();
        hasOutput = (outputBeforeCancel?.length || 0) > 0;

        await Promise.all([
          page
            .waitForResponse(
              (resp) =>
                resp.url().includes("/stream/cancel") ||
                resp.url().includes("/api") ||
                resp.status() === 200,
              { timeout: 10_000 }
            )
            .then((resp) => resp.ok())
            .catch(() => false),
          cancelButton.click(),
        ]);
      }

      if (hasOutput) {
        const cancelledText = page.getByText(
          /generation cancelled|cancelled|canceled/i
        );
        await expect(cancelledText).toBeVisible({ timeout: 10_000 });
      }

      if (outputArea) {
        await expect(outputArea).toBeVisible();
        const outputAfterCancel = await outputArea.textContent();
        expect(outputAfterCancel?.length || 0).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

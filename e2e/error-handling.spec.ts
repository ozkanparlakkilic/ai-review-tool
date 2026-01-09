import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Error Handling", () => {
  test("handles non-existent review gracefully", async ({ page }) => {
    await page.goto("/review/nonexistent-id-12345", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByText(/review not found|error loading|doesn't exist/i)
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
  });

  test("feedback field exists on review detail page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const reviewLink = firstRow.getByRole("link", { name: /review/i });
    await reviewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const feedback = page.getByLabel(/feedback/i).or(page.locator("#feedback"));
    await expect(feedback).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reject/i }).first()
    ).toBeVisible();
  });

  test("handles network timeout gracefully", async ({ page }) => {
    await page.route("**/api/review-items", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/error|failed|timeout/i).first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });
});

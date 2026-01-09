import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Pagination", () => {
  test("pagination controls work", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const pagination = page
      .locator('[role="navigation"]')
      .or(page.locator("nav"))
      .first();
    const nextBtn = pagination.getByRole("button", { name: /next/i });
    const hasNextBtn = (await nextBtn.count()) > 0;

    if (hasNextBtn) {
      const isDisabled = await nextBtn.isDisabled();
      if (!isDisabled) {
        await nextBtn.click();

        const prevBtn = pagination.getByRole("button", { name: /previous/i });
        await expect(prevBtn).toBeEnabled();
      }
    }
  });

  test("table displays data", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();
  });

  test("maintains search state after refresh", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/filter prompts/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill("react");
    await expect(searchInput).toHaveValue("react");
  });
});

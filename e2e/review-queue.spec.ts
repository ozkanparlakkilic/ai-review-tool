import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Review Queue", () => {
  test("displays review queue with items", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rows = page.getByRole("row");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("filters by status", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();

    const pendingOption = page.getByRole("option", { name: /pending/i });
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();
  });

  test("sorts by column", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const header = page.getByRole("columnheader").first();
    await expect(header).toBeVisible();
    await header.click();
    await expect(table).toBeVisible();
  });

  test("search filters results", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/filter prompts/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill("test");
    await expect(searchInput).toHaveValue("test");
  });
});

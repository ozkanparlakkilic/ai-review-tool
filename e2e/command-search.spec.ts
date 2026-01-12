import { test, expect } from "./utils/fixtures";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Command Search", () => {
  test("search button is visible in header", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const searchButton = page.getByRole("button", { name: /search pages/i });
    await expect(searchButton).toBeVisible();
  });

  test("opens with button click", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const commandButton = page.getByRole("button", { name: /search pages/i });
    await commandButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const commandInput = page.getByPlaceholder(/search pages/i);
    await expect(commandInput).toBeVisible();
  });

  test("opens with keyboard shortcut", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    await page.keyboard.press("Meta+k");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const commandInput = page.getByPlaceholder(/search pages/i);
    await expect(commandInput).toBeVisible();
  });

  test("closes on escape key", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const commandButton = page.getByRole("button", { name: /search pages/i });
    await commandButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
  });
});

test.describe("Command Search - Role Based", () => {
  test.use({ storageState: "e2e/.auth/reviewer.json" });

  test("reviewer sees only review queue in command search", async ({
    page,
  }) => {
    await page.goto("/");

    const commandButton = page.getByRole("button", { name: /search pages/i });
    await commandButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const reviewQueueItem = page.getByRole("option", { name: /review queue/i });
    await expect(reviewQueueItem).toBeVisible();

    const insightsItem = page.getByRole("option", { name: /insights/i });
    const insightsCount = await insightsItem.count();
    expect(insightsCount).toBe(0);

    const auditLogItem = page.getByRole("option", { name: /audit log/i });
    const auditLogCount = await auditLogItem.count();
    expect(auditLogCount).toBe(0);
  });
});

test.describe("Command Search - Admin", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("admin sees all navigation items in command search", async ({
    page,
  }) => {
    await page.goto("/");

    const commandButton = page.getByRole("button", { name: /search pages/i });
    await commandButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const reviewQueueItem = page.getByRole("option", { name: /review queue/i });
    await expect(reviewQueueItem).toBeVisible();

    const insightsItem = page.getByRole("option", { name: /insights/i });
    await expect(insightsItem).toBeVisible();

    const auditLogItem = page.getByRole("option", { name: /audit log/i });
    await expect(auditLogItem).toBeVisible();
  });
});

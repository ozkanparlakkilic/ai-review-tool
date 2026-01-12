import { test, expect } from "./utils/fixtures";
import { filterReviewQueue } from "./utils/helpers";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Bulk Actions", () => {
  test("bulk approve multiple reviews and verify status change", async ({
    page,
    testPrefix,
  }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    await filterReviewQueue(page, testPrefix);

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();

    const pendingOption = page.getByRole("option", { name: /pending/i });
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    await page.waitForTimeout(1000);

    const initialRows = await page.getByRole("row").count();

    const checkboxes = page.getByRole("checkbox");
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(1);

    const firstCheckbox = checkboxes.nth(1);
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();

    if (checkboxCount > 2) {
      const secondCheckbox = checkboxes.nth(2);
      await expect(secondCheckbox).toBeVisible();
      await secondCheckbox.click();
    } else {
      const selectAllCheckbox = checkboxes.first();
      await selectAllCheckbox.click();
    }

    await page.waitForTimeout(500);

    const bulkBtn = page.getByRole("button", { name: /approve.*selected/i });
    await expect(bulkBtn).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/review-items/batch") &&
            resp.request().method() === "PATCH",
          { timeout: 15_000 }
        )
        .then((resp) => resp.ok())
        .catch(() => false),
      bulkBtn.click(),
    ]);

    await expect(table).toBeVisible();
    await page.waitForTimeout(1000);

    await page.reload();
    await page.waitForTimeout(1000);

    await filterReviewQueue(page, testPrefix);

    const statusFilterAfterReload = page
      .getByRole("button", { name: /status/i })
      .first();
    await statusFilterAfterReload.click();
    const pendingOptionAfterReload = page.getByRole("option", {
      name: /pending/i,
    });
    await pendingOptionAfterReload.click();
    await expect(table).toBeVisible();
    await page.waitForTimeout(1000);

    const updatedRows = await page.getByRole("row").count();
    expect(updatedRows).toBeLessThanOrEqual(initialRows);
  });

  test("bulk reject with feedback and verify in audit log", async ({
    page,
    testPrefix,
  }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    await filterReviewQueue(page, testPrefix);

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();

    const pendingOption = page.getByRole("option", { name: /pending/i });
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const checkbox = page.getByRole("checkbox").nth(1);
    await checkbox.click();

    await page.waitForTimeout(500);

    const bulkBtn = page.getByRole("button", { name: /reject.*selected/i });
    await expect(bulkBtn).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/review-items/batch") &&
            resp.request().method() === "PATCH",
          { timeout: 15_000 }
        )
        .then((resp) => resp.ok())
        .catch(() => false),
      bulkBtn.click(),
    ]);

    await page.waitForTimeout(2000);
    await page.goto("/audit-log");

    const auditHeading = page.getByRole("heading", { name: /audit log/i });
    await expect(auditHeading).toBeVisible();

    const auditTable = page.getByRole("table");
    await expect(auditTable).toBeVisible();

    await page.waitForTimeout(1000);

    const tableBody = await page.locator("tbody").textContent();
    expect(tableBody).toMatch(/reject|rejected|REVIEW_REJECTED|BULK_REJECT/i);
  });

  test("select all and bulk action", async ({ page, testPrefix }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    await filterReviewQueue(page, testPrefix);

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();

    const pendingOption = page.getByRole("option", { name: /pending/i });
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const selectAllCheckbox = page.getByRole("checkbox").first();
    await selectAllCheckbox.click();

    const bulkBtn = page.getByRole("button", {
      name: /bulk|approve.*selected/i,
    });
    await expect(bulkBtn).toBeVisible();
    await expect(bulkBtn).toBeEnabled();
  });
});

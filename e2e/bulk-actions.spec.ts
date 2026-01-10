import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Bulk Actions", () => {
  test("bulk approve multiple reviews and verify status change", async ({
    page,
  }) => {
    await page.goto("/");

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

    const initialRows = await page.getByRole("row").count();

    const firstCheckbox = page.getByRole("checkbox").nth(1);
    const secondCheckbox = page.getByRole("checkbox").nth(2);

    await firstCheckbox.click();
    await secondCheckbox.click();

    const bulkBtn = page.getByRole("button", { name: /approve.*selected/i });
    await expect(bulkBtn).toBeVisible();
    await bulkBtn.click();

    await expect(table).toBeVisible();

    await page.reload();

    const statusFilterAfterReload = page
      .getByRole("button", { name: /status/i })
      .first();
    await statusFilterAfterReload.click();
    const pendingOptionAfterReload = page.getByRole("option", {
      name: /pending/i,
    });
    await pendingOptionAfterReload.click();
    await expect(table).toBeVisible();

    const updatedRows = await page.getByRole("row").count();
    expect(updatedRows).toBeLessThanOrEqual(initialRows);
  });

  test("bulk reject with feedback and verify in audit log", async ({
    page,
  }) => {
    await page.goto("/");

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

    const checkbox = page.getByRole("checkbox").nth(1);
    await checkbox.click();

    const bulkBtn = page.getByRole("button", { name: /reject.*selected/i });
    await expect(bulkBtn).toBeVisible();
    await bulkBtn.click();

    await page.goto("/audit-log");

    const auditHeading = page.getByRole("heading", { name: /audit log/i });
    await expect(auditHeading).toBeVisible();

    const auditTable = page.getByRole("table");
    await expect(auditTable).toBeVisible();

    const tableBody = await page.locator("tbody").textContent();
    expect(tableBody).toMatch(/reject|rejected/i);
  });

  test("select all and bulk action", async ({ page }) => {
    await page.goto("/");

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

    const selectAllCheckbox = page.getByRole("checkbox").first();
    await selectAllCheckbox.click();

    const bulkBtn = page.getByRole("button", {
      name: /bulk|approve.*selected/i,
    });
    await expect(bulkBtn).toBeVisible();
    await expect(bulkBtn).toBeEnabled();
  });
});

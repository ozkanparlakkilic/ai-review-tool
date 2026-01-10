import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Audit Log", () => {
  test("displays audit log table", async ({ page }) => {
    await page.goto("/audit-log");

    await expect(
      page.getByRole("heading", { name: /audit log/i })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("filters audit log by user search", async ({ page }) => {
    await page.goto("/audit-log");

    const searchInput = page.getByPlaceholder(/search users/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill("admin");
    await expect(searchInput).toHaveValue("admin");
  });

  test("exports CSV", async ({ page }) => {
    await page.goto("/audit-log");

    const exportButton = page.getByRole("button", {
      name: /export.*csv|download.*csv/i,
    });
    await expect(exportButton).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  test("approve action appears in audit log", async ({ page }) => {
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

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const approveBtn = page.getByRole("button", { name: /approve/i }).first();
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    const successMessage = page.getByText(/approved/i).first();
    await expect(successMessage).toBeVisible();

    await page.goto("/audit-log");

    const auditTable = page.getByRole("table");
    await expect(auditTable).toBeVisible();

    const tableBody = await page.locator("tbody").textContent();
    expect(tableBody).toMatch(/approve|approved/i);
  });

  test("tracks user login in audit log", async ({ page }) => {
    await page.goto("/audit-log");

    const heading = page.getByRole("heading", { name: /audit log/i });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const tableBody = await page.locator("tbody").textContent();
    expect(tableBody).toMatch(/login|user.*logged/i);
  });
});

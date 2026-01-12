import { test, expect } from "./utils/fixtures";
import { filterReviewQueue } from "./utils/helpers";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Complete User Journey", () => {
  test("complete review workflow: queue → detail → approve → verify", async ({
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
    await statusFilter.click();
    const pendingOption = page.getByRole("option", { name: /pending/i });
    await pendingOption.click();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const pendingReviewLink = firstRow.getByRole("link", { name: /review/i });
    await expect(pendingReviewLink).toBeVisible();

    await pendingReviewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    await expect(
      page.getByRole("heading", { name: /review item/i })
    ).toBeVisible();
    await expect(page.getByText(/^Prompt$/i)).toBeVisible();
    await expect(page.getByText(/^Model Output$/i)).toBeVisible();

    const approveBtn = page.getByRole("button", { name: /approve/i }).first();
    await expect(approveBtn).toBeVisible();

    await Promise.all([
      page
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/review-items/") &&
            resp.request().method() === "PATCH",
          { timeout: 15_000 }
        )
        .catch(() => null),
      approveBtn.click(),
    ]);

    await page.waitForTimeout(1000);

    await expect(page.getByText(/approved|success/i).first()).toBeVisible({
      timeout: 5000,
    });

    await page.goto("/");

    await filterReviewQueue(page, testPrefix);

    const approvedStatusFilter = page
      .getByRole("button", { name: /status/i })
      .first();
    await approvedStatusFilter.click();
    const approvedOption = page.getByRole("option", { name: /approved/i });
    await approvedOption.click();

    const approvedTable = page.getByRole("table");
    await expect(approvedTable).toBeVisible();

    await page.waitForTimeout(1000);

    const approvedRows = page.getByRole("row");
    const rowCount = await approvedRows.count();
    expect(rowCount).toBeGreaterThan(1);
  });

  test("reject workflow with feedback validation", async ({
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

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const feedback = page.getByLabel(/feedback/i).or(page.locator("#feedback"));
    await expect(feedback).toBeVisible();
    await feedback.fill(
      "Quality standards not met. Please improve clarity and accuracy with more details."
    );

    const rejectBtn = page.getByRole("button", { name: /reject/i }).first();
    await expect(rejectBtn).toBeEnabled({ timeout: 5000 });

    await Promise.all([
      page
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/review-items/") &&
            resp.request().method() === "PATCH",
          { timeout: 15_000 }
        )
        .catch(() => null),
      rejectBtn.click(),
    ]);

    await page.waitForTimeout(1000);

    await expect(page.getByText(/rejected|success/i).first()).toBeVisible({
      timeout: 5000,
    });

    await page.goto("/");

    await filterReviewQueue(page, testPrefix);

    const rejectedStatusFilter = page
      .getByRole("button", { name: /status/i })
      .first();
    await rejectedStatusFilter.click();
    const rejectedOption = page.getByRole("option", { name: /rejected/i });
    await rejectedOption.click();

    const rejectedTable = page.getByRole("table");
    await expect(rejectedTable).toBeVisible();
  });

  test("search and filter workflow", async ({ page, testPrefix }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/filter prompts/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill(testPrefix);

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const initialRowCount = await page.getByRole("row").count();

    await expect(searchInput).toHaveValue(testPrefix);

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await statusFilter.click();
    const pendingOption = page.getByRole("option", { name: /pending/i });
    await pendingOption.click();

    await expect(table).toBeVisible();

    const filteredRowCount = await page.getByRole("row").count();
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

    await searchInput.clear();
    await expect(searchInput).toHaveValue("");

    await expect(table).toBeVisible();
  });
});

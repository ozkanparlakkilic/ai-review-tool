import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Complete User Journey", () => {
  test("complete review workflow: queue → detail → approve → verify", async ({
    page,
  }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await statusFilter.click();
    const pendingOption = page.getByRole("option", { name: /pending/i });
    await pendingOption.click();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const rowText = await firstRow.textContent();
    const reviewIdMatch = rowText?.match(/review-\d+/);
    const reviewId = reviewIdMatch ? reviewIdMatch[0] : null;
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
    await approveBtn.click();

    await expect(page.getByText(/approved/i).first()).toBeVisible();

    await page.goto("/");

    const approvedStatusFilter = page
      .getByRole("button", { name: /status/i })
      .first();
    await approvedStatusFilter.click();
    const approvedOption = page.getByRole("option", { name: /approved/i });
    await approvedOption.click();

    if (reviewId) {
      const approvedTable = page.getByRole("table");
      await expect(approvedTable).toBeVisible();

      const approvedContent = await page.textContent("body");
      expect(approvedContent).toContain(reviewId);
    }
  });

  test("reject workflow with feedback validation", async ({ page }) => {
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
    await expect(rejectBtn).toBeEnabled();
    await rejectBtn.click();

    await expect(page.getByText(/rejected/i).first()).toBeVisible();

    await page.goto("/");

    const rejectedStatusFilter = page
      .getByRole("button", { name: /status/i })
      .first();
    await rejectedStatusFilter.click();
    const rejectedOption = page.getByRole("option", { name: /rejected/i });
    await rejectedOption.click();

    const rejectedTable = page.getByRole("table");
    await expect(rejectedTable).toBeVisible();
  });

  test("search and filter workflow", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/filter prompts/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test");

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const initialRowCount = await page.getByRole("row").count();

    await expect(searchInput).toHaveValue("test");

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

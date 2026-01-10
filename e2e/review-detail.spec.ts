import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Review Detail", () => {
  test("opens detail", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /review queue/i })
    ).toBeVisible({ timeout: 20000 });

    const reviewLink = page.locator('a[href^="/review/"]').first();
    await reviewLink.click();
    await expect(page).toHaveURL(/\/review\/[^/]+/);

    await expect(
      page.getByRole("heading", { name: /review item/i })
    ).toBeVisible();
    await expect(page.getByText(/^Prompt$/i)).toBeVisible();
    await expect(page.getByText(/^Model Output$/i)).toBeVisible();
  });

  test("approve updates status", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await statusFilter.click();
    const pendingOption = page.getByRole("option", { name: /pending/i });
    await pendingOption.click();

    await expect(table).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const pendingReviewLink = firstRow.getByRole("link", { name: /review/i });
    await expect(pendingReviewLink).toBeVisible();

    await pendingReviewLink.click();
    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const approveBtn = page.getByRole("button", { name: /approve/i }).first();
    await expect(approveBtn).toBeVisible();
    await expect(approveBtn).toBeEnabled();
    await approveBtn.click();

    const successMessage = page.getByText(/approved/i).first();
    await expect(successMessage).toBeVisible();
  });

  test("reject updates status", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await statusFilter.click();
    const pendingOption = page.getByRole("option", { name: /pending/i });
    await pendingOption.click();

    await expect(table).toBeVisible();

    const firstRow = page.getByRole("row").nth(1);
    const pendingReviewLink = firstRow.getByRole("link", { name: /review/i });
    await expect(pendingReviewLink).toBeVisible();

    await pendingReviewLink.click();
    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const feedback = page.getByLabel(/feedback/i).or(page.locator("#feedback"));
    await expect(feedback).toBeVisible();
    await feedback.fill(
      "Needs improvement. Please revise and resubmit with better quality and accuracy."
    );

    const rejectBtn = page.getByRole("button", { name: /reject/i }).first();
    await expect(rejectBtn).toBeEnabled();
    await rejectBtn.click();

    const rejectedMessage = page.getByText(/rejected/i).first();
    await expect(rejectedMessage).toBeVisible();
  });
});

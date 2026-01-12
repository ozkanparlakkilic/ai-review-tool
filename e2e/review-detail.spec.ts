import { test, expect } from "./utils/fixtures";
import { filterReviewQueue } from "./utils/helpers";

test.use({ storageState: "e2e/.auth/reviewer.json" });

test.describe("Review Detail", () => {
  test("opens detail", async ({ page, testPrefix }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /review queue/i })
    ).toBeVisible({ timeout: 20000 });

    await filterReviewQueue(page, testPrefix);

    const reviewLink = page.locator('a[href^="/review/"]').first();
    await reviewLink.click();
    await expect(page).toHaveURL(/\/review\/[^/]+/);

    await expect(
      page.getByRole("heading", { name: /review item/i })
    ).toBeVisible();
    await expect(page.getByText(/^Prompt$/i)).toBeVisible();
    await expect(page.getByText(/^Model Output$/i)).toBeVisible();
  });

  test("approve updates status", async ({ page, reviewItems }) => {
    const pendingItem =
      reviewItems.find((item) => item.status === "PENDING") ?? reviewItems[0];
    await page.goto(`/review/${pendingItem.id}`);
    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const approveBtn = page.getByRole("button", { name: /approve/i }).first();
    await expect(approveBtn).toBeVisible();
    await expect(approveBtn).toBeEnabled();

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

    const successMessage = page.getByText(/approved|success/i).first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test("reject updates status", async ({ page, reviewItems }) => {
    const pendingItem =
      reviewItems.find((item) => item.status === "PENDING") ?? reviewItems[0];
    await page.goto(`/review/${pendingItem.id}`);
    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const feedback = page.getByLabel(/feedback/i).or(page.locator("#feedback"));
    await expect(feedback).toBeVisible();
    await feedback.fill(
      "Needs improvement. Please revise and resubmit with better quality and accuracy."
    );

    const rejectBtn = page.getByRole("button", { name: /reject/i }).first();
    await expect(rejectBtn).toBeEnabled();

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

    const rejectedMessage = page.getByText(/rejected|success/i).first();
    await expect(rejectedMessage).toBeVisible({ timeout: 5000 });
  });
});

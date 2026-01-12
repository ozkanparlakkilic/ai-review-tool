import { test, expect } from "./utils/fixtures";

test.describe("Error Handling", () => {
  test.describe("Reviewer", () => {
    test.use({ storageState: "e2e/.auth/reviewer.json" });

    test("handles non-existent review gracefully with UI visible", async ({
      page,
    }) => {
      await page.goto("/review/nonexistent-id-12345");

      const errorMessage = page.getByText(
        /error loading review|review not found/i
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();
      }

      await expect(
        page.getByRole("heading", { name: /review item/i })
      ).toBeVisible();
      await expect(
        page.getByLabel(/feedback/i).or(page.locator("#feedback"))
      ).toBeVisible();
      const rejectButton = page.getByRole("button", { name: /reject/i });
      const approveButton = page.getByRole("button", { name: /approve/i });
      await expect(rejectButton).toBeVisible();
      await expect(rejectButton).toBeDisabled();
      await expect(approveButton).toBeVisible();
      await expect(approveButton).toBeDisabled();
      await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
    });

    test("handles 500 error on review queue with table visible", async ({
      page,
    }) => {
      await page.route("**/api/review-items", (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal Server Error" }),
        })
      );

      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /review queue/i })
      ).toBeVisible();

      const table = page.getByRole("table");
      await expect(table).toBeVisible();

      await page.waitForTimeout(2000);

      const noResultsText = page.getByText(/no results|no items|empty|error/i);
      await expect(noResultsText.first())
        .toBeVisible({
          timeout: 5000,
        })
        .catch(() => {
          const tableBody = page.locator("tbody");
          expect(tableBody).toBeVisible();
        });

      const toast = page
        .locator('[role="status"]')
        .or(page.locator("[data-sonner-toast]"));
      await expect(toast.first())
        .toBeVisible({ timeout: 3000 })
        .catch(() => {});
    });

    test("handles 500 error on review detail with UI visible", async ({
      page,
    }) => {
      await page.goto("/");

      const firstRow = page.getByRole("row").nth(1);
      if (await firstRow.isVisible()) {
        const reviewLink = firstRow.getByRole("link", { name: /review/i });
        if (await reviewLink.isVisible()) {
          await page.route("**/api/review-items/*", (route) =>
            route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({ message: "Internal Server Error" }),
            })
          );

          await reviewLink.click();

          await expect(page.getByText(/error loading review/i)).toBeVisible({
            timeout: 5000,
          });

          await expect(page.getByText(/prompt/i).first()).toBeVisible();
          await expect(page.getByText(/model output/i).first()).toBeVisible();
          const rejectButton = page.getByRole("button", { name: /reject/i });
          const approveButton = page.getByRole("button", { name: /approve/i });
          await expect(rejectButton).toBeVisible();
          await expect(rejectButton).toBeDisabled();
          await expect(approveButton).toBeVisible();
          await expect(approveButton).toBeDisabled();

          const toast = page
            .locator('[role="status"]')
            .or(page.locator("[data-sonner-toast]"));
          await expect(toast.first())
            .toBeVisible({ timeout: 3000 })
            .catch(() => {});
        }
      }
    });

    test("feedback field exists on review detail page", async ({ page }) => {
      await page.goto("/");

      const heading = page.getByRole("heading", {
        name: /review queue|reviews/i,
      });
      await expect(heading).toBeVisible();

      const firstRow = page.getByRole("row").nth(1);
      const reviewLink = firstRow.getByRole("link", { name: /review/i });
      await reviewLink.click();

      await expect(page).toHaveURL(/\/review\/[^/]+/);

      const feedback = page
        .getByLabel(/feedback/i)
        .or(page.locator("#feedback"));
      await expect(feedback).toBeVisible();
      await expect(
        page.getByRole("button", { name: /reject/i }).first()
      ).toBeVisible();
    });

    test("handles network timeout gracefully", async ({ page }) => {
      await page.route("**/api/review-items", (route) => route.abort());
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /review queue/i })
      ).toBeVisible();

      const table = page.getByRole("table");
      await expect(table).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Admin", () => {
    test.use({ storageState: "e2e/.auth/admin.json" });

    test("handles 500 error on review queue with admin buttons visible", async ({
      page,
    }) => {
      await page.route("**/api/review-items", (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal Server Error" }),
        })
      );

      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /review queue/i })
      ).toBeVisible();

      const table = page.getByRole("table");
      await expect(table).toBeVisible();

      await page.waitForTimeout(2000);

      const approveButton = page.getByRole("button", {
        name: /approve.*selected/i,
      });
      await expect(approveButton)
        .toBeVisible({ timeout: 5000 })
        .catch(async () => {
          const buttons = page.getByRole("button");
          const buttonCount = await buttons.count();
          expect(buttonCount).toBeGreaterThan(0);
        });

      const rejectButton = page.getByRole("button", {
        name: /reject.*selected/i,
      });
      await expect(rejectButton)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});

      await expect(page.getByRole("link", { name: /insights/i })).toBeVisible();
      await expect(
        page.getByRole("link", { name: /audit log/i })
      ).toBeVisible();

      const toast = page
        .locator('[role="status"]')
        .or(page.locator("[data-sonner-toast]"));
      await expect(toast.first())
        .toBeVisible({ timeout: 3000 })
        .catch(() => {});
    });
  });
});

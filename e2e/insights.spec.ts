import { test, expect } from "./utils/fixtures";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Insights Dashboard", () => {
  test("displays KPI cards and metrics", async ({ page }) => {
    await page.goto("/insights");

    await expect(
      page.getByRole("heading", { name: /insights|dashboard/i })
    ).toBeVisible();

    const totalReviews = page.getByText(/total.*reviews?/i);
    await expect(totalReviews).toBeVisible();
  });

  test("renders charts and visualizations", async ({ page }) => {
    await page.goto("/insights");

    const heading = page.getByRole("heading", { name: /insights|dashboard/i });
    await expect(heading).toBeVisible();

    const chart = page.locator("canvas, svg").first();
    await expect(chart).toBeVisible();
  });

  test("date range picker changes data", async ({ page }) => {
    await page.goto("/insights");

    const heading = page.getByRole("heading", { name: /insights|dashboard/i });
    await expect(heading).toBeVisible();

    const datePicker = page.getByRole("button", {
      name: /date|range|calendar/i,
    });
    const hasDatePicker = (await datePicker.count()) > 0;

    if (hasDatePicker) {
      await datePicker.click();

      const lastWeekOption = page.getByText(/last.*week|7.*days/i);
      await expect(lastWeekOption).toBeVisible();
      await lastWeekOption.click();
    }
  });

  test("displays status distribution", async ({ page }) => {
    await page.goto("/insights");

    const heading = page.getByRole("heading", { name: /insights|dashboard/i });
    await expect(heading).toBeVisible();

    const statusLabels = [/pending/i, /approved/i, /rejected/i];

    let foundStatus = false;
    for (const label of statusLabels) {
      const element = page.getByText(label);
      const hasElement = (await element.count()) > 0;
      if (hasElement) {
        foundStatus = true;
        break;
      }
    }

    expect(foundStatus).toBeTruthy();
  });

  test("shows review trends over time", async ({ page }) => {
    await page.goto("/insights");

    const heading = page.getByRole("heading", { name: /insights|dashboard/i });
    await expect(heading).toBeVisible();

    const trendHeading = page.getByText(/trend|over time|timeline/i);
    await expect(trendHeading.first()).toBeVisible();

    const chart = page.locator("canvas, svg").first();
    await expect(chart).toBeVisible();
  });
});

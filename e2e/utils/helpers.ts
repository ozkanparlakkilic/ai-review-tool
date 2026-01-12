import { expect, type Page } from "@playwright/test";

export async function filterReviewQueue(
  page: Page,
  query: string
): Promise<void> {
  const searchInput = page.getByPlaceholder(/filter prompts/i);
  await expect(searchInput).toBeVisible();
  await searchInput.fill(query);
  await expect(searchInput).toHaveValue(query);
}

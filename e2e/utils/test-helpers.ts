import { Page } from "@playwright/test";
import { cleanDatabase } from "./db";

export async function resetDatabase(page: Page) {
  await page.request.post("http://localhost:3000/api/test/cleanup", {
    failOnStatusCode: false,
  });
}

export async function seedTestData(page: Page, data: unknown) {
  await page.request.post("http://localhost:3000/api/test/seed", {
    data,
    failOnStatusCode: false,
  });
}

export async function cleanTestDatabase() {
  try {
    await cleanDatabase();
  } catch (error) {
    console.error("Failed to clean test database:", error);
  }
}

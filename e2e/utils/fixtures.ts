import { test as base } from "@playwright/test";
import { prisma } from "./db";

type ReviewItemSeed = {
  id: string;
  prompt: string;
  modelOutput: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
};

const reviewItemsCache = new Map<number, Map<string, ReviewItemSeed[]>>();

function generateUniqueId(prefix: string, index: number): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}-${index}`;
}

export const test = base.extend<{
  testPrefix: string;
  reviewItems: ReviewItemSeed[];
}>({
  testPrefix: async ({}, use, testInfo) => {
    const normalizedTestId = testInfo.testId
      .replace(/[^a-z0-9]/gi, "-")
      .substring(0, 16);
    const prefix = `e2e-${testInfo.workerIndex}-${normalizedTestId}`;
    await use(prefix);
  },
  reviewItems: async ({ testPrefix }, use, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const now = Date.now();

    if (!reviewItemsCache.has(workerIndex)) {
      reviewItemsCache.set(workerIndex, new Map());
    }

    const workerCache = reviewItemsCache.get(workerIndex)!;
    let reviewItems: ReviewItemSeed[];
    const cacheKey = `${testPrefix}-${testInfo.file}`;

    if (workerCache.has(cacheKey)) {
      reviewItems = workerCache.get(cacheKey)!;
    } else {
      reviewItems = [
        {
          id: generateUniqueId(testPrefix, 1),
          prompt: `Test ${testPrefix} prompt 1`,
          modelOutput: `Test ${testPrefix} output 1`,
          status: "PENDING",
          priority: "medium",
          createdAt: new Date(now - 60_000),
        },
        {
          id: generateUniqueId(testPrefix, 2),
          prompt: `Test ${testPrefix} prompt 2`,
          modelOutput: `Test ${testPrefix} output 2`,
          status: "PENDING",
          priority: "high",
          createdAt: new Date(now - 50_000),
        },
        {
          id: generateUniqueId(testPrefix, 3),
          prompt: `Test ${testPrefix} prompt 3`,
          modelOutput: `Test ${testPrefix} output 3`,
          status: "PENDING",
          priority: "low",
          createdAt: new Date(now - 40_000),
        },
        {
          id: generateUniqueId(testPrefix, 4),
          prompt: `Test ${testPrefix} prompt 4`,
          modelOutput: `Test ${testPrefix} output 4`,
          status: "PENDING",
          priority: "medium",
          createdAt: new Date(now - 30_000),
        },
        {
          id: generateUniqueId(testPrefix, 5),
          prompt: `Test ${testPrefix} prompt 5`,
          modelOutput: `Test ${testPrefix} output 5`,
          status: "APPROVED",
          priority: "high",
          createdAt: new Date(now - 20_000),
        },
        {
          id: generateUniqueId(testPrefix, 6),
          prompt: `Test ${testPrefix} prompt 6`,
          modelOutput: `Test ${testPrefix} output 6`,
          status: "REJECTED",
          priority: "low",
          createdAt: new Date(now - 10_000),
        },
      ];

      await prisma.reviewItem.createMany({
        data: reviewItems,
        skipDuplicates: true,
      });

      workerCache.set(cacheKey, reviewItems);
    }

    await use(reviewItems);
  },
  page: async ({ page, reviewItems }, use) => {
    // reviewItems fixture automatically seeds data before page is used
    await use(page);
  },
});

export { expect } from "@playwright/test";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../route";
import {
  createMockRequest,
  createMockSession,
  assertPaginatedResponse,
  assertErrorResponse,
} from "@/test/helpers/api";
import { cleanDatabase, seedFactory } from "@/test/helpers/db";
import { NextResponse } from "next/server";
import { ReviewItem } from "@/shared/types";

vi.mock("@/server/auth", () => ({
  requireAuth: vi.fn(async () => {
    return createMockSession();
  }),
}));

describe("GET /api/review-items", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Basic Retrieval", () => {
    it("should return empty list when no items exist", async () => {
      const request = createMockRequest("/api/review-items");
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(0);
      expect(data.meta.total).toBe(0);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
    });

    it("should return all review items with default pagination", async () => {
      await seedFactory.createReviewItems(5);

      const request = createMockRequest("/api/review-items");
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(5);
      expect(data.meta.total).toBe(5);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
      expect(data.meta.totalPages).toBe(1);
    });

    it("should return items sorted by updatedAt desc by default", async () => {
      const old = await seedFactory.createReviewItem({
        prompt: "Old item",
        updatedAt: new Date("2024-01-01"),
      });
      const newer = await seedFactory.createReviewItem({
        prompt: "Newer item",
        updatedAt: new Date("2024-01-02"),
      });
      const newest = await seedFactory.createReviewItem({
        prompt: "Newest item",
        updatedAt: new Date("2024-01-03"),
      });

      const request = createMockRequest("/api/review-items");
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(3);
      expect(data.items[0].id).toBe(newest.id);
      expect(data.items[1].id).toBe(newer.id);
      expect(data.items[2].id).toBe(old.id);
    });
  });

  describe("Pagination", () => {
    beforeEach(async () => {
      for (let i = 0; i < 25; i++) {
        await seedFactory.createReviewItem({
          prompt: `Item ${i}`,
        });
      }
    });

    it("should paginate results with custom page and limit", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { page: "2", limit: "10" },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(10);
      expect(data.meta.total).toBe(25);
      expect(data.meta.page).toBe(2);
      expect(data.meta.limit).toBe(10);
      expect(data.meta.totalPages).toBe(3);
    });

    it("should return last page with remaining items", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { page: "3", limit: "10" },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(5);
      expect(data.meta.page).toBe(3);
    });

    it("should enforce maximum limit of 100", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { limit: "200" },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });

    it("should validate minimum page of 1", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { page: "0" },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });
  });

  describe("Filtering", () => {
    beforeEach(async () => {
      await seedFactory.createReviewItem({
        prompt: "Pending high priority",
        status: "PENDING",
        priority: "high",
      });
      await seedFactory.createReviewItem({
        prompt: "Approved medium priority",
        status: "APPROVED",
        priority: "medium",
      });
      await seedFactory.createReviewItem({
        prompt: "Rejected critical priority",
        status: "REJECTED",
        priority: "critical",
      });
      await seedFactory.createReviewItem({
        prompt: "Pending low priority",
        status: "PENDING",
        priority: "low",
      });
    });

    it("should filter by single status", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { status: ["PENDING"] },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(2);
      expect(data.items.every((item) => item.status === "PENDING")).toBe(true);
    });

    it("should filter by multiple statuses", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { status: ["PENDING", "APPROVED"] },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(3);
      expect(
        data.items.every(
          (item) => item.status === "PENDING" || item.status === "APPROVED"
        )
      ).toBe(true);
    });

    it("should filter by single priority", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { priority: ["critical"] },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].priority).toBe("critical");
    });

    it("should filter by multiple priorities", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { priority: ["high", "critical"] },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(2);
    });

    it("should combine status and priority filters", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: {
          status: ["PENDING"],
          priority: ["high"],
        },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].status).toBe("PENDING");
      expect(data.items[0].priority).toBe("high");
    });
  });

  describe("Search", () => {
    beforeEach(async () => {
      await seedFactory.createReviewItem({
        prompt: "How to use React hooks",
        modelOutput: "React hooks are functions...",
      });
      await seedFactory.createReviewItem({
        prompt: "Explain TypeScript generics",
        modelOutput: "TypeScript generics provide...",
      });
      await seedFactory.createReviewItem({
        prompt: "Database indexing strategies",
        modelOutput: "Indexing improves query performance...",
      });
    });

    it("should search in prompt field (case insensitive)", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { q: "react" },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].prompt).toContain("React");
    });

    it("should search in modelOutput field", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { q: "performance" },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].modelOutput).toContain("performance");
    });

    it("should search across both prompt and modelOutput", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { q: "typescript" },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(1);
    });

    it("should combine search with filters", async () => {
      await seedFactory.createReviewItem({
        prompt: "Another React question",
        status: "APPROVED",
      });

      const request = createMockRequest("/api/review-items", {
        searchParams: {
          q: "React",
          status: ["PENDING"],
        },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].status).toBe("PENDING");
    });
  });

  describe("Sorting", () => {
    beforeEach(async () => {
      await seedFactory.createReviewItem({
        prompt: "A",
        priority: "low",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
      await seedFactory.createReviewItem({
        prompt: "B",
        priority: "high",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
      });
      await seedFactory.createReviewItem({
        prompt: "C",
        priority: "medium",
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-03"),
      });
    });

    it("should sort by createdAt ascending", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: {
          sortBy: ["createdAt"],
          sortDir: ["asc"],
        },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items[0].prompt).toBe("A");
      expect(data.items[1].prompt).toBe("B");
      expect(data.items[2].prompt).toBe("C");
    });

    it("should sort by priority descending", async () => {
      await cleanDatabase();
      await seedFactory.createReviewItem({
        prompt: "Low",
        priority: "low",
      });
      await seedFactory.createReviewItem({
        prompt: "Critical",
        priority: "critical",
      });
      await seedFactory.createReviewItem({
        prompt: "Medium",
        priority: "medium",
      });

      const request = createMockRequest("/api/review-items", {
        searchParams: {
          sortBy: ["priority"],
          sortDir: ["desc"],
        },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items[0].prompt).toBe("Low");
    });

    it("should support multiple sort fields", async () => {
      await cleanDatabase();
      await seedFactory.createReviewItem({
        prompt: "Pending Low",
        status: "PENDING",
        priority: "low",
      });
      await seedFactory.createReviewItem({
        prompt: "Pending High",
        status: "PENDING",
        priority: "high",
      });
      await seedFactory.createReviewItem({
        prompt: "Approved Low",
        status: "APPROVED",
        priority: "low",
      });

      const request = createMockRequest("/api/review-items", {
        searchParams: {
          sortBy: ["status", "priority"],
          sortDir: ["asc", "desc"],
        },
      });
      const response = await GET(request);

      const data = await assertPaginatedResponse<ReviewItem>(response);
      expect(data.items).toHaveLength(3);
    });
  });

  describe("Authentication", () => {
    it("should require authentication", async () => {
      const { requireAuth } = await import("@/server/auth");
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      );

      const request = createMockRequest("/api/review-items");
      const response = await GET(request);

      await assertErrorResponse(response, 401, "Unauthorized");
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for invalid status value", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { status: ["INVALID_STATUS"] },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });

    it("should return 400 for invalid priority value", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: { priority: ["invalid_priority"] },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });

    it("should return 400 for invalid sortBy field", async () => {
      const request = createMockRequest("/api/review-items", {
        searchParams: {
          sortBy: ["invalidField"],
          sortDir: ["asc"],
        },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });
  });
});

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getReviewItems,
  getReviewItem,
  patchBatchReviewItems,
  type GetReviewItemsParams,
  type BatchUpdateRequest,
} from "../reviewItemsApi";
import { http } from "@/shared/services/http";

vi.mock("@/shared/services/http", () => ({
  http: vi.fn(),
}));

describe("reviewItemsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getReviewItems", () => {
    it("should call http with correct endpoint when no params provided", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const result = await getReviewItems();

      expect(http).toHaveBeenCalledWith("/review-items");
      expect(result).toEqual(mockResponse);
    });

    it("should build query params for single status", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        status: "PENDING",
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith("/review-items?status=PENDING");
    });

    it("should build query params for multiple statuses", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        status: ["PENDING", "APPROVED"],
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith(
        "/review-items?status=PENDING&status=APPROVED"
      );
    });

    it("should build query params for single priority", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        priority: "high",
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith("/review-items?priority=high");
    });

    it("should build query params for multiple priorities", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        priority: ["high", "critical"],
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith(
        "/review-items?priority=high&priority=critical"
      );
    });

    it("should build query params for search query", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        q: "search term",
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith("/review-items?q=search+term");
    });

    it("should build query params for sorting (single field)", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        sortBy: "createdAt",
        sortDir: "asc",
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith(
        "/review-items?sortBy=createdAt&sortDir=asc"
      );
    });

    it("should build query params for sorting (multiple fields)", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        sortBy: ["status", "priority"],
        sortDir: ["asc", "desc"],
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith(
        "/review-items?sortBy=status&sortBy=priority&sortDir=asc&sortDir=desc"
      );
    });

    it("should build query params for pagination", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 2, limit: 20, totalPages: 1 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        page: 2,
        limit: 20,
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith("/review-items?page=2&limit=20");
    });

    it("should build query params for all filters combined", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        status: ["PENDING"],
        priority: ["high", "critical"],
        q: "test",
        sortBy: ["updatedAt"],
        sortDir: ["desc"],
        page: 1,
        limit: 10,
      };

      await getReviewItems(params);

      const expectedUrl =
        "/review-items?status=PENDING&priority=high&priority=critical&q=test&sortBy=updatedAt&sortDir=desc&page=1&limit=10";
      expect(http).toHaveBeenCalledWith(expectedUrl);
    });

    it("should handle http errors", async () => {
      const mockError = new Error("Network error");
      vi.mocked(http).mockRejectedValueOnce(mockError);

      await expect(getReviewItems()).rejects.toThrow("Network error");
    });

    it("should not include undefined params in query string", async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const params: GetReviewItemsParams = {
        status: undefined,
        priority: undefined,
        q: undefined,
        page: 1,
      };

      await getReviewItems(params);

      expect(http).toHaveBeenCalledWith("/review-items?page=1");
    });
  });

  describe("getReviewItem", () => {
    it("should call http with correct endpoint for single item", async () => {
      const mockReviewItem = {
        id: "item-123",
        prompt: "Test prompt",
        modelOutput: "Test output",
        status: "PENDING" as const,
        priority: "medium" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: null,
        feedback: null,
      };

      vi.mocked(http).mockResolvedValueOnce(mockReviewItem);

      const result = await getReviewItem("item-123");

      expect(http).toHaveBeenCalledWith("/review-items/item-123");
      expect(result).toEqual(mockReviewItem);
    });

    it("should handle http errors for single item", async () => {
      const mockError = new Error("Item not found");
      vi.mocked(http).mockRejectedValueOnce(mockError);

      await expect(getReviewItem("non-existent")).rejects.toThrow(
        "Item not found"
      );
    });

    it("should handle special characters in item id", async () => {
      const mockReviewItem = {
        id: "item-with-special-chars-!@#",
        prompt: "Test",
        modelOutput: "Test",
        status: "PENDING" as const,
        priority: "low" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: null,
        feedback: null,
      };

      vi.mocked(http).mockResolvedValueOnce(mockReviewItem);

      await getReviewItem("item-with-special-chars-!@#");

      expect(http).toHaveBeenCalledWith(
        "/review-items/item-with-special-chars-!@#"
      );
    });
  });

  describe("patchBatchReviewItems", () => {
    it("should call http with correct endpoint and method for batch update", async () => {
      const mockResponse = {
        updatedIds: ["id1", "id2"],
        failed: [],
        items: [],
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const request: BatchUpdateRequest = {
        ids: ["id1", "id2"],
        status: "APPROVED",
      };

      const result = await patchBatchReviewItems(request);

      expect(http).toHaveBeenCalledWith("/review-items/batch", {
        method: "PATCH",
        body: JSON.stringify(request),
      });
      expect(result.data).toEqual(mockResponse);
      expect(result.message).toBe("success");
    });

    it("should include feedback in batch update request", async () => {
      const mockResponse = {
        updatedIds: ["id1"],
        failed: [],
        items: [],
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const request: BatchUpdateRequest = {
        ids: ["id1"],
        status: "REJECTED",
        feedback: "Quality issues",
      };

      await patchBatchReviewItems(request);

      expect(http).toHaveBeenCalledWith("/review-items/batch", {
        method: "PATCH",
        body: JSON.stringify(request),
      });
    });

    it("should handle partial failures in batch update", async () => {
      const mockResponse = {
        updatedIds: ["id1"],
        failed: [{ id: "id2", reason: "Item not found" }],
        items: [],
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const request: BatchUpdateRequest = {
        ids: ["id1", "id2"],
        status: "APPROVED",
      };

      const result = await patchBatchReviewItems(request);

      expect(result.data.updatedIds).toHaveLength(1);
      expect(result.data.failed).toHaveLength(1);
      expect(result.data.failed[0].id).toBe("id2");
    });

    it("should handle http errors for batch update", async () => {
      const mockError = new Error("Batch update failed");
      vi.mocked(http).mockRejectedValueOnce(mockError);

      const request: BatchUpdateRequest = {
        ids: ["id1"],
        status: "APPROVED",
      };

      await expect(patchBatchReviewItems(request)).rejects.toThrow(
        "Batch update failed"
      );
    });

    it("should handle empty ids array", async () => {
      const mockResponse = {
        updatedIds: [],
        failed: [],
        items: [],
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const request: BatchUpdateRequest = {
        ids: [],
        status: "APPROVED",
      };

      const result = await patchBatchReviewItems(request);

      expect(result.data.updatedIds).toHaveLength(0);
    });

    it("should handle null feedback", async () => {
      const mockResponse = {
        updatedIds: ["id1"],
        failed: [],
        items: [],
      };

      vi.mocked(http).mockResolvedValueOnce(mockResponse);

      const request: BatchUpdateRequest = {
        ids: ["id1"],
        status: "APPROVED",
        feedback: null,
      };

      await patchBatchReviewItems(request);

      expect(http).toHaveBeenCalledWith("/review-items/batch", {
        method: "PATCH",
        body: JSON.stringify({
          ids: ["id1"],
          status: "APPROVED",
          feedback: null,
        }),
      });
    });
  });
});

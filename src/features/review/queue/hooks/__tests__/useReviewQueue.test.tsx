import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useReviewQueue } from "../useReviewQueue";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/test/helpers/react-query";
import * as reviewItemsApi from "../../services/reviewItemsApi";

vi.mock("../../services/reviewItemsApi");

describe("useReviewQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const nowIso = "2024-01-01T00:00:00.000Z";
  const mockReviewItemsResponse = {
    items: [
      {
        id: "1",
        prompt: "Test 1",
        modelOutput: "Output 1",
        status: "PENDING" as const,
        priority: "high" as const,
        createdAt: nowIso,
        updatedAt: nowIso,
        reviewedAt: null,
        feedback: null,
      },
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  describe("Initialization", () => {
    it("should initialize with empty filters when no initial status provided", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue({
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      expect(result.current.status).toEqual([]);
      expect(result.current.priority).toEqual([]);
      expect(result.current.searchQuery).toBe("");
      expect(result.current.pagination).toEqual({ page: 1, limit: 10 });
      expect(result.current.sorting).toEqual([
        { field: "updatedAt", direction: "desc" },
      ]);
    });

    it("should initialize with provided initial status", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue("PENDING"), {
        wrapper,
      });

      expect(result.current.status).toEqual(["PENDING"]);
    });

    it("should fetch review items on mount", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(reviewItemsApi.getReviewItems).toHaveBeenCalled();
      });
    });
  });

  describe("Loading and Error States", () => {
    it("should set loading to true while fetching", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockReviewItemsResponse), 100)
          )
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should handle API errors", async () => {
      const mockError = new Error("API Error");
      vi.mocked(reviewItemsApi.getReviewItems).mockRejectedValue(mockError);

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it("should return items and meta from successful response", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.items).toEqual(mockReviewItemsResponse.items);
        expect(result.current.meta).toEqual(mockReviewItemsResponse.meta);
      });
    });
  });

  describe("Status Filter", () => {
    it("should update status filter and reset page to 1", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPagination({ page: 2, limit: 10 });
      });

      act(() => {
        result.current.setStatus(["APPROVED"]);
      });

      expect(result.current.status).toEqual(["APPROVED"]);
      expect(result.current.pagination.page).toBe(1);
    });

    it("should call API with status filter", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setStatus(["PENDING", "APPROVED"]);
      });

      await waitFor(() => {
        expect(reviewItemsApi.getReviewItems).toHaveBeenCalledWith(
          expect.objectContaining({
            status: ["PENDING", "APPROVED"],
          })
        );
      });
    });
  });

  describe("Priority Filter", () => {
    it("should update priority filter and reset page to 1", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPagination({ page: 2, limit: 10 });
      });

      act(() => {
        result.current.setPriority(["high", "critical"]);
      });

      expect(result.current.priority).toEqual(["high", "critical"]);
      expect(result.current.pagination.page).toBe(1);
    });

    it("should call API with priority filter", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPriority(["high"]);
      });

      await waitFor(() => {
        expect(reviewItemsApi.getReviewItems).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: ["high"],
          })
        );
      });
    });
  });

  describe("Search", () => {
    it("should debounce search query", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = vi.mocked(reviewItemsApi.getReviewItems).mock
        .calls.length;

      act(() => {
        result.current.setSearchQuery("test");
      });

      expect(result.current.searchQuery).toBe("test");

      const afterSetCallCount = vi.mocked(reviewItemsApi.getReviewItems).mock
        .calls.length;
      expect(afterSetCallCount).toBe(initialCallCount);

      await waitFor(
        () => {
          expect(reviewItemsApi.getReviewItems).toHaveBeenCalledWith(
            expect.objectContaining({ q: "test" })
          );
        },
        { timeout: 600 }
      );
    });

    it("should reset page to 1 when search query changes", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPagination({ page: 2, limit: 10 });
      });

      expect(result.current.pagination.page).toBe(2);

      act(() => {
        result.current.setSearchQuery("test");
      });

      await waitFor(
        () => {
          expect(result.current.pagination.page).toBe(1);
        },
        { timeout: 600 }
      );
    });

    it("should cancel previous debounce timer when search changes rapidly", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = vi.mocked(reviewItemsApi.getReviewItems).mock
        .calls.length;

      act(() => {
        result.current.setSearchQuery("a");
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      act(() => {
        result.current.setSearchQuery("ab");
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      act(() => {
        result.current.setSearchQuery("abc");
      });

      await waitFor(
        () => {
          const callsWithSearch = vi
            .mocked(reviewItemsApi.getReviewItems)
            .mock.calls.filter((call) => {
              const params = call[0];
              return params?.q === "abc";
            });
          expect(callsWithSearch.length).toBeGreaterThan(0);
        },
        { timeout: 600 }
      );

      const callsWithA = vi
        .mocked(reviewItemsApi.getReviewItems)
        .mock.calls.filter((call) => {
          const params = call[0];
          return params?.q === "a";
        });
      const callsWithAb = vi
        .mocked(reviewItemsApi.getReviewItems)
        .mock.calls.filter((call) => {
          const params = call[0];
          return params?.q === "ab";
        });

      expect(callsWithA.length).toBe(0);
      expect(callsWithAb.length).toBe(0);
    });
  });

  describe("Sorting", () => {
    it("should update sorting and reset page to 1", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPagination({ page: 2, limit: 10 });
      });

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2);
      });

      act(() => {
        result.current.setSorting([{ field: "createdAt", direction: "asc" }]);
      });

      expect(result.current.sorting).toEqual([
        { field: "createdAt", direction: "asc" },
      ]);
      expect(result.current.pagination.page).toBe(1);
    });

    it("should fallback to default sorting when empty array provided", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSorting([]);
      });

      expect(result.current.sorting).toEqual([
        { field: "updatedAt", direction: "desc" },
      ]);
    });

    it("should call API with sorting params", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSorting([
          { field: "priority", direction: "desc" },
          { field: "createdAt", direction: "asc" },
        ]);
      });

      await waitFor(
        () => {
          expect(reviewItemsApi.getReviewItems).toHaveBeenCalledWith(
            expect.objectContaining({
              sortBy: ["priority", "createdAt"],
              sortDir: ["desc", "asc"],
            })
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Pagination", () => {
    it("should update pagination", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPagination({ page: 3, limit: 20 });
      });

      expect(result.current.pagination).toEqual({ page: 3, limit: 20 });

      await waitFor(
        () => {
          expect(reviewItemsApi.getReviewItems).toHaveBeenCalledWith(
            expect.objectContaining({
              page: 3,
              limit: 20,
            })
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Refetch", () => {
    it("should expose refetch function", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe("function");

      const initialCallCount = vi.mocked(reviewItemsApi.getReviewItems).mock
        .calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      const finalCallCount = vi.mocked(reviewItemsApi.getReviewItems).mock.calls
        .length;
      expect(finalCallCount).toBe(initialCallCount + 1);
    });
  });

  describe("Combined Filters", () => {
    it("should call API with all filters combined", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      const { result } = renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setStatus(["PENDING"]);
        result.current.setPriority(["high", "critical"]);
        result.current.setSorting([{ field: "createdAt", direction: "asc" }]);
        result.current.setPagination({ page: 2, limit: 20 });
        result.current.setSearchQuery("test");
      });

      await waitFor(
        () => {
          const calls = vi.mocked(reviewItemsApi.getReviewItems).mock.calls;
          const lastCall = calls[calls.length - 1];
          const params = lastCall[0];

          expect(params).toMatchObject({
            status: ["PENDING"],
            priority: ["high", "critical"],
            q: "test",
            sortBy: ["createdAt"],
            sortDir: ["asc"],
            page: 1,
            limit: 20,
          });
        },
        { timeout: 600 }
      );
    });

    it("should omit empty filters from API call", async () => {
      vi.mocked(reviewItemsApi.getReviewItems).mockResolvedValue(
        mockReviewItemsResponse
      );

      const queryClient = createTestQueryClient();
      const wrapper = createQueryWrapper(queryClient);

      renderHook(() => useReviewQueue(), { wrapper });

      await waitFor(() => {
        expect(reviewItemsApi.getReviewItems).toHaveBeenCalledWith({
          status: undefined,
          priority: undefined,
          q: undefined,
          sortBy: ["updatedAt"],
          sortDir: ["desc"],
          page: 1,
          limit: 10,
        });
      });
    });
  });
});

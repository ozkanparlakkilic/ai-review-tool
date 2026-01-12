import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCreateReviewDecisionMutation } from "../../hooks/useCreateReviewDecisionMutation";
import {
  createTestQueryClient,
  createQueryWrapper,
} from "@/test/helpers/react-query";
import * as reviewDetailApi from "../../services/reviewDetailApi";
import { ReviewItem } from "@/shared/types";

vi.mock("../../services/reviewDetailApi");

describe("useCreateReviewDecisionMutation", () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const mockReviewItem: ReviewItem = {
    id: "item-1",
    prompt: "Test prompt",
    modelOutput: "Test output",
    status: "PENDING",
    priority: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    reviewedAt: null,
    feedback: null,
  };

  describe("Mutation Function", () => {
    it("should call patchReviewItem with correct parameters", async () => {
      const updatedItem = {
        ...mockReviewItem,
        status: "APPROVED" as const,
        feedback: "Good quality",
      };

      vi.mocked(reviewDetailApi.patchReviewItem).mockResolvedValue(updatedItem);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate({
          id: "item-1",
          status: "APPROVED",
          feedback: "Good quality",
        });
      });

      await waitFor(() => {
        expect(reviewDetailApi.patchReviewItem).toHaveBeenCalledWith({
          id: "item-1",
          status: "APPROVED",
          feedback: "Good quality",
        });
      });
    });

    it("should handle null feedback", async () => {
      const updatedItem = {
        ...mockReviewItem,
        status: "APPROVED" as const,
        feedback: null,
      };

      vi.mocked(reviewDetailApi.patchReviewItem).mockResolvedValue(updatedItem);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate({
          id: "item-1",
          status: "APPROVED",
          feedback: null,
        });
      });

      await waitFor(() => {
        expect(reviewDetailApi.patchReviewItem).toHaveBeenCalledWith({
          id: "item-1",
          status: "APPROVED",
          feedback: null,
        });
      });
    });

    it("should handle undefined feedback", async () => {
      const updatedItem = {
        ...mockReviewItem,
        status: "REJECTED" as const,
      };

      vi.mocked(reviewDetailApi.patchReviewItem).mockResolvedValue(updatedItem);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate({
          id: "item-1",
          status: "REJECTED",
        });
      });

      await waitFor(() => {
        expect(reviewDetailApi.patchReviewItem).toHaveBeenCalledWith({
          id: "item-1",
          status: "REJECTED",
          feedback: undefined,
        });
      });
    });
  });

  describe("Custom Options", () => {
    it("should accept and use custom options", async () => {
      const onSuccessMock = vi.fn();
      const updatedItem = {
        ...mockReviewItem,
        status: "APPROVED" as const,
      };

      vi.mocked(reviewDetailApi.patchReviewItem).mockResolvedValue(updatedItem);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(
        () =>
          useCreateReviewDecisionMutation({
            options: {
              onSuccess: onSuccessMock,
            },
          }),
        { wrapper }
      );

      await act(async () => {
        result.current.mutate({
          id: "item-1",
          status: "APPROVED",
        });
      });

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
        const call = onSuccessMock.mock.calls[0];
        expect(call[0]).toEqual(updatedItem);
        expect(call[1]).toMatchObject({ id: "item-1", status: "APPROVED" });
      });
    });

    it("should handle custom onError callback", async () => {
      const onErrorMock = vi.fn();
      const error = new Error("API Error");

      vi.mocked(reviewDetailApi.patchReviewItem).mockRejectedValue(error);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(
        () =>
          useCreateReviewDecisionMutation({
            options: {
              onError: onErrorMock,
            },
          }),
        { wrapper }
      );

      await act(async () => {
        result.current.mutate({
          id: "item-1",
          status: "APPROVED",
        });
      });

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalled();
        const call = onErrorMock.mock.calls[0];
        expect(call[0]).toEqual(error);
        expect(call[1]).toMatchObject({ id: "item-1", status: "APPROVED" });
      });
    });
  });

  describe("Error Handling", () => {
    it("should expose error state", async () => {
      const error = new Error("Network error");
      vi.mocked(reviewDetailApi.patchReviewItem).mockRejectedValue(error);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate({
          id: "item-1",
          status: "REJECTED",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe("Loading States", () => {
    it("should set isPending to true during mutation", async () => {
      let resolveMutation: (value: ReviewItem) => void;
      const mutationPromise = new Promise<ReviewItem>((resolve) => {
        resolveMutation = resolve;
      });

      vi.mocked(reviewDetailApi.patchReviewItem).mockImplementation(
        () => mutationPromise
      );

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      act(() => {
        result.current.mutate({
          id: "item-1",
          status: "APPROVED",
        });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await act(async () => {
        resolveMutation!({
          ...mockReviewItem,
          status: "APPROVED",
        });
        await mutationPromise;
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe("mutateAsync", () => {
    it("should expose mutateAsync function", async () => {
      const updatedItem = {
        ...mockReviewItem,
        status: "APPROVED" as const,
      };

      vi.mocked(reviewDetailApi.patchReviewItem).mockResolvedValue(updatedItem);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutateAsync).toBe("function");

      await act(async () => {
        const response = await result.current.mutateAsync({
          id: "item-1",
          status: "APPROVED",
        });

        expect(response.id).toEqual("item-1");
        expect(response.status).toEqual("APPROVED");
      });
    });

    it("should handle errors in mutateAsync", async () => {
      const error = new Error("API Error");
      vi.mocked(reviewDetailApi.patchReviewItem).mockRejectedValue(error);

      const wrapper = createQueryWrapper(queryClient);
      const { result } = renderHook(() => useCreateReviewDecisionMutation(), {
        wrapper,
      });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            id: "item-1",
            status: "APPROVED",
          })
        ).rejects.toThrow("API Error");
      });
    });
  });
});

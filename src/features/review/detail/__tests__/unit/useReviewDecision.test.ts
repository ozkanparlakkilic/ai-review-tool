import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReviewDecision } from "../../hooks/useReviewDecision";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activityLogService } from "@/features/audit-log/services/activity-log";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/features/audit-log/services/activity-log", () => ({
  activityLogService: {
    createLog: vi.fn(),
  },
}));

describe("useReviewDecision", () => {
  const mockItemId = "item-1";
  const mockMutate = vi.fn();
  const mockSetQueryData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue({
      setQueryData: mockSetQueryData,
    } as any);
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it("calls mutate with correct parameters", () => {
    const { result } = renderHook(() => useReviewDecision(mockItemId));

    result.current.mutate({ status: "APPROVED", feedback: "Good" });

    expect(mockMutate).toHaveBeenCalledWith({
      status: "APPROVED",
      feedback: "Good",
    });
  });

  it("logs activity on success", async () => {
    let successCallback: any;
    vi.mocked(useMutation).mockImplementation((options: any) => {
      successCallback = options.onSuccess;
      return { mutate: mockMutate, isPending: false } as any;
    });

    renderHook(() => useReviewDecision(mockItemId));

    const mockData = { id: mockItemId, status: "APPROVED" };
    successCallback(mockData, { status: "APPROVED", feedback: "Good" });

    expect(activityLogService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "REVIEW_APPROVED",
        targetId: mockItemId,
        metadata: { feedback: "Good" },
      })
    );
  });
});

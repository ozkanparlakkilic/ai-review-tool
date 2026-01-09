import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBulkDecision } from "../../hooks/useBulkDecision";
import { useMutation } from "@tanstack/react-query";
import { activityLogService } from "@/features/audit-log/services/activity-log";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock("@/features/audit-log/services/activity-log", () => ({
  activityLogService: {
    createLog: vi.fn(),
  },
}));

describe("useBulkDecision", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it("calls mutate with correct parameters", () => {
    const { result } = renderHook(() => useBulkDecision());

    result.current.mutate({
      ids: ["1", "2"],
      status: "REJECTED",
      feedback: "Spam",
    });

    expect(mockMutate).toHaveBeenCalledWith({
      ids: ["1", "2"],
      status: "REJECTED",
      feedback: "Spam",
    });
  });

  it("logs activity on success", () => {
    let successCallback: any;
    vi.mocked(useMutation).mockImplementation((options: any) => {
      successCallback = options.onSuccess;
      return { mutate: mockMutate, isPending: false } as any;
    });

    renderHook(() => useBulkDecision());

    successCallback(
      {},
      { ids: ["1", "2"], status: "REJECTED", feedback: "Spam" }
    );

    expect(activityLogService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "BULK_REJECT",
        metadata: {
          count: 2,
          ids: ["1", "2"],
          feedback: "Spam",
        },
      })
    );
  });
});

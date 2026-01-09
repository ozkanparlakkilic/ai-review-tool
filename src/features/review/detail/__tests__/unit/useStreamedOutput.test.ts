import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStreamedOutput } from "../../hooks/useStreamedOutput";
import { activityLogService } from "@/features/audit-log/services/activity-log";

vi.mock("@/features/audit-log/services/activity-log", () => ({
  activityLogService: {
    createLog: vi.fn(),
  },
}));

describe("useStreamedOutput", () => {
  const mockItemId = "item-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("starts streaming and logs event", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ chunks: ["hello", " world"], delayMs: 1 }),
    } as Response);

    const { result } = renderHook(() => useStreamedOutput(mockItemId));

    await act(async () => {
      await result.current.startStreaming();
    });

    expect(activityLogService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "STREAM_STARTED",
        targetId: mockItemId,
      })
    );
  });

  it("cancels streaming and logs event", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ chunks: ["a"], delayMs: 100 }),
    } as Response);

    const { result } = renderHook(() => useStreamedOutput(mockItemId));

    act(() => {
      result.current.startStreaming();
    });

    await act(async () => {
      result.current.cancelStreaming();
    });

    expect(activityLogService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "STREAM_CANCELLED",
        targetId: mockItemId,
      })
    );
  });
});

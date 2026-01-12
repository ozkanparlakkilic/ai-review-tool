import { describe, it, expect, vi, beforeEach } from "vitest";
import { activityLogService } from "@/features/audit-log/services/activity-log";
import { http } from "@/shared/services/http";
import { ActivityAction } from "@/shared/types/activity-log";

vi.mock("@/shared/services/http", () => ({
  http: vi.fn(),
}));

describe("activityLogService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLogs", () => {
    it("fetches logs with filters", async () => {
      const mockLogs = [{ id: "1", action: ActivityAction.USER_LOGIN }];
      vi.mocked(http).mockResolvedValue({
        items: mockLogs,
        meta: { total: mockLogs.length },
      });

      const result = await activityLogService.getLogs({
        action: ActivityAction.USER_LOGIN,
      });

      expect(http).toHaveBeenCalledWith(
        expect.stringContaining("/activity-logs?action=USER_LOGIN")
      );
      expect(result).toEqual(mockLogs);
    });

    it("fetches logs without filters", async () => {
      vi.mocked(http).mockResolvedValue({
        items: [],
        meta: { total: 0 },
      });
      await activityLogService.getLogs();
      expect(http).toHaveBeenCalledWith("/activity-logs");
    });
  });

  describe("createLog", () => {
    it("sends a POST request with log data", async () => {
      const logData = { action: ActivityAction.USER_LOGIN };
      vi.mocked(http).mockResolvedValue({ id: "1", ...logData });

      const result = await activityLogService.createLog(logData);

      expect(http).toHaveBeenCalledWith("/activity-logs", {
        method: "POST",
        body: JSON.stringify(logData),
      });
      expect(result.action).toBe(ActivityAction.USER_LOGIN);
    });
  });
});

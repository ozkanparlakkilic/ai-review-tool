import { describe, it, expect } from "vitest";
import { groupActivityLogs } from "@/shared/utils/activity-grouping";
import { ActivityAction } from "@/shared/types/activity-log";
import { ROLES } from "@/shared/constants/roles";

describe("grouping", () => {
  const mockLogs: any[] = [
    {
      id: "1",
      action: ActivityAction.BULK_REJECT,
      groupId: "group-1",
      createdAt: "2024-01-01T10:00:00Z",
      userName: "Admin",
      userRole: ROLES.ADMIN,
    },
    {
      id: "2",
      action: ActivityAction.REVIEW_REJECTED,
      groupId: "group-1",
      targetId: "target-1",
      createdAt: "2024-01-01T10:00:01Z",
      userName: "Admin",
      userRole: ROLES.ADMIN,
    },
    {
      id: "3",
      action: ActivityAction.REVIEW_REJECTED,
      groupId: "group-1",
      targetId: "target-2",
      createdAt: "2024-01-01T10:00:02Z",
      userName: "Admin",
      userRole: ROLES.ADMIN,
    },
    {
      id: "4",
      action: ActivityAction.USER_LOGIN,
      createdAt: "2024-01-01T09:00:00Z",
      userName: "User",
      userRole: ROLES.REVIEWER,
    },
  ];

  it("bulk logs share same groupId", () => {
    const grouped = groupActivityLogs(mockLogs);
    const bulkLog = grouped.find((l) => l.groupId === "group-1");
    expect(bulkLog).toBeDefined();
    expect(bulkLog?.children?.length).toBe(2);
  });

  it("grouping helper returns parent entry (bulk) and children entries", () => {
    const grouped = groupActivityLogs(mockLogs);
    const parent = grouped.find((l) => l.action === ActivityAction.BULK_REJECT);
    expect(parent).toBeDefined();
    expect(parent?.children).toContainEqual(
      expect.objectContaining({ id: "2" })
    );
    expect(parent?.children).toContainEqual(
      expect.objectContaining({ id: "3" })
    );
  });

  it("order is stable (newest first)", () => {
    const grouped = groupActivityLogs(mockLogs);
    expect(new Date(grouped[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(grouped[1].createdAt).getTime()
    );
  });
});

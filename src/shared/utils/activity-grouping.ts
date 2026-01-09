import { ActivityLog } from "../types/activity-log";

export interface GroupedActivityLog extends ActivityLog {
  children?: ActivityLog[];
}

export function groupActivityLogs(logs: ActivityLog[]): GroupedActivityLog[] {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups = new Map<string, GroupedActivityLog>();
  const result: GroupedActivityLog[] = [];

  const groupedById = new Map<string, ActivityLog[]>();

  sortedLogs.forEach((log) => {
    if (log.groupId) {
      if (!groupedById.has(log.groupId)) {
        groupedById.set(log.groupId, []);
      }
      groupedById.get(log.groupId)!.push(log);
    } else {
      result.push({ ...log });
    }
  });

  groupedById.forEach((groupLogs, groupId) => {
    const parentIndex = groupLogs.findIndex((l) => l.action.includes("BULK"));

    if (parentIndex !== -1) {
      const parent = { ...groupLogs[parentIndex] } as GroupedActivityLog;
      const children = groupLogs.filter((_, i) => i !== parentIndex);
      parent.children = children;
      result.push(parent);
    } else {
      result.push(...groupLogs);
    }
  });

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

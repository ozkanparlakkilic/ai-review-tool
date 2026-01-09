import { http } from "@/shared/services/http";
import { ActivityLog, ActivityAction } from "@/shared/types/activity-log";

export interface CreateActivityLogDto {
  action: ActivityAction;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityLogFilters {
  action?: ActivityAction;
  userRole?: string;
  riskLevel?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const activityLogService = {
  getLogs: async (filters?: ActivityLogFilters): Promise<ActivityLog[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const queryString = params.toString();
    return http<ActivityLog[]>(
      `/activity-logs${queryString ? `?${queryString}` : ""}`
    );
  },

  createLog: async (log: CreateActivityLogDto): Promise<ActivityLog> => {
    return http<ActivityLog>("/activity-logs", {
      method: "POST",
      body: JSON.stringify(log),
    });
  },
};

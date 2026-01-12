import { DateRange } from "@/features/insights/types";
import { GetReviewItemsParams } from "@/features/review/queue/services/reviewItemsApi";
import { ActivityLogFilters } from "@/features/audit-log/services/activity-log";

export const queryKeys = {
  reviewItems: (params?: GetReviewItemsParams) =>
    ["review-items", params] as const,
  reviewItem: (id: string) => ["review-item", id] as const,
  metrics: (range: DateRange) => ["metrics", range] as const,
  activityLogs: (filters?: ActivityLogFilters) =>
    ["activity-logs", filters] as const,
};

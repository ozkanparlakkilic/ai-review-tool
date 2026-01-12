import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { activityLogService, ActivityLogFilters } from "../services/activity-log";
import { ActivityLog } from "@/shared/types/activity-log";
import { queryKeys } from "@/shared/constants/queryKeys";

export function useActivityLogs({
  filters,
  options,
}: {
  filters?: ActivityLogFilters;
  options?: Omit<
    UseQueryOptions<ActivityLog[], Error, ActivityLog[]>,
    "queryKey" | "queryFn"
  >;
} = {}) {
  return useQuery({
    queryKey: queryKeys.activityLogs(filters),
    queryFn: () => activityLogService.getLogs(filters),
    ...options,
  });
}

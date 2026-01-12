import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {
  activityLogService,
  CreateActivityLogDto,
} from "../services/activity-log";
import { ActivityLog } from "@/shared/types/activity-log";
import { queryKeys } from "@/shared/constants/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateActivityLog({
  options,
}: {
  options?: UseMutationOptions<
    ActivityLog,
    unknown,
    CreateActivityLogDto,
    unknown
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityLogDto) => activityLogService.createLog(data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

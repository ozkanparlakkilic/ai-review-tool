import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ReviewStatus } from "@/shared/types";
import {
  BatchUpdateResponse,
  patchBatchReviewItems,
} from "../services/reviewItemsApi";

interface BulkDecisionParams {
  ids: string[];
  status: ReviewStatus;
  feedback?: string | null;
}

export function useCreateBulkDecisionMutation({
  options,
}: {
  options?: UseMutationOptions<
    { data: BatchUpdateResponse; message?: string },
    unknown,
    BulkDecisionParams,
    { previousData: { queryKey: readonly unknown[]; data: unknown }[] }
  >;
} = {}) {
  return useMutation({
    mutationFn: (data: BulkDecisionParams) => patchBatchReviewItems(data),
    ...options,
  });
}

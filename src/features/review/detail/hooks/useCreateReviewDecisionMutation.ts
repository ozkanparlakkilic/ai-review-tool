import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { patchReviewItem } from "../services/reviewDetailApi";

interface ReviewDecisionParams {
  id: string;
  status: ReviewStatus;
  feedback?: string | null;
}

export function useCreateReviewDecisionMutation({
  options,
}: {
  options?: UseMutationOptions<
    ReviewItem,
    unknown,
    ReviewDecisionParams,
    unknown
  >;
} = {}) {
  return useMutation({
    mutationFn: (data: ReviewDecisionParams) => patchReviewItem(data),
    ...options,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { updateReviewItem } from "../services/reviewDetailApi";
import { queryKeys } from "@/shared/constants/queryKeys";
import { activityLogService } from "@/features/audit-log/services/activity-log";
import { ActivityAction } from "@/shared/types/activity-log";

interface ReviewDecisionParams {
  id: string;
  status: ReviewStatus;
  feedback?: string | null;
}

export function useReviewDecision(itemId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ status, feedback }: Omit<ReviewDecisionParams, "id">) =>
      updateReviewItem(itemId, { status, feedback }),

    onMutate: async ({ status, feedback }) => {
      const detailKey = queryKeys.reviewItem(itemId);

      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: ["review-items"] });

      const previousDetail = queryClient.getQueryData<ReviewItem>(detailKey);

      if (previousDetail) {
        const now = new Date().toISOString();
        const optimisticItem: ReviewItem = {
          ...previousDetail,
          status,
          feedback: feedback ?? null,
          reviewedAt: status !== "PENDING" ? now : null,
          updatedAt: now,
        };

        queryClient.setQueryData(detailKey, optimisticItem);

        const listQueries = queryClient
          .getQueryCache()
          .findAll({ queryKey: ["review-items"] });

        listQueries.forEach((query) => {
          const oldData = query.state.data as ReviewItem[] | undefined;
          if (!oldData) return;

          const updatedList = oldData.map((item) =>
            item.id === itemId ? optimisticItem : item
          );
          queryClient.setQueryData(query.queryKey, updatedList);
        });
      }

      return { previousDetail };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.reviewItem(itemId),
          context.previousDetail
        );
      }

      queryClient.invalidateQueries({ queryKey: ["review-items"] });
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.reviewItem(itemId), data);

      activityLogService.createLog({
        action:
          variables.status === "APPROVED"
            ? ActivityAction.REVIEW_APPROVED
            : ActivityAction.REVIEW_REJECTED,
        targetId: itemId,
        metadata: { feedback: variables.feedback },
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewItem(itemId) });
      queryClient.invalidateQueries({ queryKey: ["review-items"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

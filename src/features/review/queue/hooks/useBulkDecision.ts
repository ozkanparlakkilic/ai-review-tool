import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { patchBatchReviewItems } from "../services/reviewItemsApi";

interface BulkDecisionParams {
  ids: string[];
  status: ReviewStatus;
  feedback?: string | null;
}

export function useBulkDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status, feedback }: BulkDecisionParams) =>
      patchBatchReviewItems({ ids, status, feedback }),

    onMutate: async ({ ids, status, feedback }) => {
      await queryClient.cancelQueries({ queryKey: ["review-items"] });

      const snapshots = new Map();
      const listQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["review-items"] });

      listQueries.forEach((query) => {
        const oldData = query.state.data as ReviewItem[] | undefined;
        if (!oldData) return;

        snapshots.set(query.queryKey, oldData);

        const now = new Date().toISOString();
        const updatedList = oldData.map((item) => {
          if (!ids.includes(item.id)) return item;

          return {
            ...item,
            status,
            feedback: feedback ?? null,
            reviewedAt: status !== "PENDING" ? now : null,
            updatedAt: now,
          };
        });

        queryClient.setQueryData(query.queryKey, updatedList);
      });

      return { snapshots };
    },

    onError: (_err, _variables, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["review-items"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}

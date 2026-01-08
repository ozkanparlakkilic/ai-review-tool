import { useQuery } from "@tanstack/react-query";
import { getReviewItem } from "../services/reviewDetailApi";
import { queryKeys } from "@/shared/constants/queryKeys";

export function useReviewDetail(id: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.reviewItem(id),
    queryFn: () => getReviewItem(id),
  });

  return {
    item: data ?? null,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
  };
}

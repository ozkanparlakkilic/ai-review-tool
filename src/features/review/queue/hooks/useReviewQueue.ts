import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReviewStatus } from "@/shared/types";
import { getReviewItems } from "../services/reviewItemsApi";
import { queryKeys } from "@/shared/constants/queryKeys";

export function useReviewQueue() {
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.reviewItems({ status, q: searchQuery || undefined }),
    queryFn: () =>
      getReviewItems({
        status,
        q: searchQuery || undefined,
      }),
  });

  return {
    items: data ?? [],
    loading: isLoading,
    error: isError ? error : null,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    refetch,
  };
}

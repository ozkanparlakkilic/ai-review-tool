import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReviewStatus } from "@/shared/types";
import { getReviewItems } from "../services/reviewItemsApi";
import { queryKeys } from "@/shared/constants/queryKeys";
import { normalizeFilters } from "../utils/filters";

export function useReviewQueue(initialStatus?: ReviewStatus) {
  const [status, setStatus] = useState<ReviewStatus | undefined>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.reviewItems(normalizeFilters(status, searchQuery)),
    queryFn: () => getReviewItems(normalizeFilters(status, searchQuery)),
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

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReviewStatus } from "@/shared/types";
import {
  getReviewItems,
  GetReviewItemsParams,
} from "../services/reviewItemsApi";
import { queryKeys } from "@/shared/constants/queryKeys";

export function useReviewQueue(initialStatus?: ReviewStatus) {
  const [status, setStatus] = useState<ReviewStatus[]>(
    initialStatus ? [initialStatus] : []
  );
  const [priority, setPriority] = useState<
    ("low" | "medium" | "high" | "critical")[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sorting, setSorting] = useState<
    Array<{ field: string; direction: "asc" | "desc" }>
  >([{ field: "updatedAt", direction: "desc" }]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = useCallback((statusArray: ReviewStatus[]) => {
    setStatus(statusArray);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePriorityChange = useCallback(
    (priorityArray: ("low" | "medium" | "high" | "critical")[]) => {
      setPriority(priorityArray);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    []
  );

  const handleSortingChange = useCallback(
    (newSorting: Array<{ field: string; direction: "asc" | "desc" }>) => {
      setSorting(
        newSorting.length > 0
          ? newSorting
          : [{ field: "updatedAt", direction: "desc" }]
      );
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    []
  );

  const params: GetReviewItemsParams = {
    status: status.length > 0 ? status : undefined,
    priority: priority.length > 0 ? priority : undefined,
    q: debouncedSearchQuery || undefined,
    sortBy:
      sorting.length > 0
        ? sorting.map(
            (s) => s.field as "updatedAt" | "createdAt" | "priority" | "status"
          )
        : undefined,
    sortDir: sorting.length > 0 ? sorting.map((s) => s.direction) : undefined,
    page: pagination.page,
    limit: pagination.limit,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.reviewItems(params),
    queryFn: () => getReviewItems(params),
  });

  return {
    items: data?.items ?? [],
    meta: data?.meta,
    loading: isLoading,
    error: isError ? error : null,
    status,
    setStatus: handleStatusChange,
    priority,
    setPriority: handlePriorityChange,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting: handleSortingChange,
    pagination,
    setPagination,
    refetch,
  };
}

import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../services/insightsApi";
import { queryKeys } from "@/shared/constants/queryKeys";
import { DateRange } from "../types";

export function useInsights(range: DateRange) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.metrics(range),
    queryFn: () => getMetrics(range),
    staleTime: 15 * 1000,
  });

  return {
    metrics: data ?? null,
    loading: isLoading,
    error: isError ? error : null,
  };
}

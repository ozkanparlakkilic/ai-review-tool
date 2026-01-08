import { useState, useEffect, useCallback } from "react";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { getReviewItems } from "../services/reviewItemsApi";

export function useReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviewItems({
        status,
        q: searchQuery || undefined,
      });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch items"));
    } finally {
      setLoading(false);
    }
  }, [status, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    refetch: fetchItems,
  };
}

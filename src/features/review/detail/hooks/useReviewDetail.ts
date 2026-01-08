import { useState, useEffect, useCallback } from "react";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { getReviewItem, updateReviewItem } from "../services/reviewDetailApi";
import { UpdateReviewRequest } from "../types";

export function useReviewDetail(id: string) {
  const [item, setItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviewItem(id);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch item"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const updateItem = async (
    status: ReviewStatus,
    feedback?: string | null
  ): Promise<void> => {
    if (!item) return;

    try {
      setSaving(true);
      const payload: UpdateReviewRequest = { status, feedback };
      const updated = await updateReviewItem(id, payload);
      setItem(updated);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return {
    item,
    loading,
    error,
    saving,
    updateItem,
    refetch: fetchItem,
  };
}

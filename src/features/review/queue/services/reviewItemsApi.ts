import { http } from "@/shared/services/http";
import { ReviewItem, ReviewStatus } from "@/shared/types";

export interface GetReviewItemsParams {
  status?: ReviewStatus;
  q?: string;
}

export interface BatchUpdateRequest {
  ids: string[];
  status: ReviewStatus;
  feedback?: string | null;
}

export interface BatchUpdateResponse {
  updated: ReviewItem[];
  failed: { id: string; reason: string }[];
}

export async function getReviewItems(
  params?: GetReviewItemsParams
): Promise<ReviewItem[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.append("status", params.status);
  }

  if (params?.q) {
    searchParams.append("q", params.q);
  }

  const query = searchParams.toString();
  const endpoint = `/review-items${query ? `?${query}` : ""}`;

  return http<ReviewItem[]>(endpoint);
}

export async function getReviewItem(id: string): Promise<ReviewItem> {
  return http<ReviewItem>(`/review-items/${id}`);
}

export async function patchBatchReviewItems(
  data: BatchUpdateRequest
): Promise<BatchUpdateResponse> {
  return http<BatchUpdateResponse>("/review-items/batch", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

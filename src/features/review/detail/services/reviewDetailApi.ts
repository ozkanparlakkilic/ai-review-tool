import { http } from "@/shared/services/http";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { UpdateReviewRequest } from "../types";

export async function getReviewItem(id: string): Promise<ReviewItem> {
  return http<ReviewItem>(`/review-items/${id}`);
}

export interface PatchReviewItemRequest {
  id: string;
  status: ReviewStatus;
  feedback?: string | null;
}

export async function patchReviewItem(
  data: PatchReviewItemRequest
): Promise<ReviewItem> {
  const { id, ...body } = data;
  return http<ReviewItem>(`/review-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

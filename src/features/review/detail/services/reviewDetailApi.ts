import { http } from "@/shared/services/http";
import { ReviewItem } from "@/shared/types";
import { UpdateReviewRequest } from "../types";

export async function getReviewItem(id: string): Promise<ReviewItem> {
  return http<ReviewItem>(`/review-items/${id}`);
}

export async function updateReviewItem(
  id: string,
  data: UpdateReviewRequest
): Promise<ReviewItem> {
  return http<ReviewItem>(`/review-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

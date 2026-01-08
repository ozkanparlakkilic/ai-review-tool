import { ReviewStatus } from "@/shared/types";

export interface UpdateReviewRequest {
  status: ReviewStatus;
  feedback?: string | null;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewItem {
  id: string;
  prompt: string;
  modelOutput: string;
  status: ReviewStatus;
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

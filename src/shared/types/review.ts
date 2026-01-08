export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Priority = "low" | "medium" | "high" | "critical";

export interface ReviewItem {
  id: string;
  prompt: string;
  modelOutput: string;
  status: ReviewStatus;
  priority: Priority;
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

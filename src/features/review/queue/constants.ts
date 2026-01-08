import { ReviewStatus } from "@/shared/types";

export const REVIEW_STATUSES: ReviewStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<
  ReviewStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

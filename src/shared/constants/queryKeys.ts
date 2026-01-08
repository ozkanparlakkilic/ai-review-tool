import { ReviewStatus } from "@/shared/types";
import { DateRange } from "@/features/insights/types";

export interface ReviewItemsParams {
  status?: ReviewStatus;
  q?: string;
}

export const queryKeys = {
  reviewItems: (params?: ReviewItemsParams) =>
    ["review-items", params] as const,
  reviewItem: (id: string) => ["review-item", id] as const,
  metrics: (range: DateRange) => ["metrics", range] as const,
};

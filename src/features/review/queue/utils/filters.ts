import { ReviewStatus } from "@/shared/types";

export function normalizeFilters(status?: ReviewStatus, query?: string) {
  return {
    status: status || undefined,
    q: query?.trim() || undefined,
  };
}

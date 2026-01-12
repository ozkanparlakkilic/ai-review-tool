import { http } from "@/shared/services/http";
import { ReviewItem, ReviewStatus } from "@/shared/types";

export interface GetReviewItemsParams {
  status?: ReviewStatus | ReviewStatus[];
  priority?:
    | "low"
    | "medium"
    | "high"
    | "critical"
    | Array<"low" | "medium" | "high" | "critical">;
  q?: string;
  sortBy?:
    | ("updatedAt" | "createdAt" | "priority" | "status")
    | Array<"updatedAt" | "createdAt" | "priority" | "status">;
  sortDir?: "asc" | "desc" | Array<"asc" | "desc">;
  page?: number;
  limit?: number;
}

export interface BatchUpdateRequest {
  ids: string[];
  status: ReviewStatus;
  feedback?: string | null;
}

export interface ReviewItemsResponse {
  items: ReviewItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BatchUpdateResponse {
  updatedIds: string[];
  failed: { id: string; reason: string }[];
  items: ReviewItem[];
}

export async function getReviewItems(
  params?: GetReviewItemsParams
): Promise<ReviewItemsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    const statusArray = Array.isArray(params.status)
      ? params.status
      : [params.status];
    statusArray.forEach((status) => {
      searchParams.append("status", status);
    });
  }

  if (params?.priority) {
    const priorityArray = Array.isArray(params.priority)
      ? params.priority
      : [params.priority];
    priorityArray.forEach((priority) => {
      searchParams.append("priority", priority);
    });
  }

  if (params?.q) {
    searchParams.append("q", params.q);
  }

  if (params?.sortBy) {
    const sortByArray = Array.isArray(params.sortBy)
      ? params.sortBy
      : [params.sortBy];
    sortByArray.forEach((sortBy) => {
      searchParams.append("sortBy", sortBy);
    });
  }

  if (params?.sortDir) {
    const sortDirArray = Array.isArray(params.sortDir)
      ? params.sortDir
      : [params.sortDir];
    sortDirArray.forEach((sortDir) => {
      searchParams.append("sortDir", sortDir);
    });
  }

  if (params?.page) {
    searchParams.append("page", params.page.toString());
  }

  if (params?.limit) {
    searchParams.append("limit", params.limit.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/review-items${query ? `?${query}` : ""}`;

  return http<ReviewItemsResponse>(endpoint);
}

export async function getReviewItem(id: string): Promise<ReviewItem> {
  return http<ReviewItem>(`/review-items/${id}`);
}

export async function patchBatchReviewItems(
  data: BatchUpdateRequest
): Promise<{ data: BatchUpdateResponse; message?: string }> {
  const response = await http<BatchUpdateResponse>("/review-items/batch", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return {
    data: response,
    message: "success",
  };
}

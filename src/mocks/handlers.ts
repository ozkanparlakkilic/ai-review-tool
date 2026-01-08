import { http, HttpResponse } from "msw";
import { mockReviewItems } from "./data";
import { ReviewStatus } from "@/shared/types";

export const handlers = [
  http.get("/api/review-items", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const query = url.searchParams.get("q")?.toLowerCase();

    let filtered = [...mockReviewItems];

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (query) {
      filtered = filtered.filter((item) =>
        item.prompt.toLowerCase().includes(query)
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return HttpResponse.json(filtered);
  }),

  http.get("/api/review-items/:id", ({ params }) => {
    const { id } = params;
    const item = mockReviewItems.find((item) => item.id === id);

    if (!item) {
      return HttpResponse.json(
        { message: "Review item not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(item);
  }),

  http.patch("/api/review-items/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as {
      status: ReviewStatus;
      feedback?: string | null;
    };

    const itemIndex = mockReviewItems.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return HttpResponse.json(
        { message: "Review item not found" },
        { status: 404 }
      );
    }

    if (
      !body.status ||
      !["APPROVED", "REJECTED", "PENDING"].includes(body.status)
    ) {
      return HttpResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const now = new Date().toISOString();
    mockReviewItems[itemIndex] = {
      ...mockReviewItems[itemIndex],
      status: body.status,
      feedback: body.feedback ?? null,
      reviewedAt: body.status !== "PENDING" ? now : null,
      updatedAt: now,
    };

    return HttpResponse.json(mockReviewItems[itemIndex]);
  }),
];

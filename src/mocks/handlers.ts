import { http, HttpResponse } from "msw";
import { mockReviewItems } from "./data";

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
];

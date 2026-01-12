import { http, HttpResponse } from "msw";
import { mockReviewItems, mockActivityLogs } from "./data";
import { ReviewStatus } from "@/shared/types";
import { DateRange } from "@/features/insights/types";
import {
  ActivityLog,
  ActivityAction,
  RISK_LEVELS,
} from "@/shared/types/activity-log";
import { ROLES } from "@/shared/constants/roles";

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

  http.patch("/api/review-items/batch", async ({ request }) => {
    const body = (await request.json()) as {
      ids: string[];
      status: ReviewStatus;
      feedback?: string | null;
    };

    const updated: typeof mockReviewItems = [];
    const failed: { id: string; reason: string }[] = [];
    const now = new Date().toISOString();

    body.ids.forEach((id) => {
      const itemIndex = mockReviewItems.findIndex((item) => item.id === id);

      if (itemIndex === -1) {
        failed.push({ id, reason: "Item not found" });
        return;
      }

      mockReviewItems[itemIndex] = {
        ...mockReviewItems[itemIndex],
        status: body.status,
        feedback: body.feedback ?? null,
        reviewedAt: body.status !== "PENDING" ? now : null,
        updatedAt: now,
      };

      updated.push(mockReviewItems[itemIndex]);
    });

    return HttpResponse.json({
      data: {
        updatedIds: updated.map((item) => item.id),
        failed,
        items: updated,
      },
    });
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

  http.get("/api/review-items/:id/stream", ({ params }) => {
    const { id } = params;
    const item = mockReviewItems.find((item) => item.id === id);

    if (!item) {
      return HttpResponse.json(
        { message: "Review item not found" },
        { status: 404 }
      );
    }

    const text = item.modelOutput;
    const chunkSize = 15;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    return HttpResponse.json({
      chunks,
      delayMs: 50,
    });
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

  http.get("/api/metrics", ({ request }) => {
    const url = new URL(request.url);
    const range = (url.searchParams.get("range") as DateRange) || "7d";

    const now = new Date();
    const cutoffDate = new Date();
    if (range === "7d") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (range === "30d") {
      cutoffDate.setDate(now.getDate() - 30);
    } else {
      cutoffDate.setFullYear(2000);
    }

    const total = mockReviewItems.length;
    const pending = mockReviewItems.filter(
      (item) => item.status === "PENDING"
    ).length;
    const approved = mockReviewItems.filter(
      (item) => item.status === "APPROVED"
    ).length;
    const rejected = mockReviewItems.filter(
      (item) => item.status === "REJECTED"
    ).length;

    const reviewedItems = mockReviewItems.filter(
      (item) => item.reviewedAt && new Date(item.reviewedAt) >= cutoffDate
    );

    const approvalRate =
      approved + rejected > 0
        ? Math.round((approved / (approved + rejected)) * 100)
        : 0;

    let avgReviewMinutes: number | null = null;
    if (reviewedItems.length > 0) {
      const totalMinutes = reviewedItems.reduce((sum, item) => {
        if (!item.reviewedAt) return sum;
        const created = new Date(item.createdAt).getTime();
        const reviewed = new Date(item.reviewedAt).getTime();
        return sum + (reviewed - created) / 1000 / 60;
      }, 0);
      avgReviewMinutes = Math.round(totalMinutes / reviewedItems.length);
    }

    const dailyMap = new Map<
      string,
      { approved: number; rejected: number; pending: number }
    >();

    if (range !== "all") {
      const daysToShow = range === "7d" ? 7 : 30;
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dailyMap.set(dateStr, { approved: 0, rejected: 0, pending: 0 });
      }
    }

    reviewedItems.forEach((item) => {
      if (!item.reviewedAt) return;
      const date = new Date(item.reviewedAt).toISOString().split("T")[0];

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { approved: 0, rejected: 0, pending: 0 });
      }

      const day = dailyMap.get(date)!;
      if (item.status === "APPROVED") day.approved++;
      if (item.status === "REJECTED") day.rejected++;
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
        reviewed: counts.approved + counts.rejected,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return HttpResponse.json({
      range,
      kpis: {
        total,
        pending,
        approved,
        rejected,
        approvalRate,
        avgReviewMinutes,
      },
      daily,
    });
  }),

  http.get("/api/activity-logs", ({ request }) => {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const userRole = url.searchParams.get("userRole");
    const riskLevel = url.searchParams.get("riskLevel");
    const search = url.searchParams.get("search") || url.searchParams.get("q");
    const searchLower = search?.toLowerCase();

    let filtered = [...mockActivityLogs];

    if (action) {
      filtered = filtered.filter((log) => log.action === action);
    }
    if (userRole) {
      filtered = filtered.filter((log) => log.userRole === userRole);
    }
    if (riskLevel) {
      filtered = filtered.filter((log) => log.riskLevel === riskLevel);
    }
    if (searchLower) {
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchLower) ||
          log.targetId?.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return HttpResponse.json({
      items: filtered,
      meta: { total: filtered.length },
    });
  }),

  http.post("/api/activity-logs", async ({ request }) => {
    const body = (await request.json()) as {
      action: ActivityAction;
      targetId?: string;
      metadata?: Record<string, any>;
    };

    const newLog: ActivityLog = {
      id: `log-${mockActivityLogs.length + 1}`,
      userId: "user-1",
      userName: "Admin User",
      userRole: ROLES.ADMIN,
      action: body.action,
      targetId: body.targetId,
      metadata: body.metadata,
      riskLevel: RISK_LEVELS[body.action],
      createdAt: new Date().toISOString(),
    };

    mockActivityLogs.unshift(newLog);
    return HttpResponse.json(newLog, { status: 201 });
  }),
];

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../route";
import {
  createMockRequest,
  createMockAdminSession,
  assertJsonResponse,
  assertErrorResponse,
} from "@/test/helpers/api";
import { cleanDatabase, seedFactory } from "@/test/helpers/db";
import { NextResponse } from "next/server";

vi.mock("@/server/auth", () => ({
  requireAuth: vi.fn(async (allowedRoles?: string[]) => {
    const session = createMockAdminSession();
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.user.role)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return session;
  }),
}));

interface MetricsResponse {
  range: string;
  kpis: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    avgReviewMinutes: number | null;
  };
  daily: Array<{
    date: string;
    approved: number;
    rejected: number;
    pending: number;
    reviewed: number;
  }>;
}

describe("GET /api/metrics", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("KPI Calculations", () => {
    it("should return zero metrics when no items exist", async () => {
      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.range).toBe("7d");
      expect(data.kpis.total).toBe(0);
      expect(data.kpis.pending).toBe(0);
      expect(data.kpis.approved).toBe(0);
      expect(data.kpis.rejected).toBe(0);
      expect(data.kpis.approvalRate).toBe(0);
      expect(data.kpis.avgReviewMinutes).toBeNull();
    });

    it("should calculate total count correctly", async () => {
      await seedFactory.createReviewItem({ status: "PENDING" });
      await seedFactory.createReviewItem({ status: "APPROVED" });
      await seedFactory.createReviewItem({ status: "REJECTED" });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.total).toBe(3);
      expect(data.kpis.pending).toBe(1);
      expect(data.kpis.approved).toBe(1);
      expect(data.kpis.rejected).toBe(1);
    });

    it("should calculate approval rate correctly", async () => {
      await seedFactory.createReviewItem({ status: "APPROVED" });
      await seedFactory.createReviewItem({ status: "APPROVED" });
      await seedFactory.createReviewItem({ status: "APPROVED" });
      await seedFactory.createReviewItem({ status: "REJECTED" });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.approved).toBe(3);
      expect(data.kpis.rejected).toBe(1);
      expect(data.kpis.approvalRate).toBe(75);
    });

    it("should calculate average review time in minutes", async () => {
      const now = new Date();

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 60 * 60 * 1000),
        reviewedAt: now,
      });

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 120 * 60 * 1000),
        reviewedAt: now,
      });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.avgReviewMinutes).toBe(90);
    });

    it("should return null average when no reviewed items", async () => {
      await seedFactory.createReviewItem({ status: "PENDING" });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.avgReviewMinutes).toBeNull();
    });
  });

  describe("Date Range Filtering", () => {
    it("should filter by 7 day range", async () => {
      const now = new Date();

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      });

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      });

      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "7d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.range).toBe("7d");
      expect(data.kpis.total).toBe(1);
    });

    it("should filter by 30 day range", async () => {
      const now = new Date();

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      });

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      });

      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "30d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.range).toBe("30d");
      expect(data.kpis.total).toBe(1);
    });

    it("should include all items for 'all' range", async () => {
      const now = new Date();

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
      });

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      });

      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "all" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.range).toBe("all");
      expect(data.kpis.total).toBe(2);
    });
  });

  describe("Daily Breakdown", () => {
    it("should return daily data for 7d range", async () => {
      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "7d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.daily).toHaveLength(7);
      expect(data.daily.every((day) => "date" in day)).toBe(true);
      expect(data.daily.every((day) => "approved" in day)).toBe(true);
      expect(data.daily.every((day) => "rejected" in day)).toBe(true);
      expect(data.daily.every((day) => "pending" in day)).toBe(true);
      expect(data.daily.every((day) => "reviewed" in day)).toBe(true);
    });

    it("should return daily data for 30d range", async () => {
      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "30d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.daily).toHaveLength(30);
    });

    it("should aggregate items by review date", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      await seedFactory.createReviewItem({
        status: "APPROVED",
        reviewedAt: new Date(),
      });

      await seedFactory.createReviewItem({
        status: "APPROVED",
        reviewedAt: new Date(),
      });

      await seedFactory.createReviewItem({
        status: "REJECTED",
        reviewedAt: new Date(),
      });

      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "7d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      const todayData = data.daily.find((d) => d.date === todayStr);
      expect(todayData).toBeDefined();
      expect(todayData!.approved).toBe(2);
      expect(todayData!.rejected).toBe(1);
      expect(todayData!.reviewed).toBe(3);
    });

    it("should use createdAt for pending items in daily breakdown", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      await seedFactory.createReviewItem({
        status: "PENDING",
        createdAt: new Date(),
      });

      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "7d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      const todayData = data.daily.find((d) => d.date === todayStr);
      expect(todayData).toBeDefined();
      expect(todayData!.pending).toBe(1);
    });

    it("should sort daily data by date ascending", async () => {
      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "7d" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      const dates = data.daily.map((d) => d.date);
      const sortedDates = [...dates].sort();
      expect(dates).toEqual(sortedDates);
    });
  });

  describe("Authorization", () => {
    it("should require ADMIN role", async () => {
      const { requireAuth } = await import("@/server/auth");
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ message: "Forbidden" }, { status: 403 })
      );

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      await assertErrorResponse(response, 403, "Forbidden");
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for invalid range", async () => {
      const request = createMockRequest("/api/metrics", {
        searchParams: { range: "invalid" },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });

    it("should default to 7d if range not specified", async () => {
      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);
      expect(data.range).toBe("7d");
    });
  });

  describe("Edge Cases", () => {
    it("should handle items with no reviewedAt date", async () => {
      await seedFactory.createReviewItem({
        status: "PENDING",
        reviewedAt: null,
      });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.total).toBe(1);
      expect(data.kpis.pending).toBe(1);
      expect(data.kpis.avgReviewMinutes).toBeNull();
    });

    it("should handle zero division in approval rate", async () => {
      await seedFactory.createReviewItem({ status: "PENDING" });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.approvalRate).toBe(0);
    });

    it("should round average review minutes", async () => {
      const now = new Date();

      await seedFactory.createReviewItem({
        status: "APPROVED",
        createdAt: new Date(now.getTime() - 65 * 60 * 1000),
        reviewedAt: now,
      });

      const request = createMockRequest("/api/metrics");
      const response = await GET(request);

      const data = await assertJsonResponse<MetricsResponse>(response, 200);

      expect(data.kpis.avgReviewMinutes).toBe(65);
    });
  });
});

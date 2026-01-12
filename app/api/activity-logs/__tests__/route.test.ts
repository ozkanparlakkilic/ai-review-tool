import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "../route";
import {
  createMockRequest,
  createMockSession,
  createMockAdminSession,
  assertJsonResponse,
  assertErrorResponse,
} from "@/test/helpers/api";
import { cleanDatabase, seedFactory, getTestPrisma } from "@/test/helpers/db";
import { NextResponse } from "next/server";

const mockSession = createMockAdminSession();

vi.mock("@/server/auth", () => ({
  requireAuth: vi.fn(async (allowedRoles?: string[]) => {
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(mockSession.user.role)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return mockSession;
  }),
}));

describe("GET /api/activity-logs", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Basic Retrieval", () => {
    it("should return empty list when no logs exist", async () => {
      const request = createMockRequest("/api/activity-logs");
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: unknown[];
        meta: { total: number };
      }>(response, 200);

      expect(data.items).toHaveLength(0);
      expect(data.meta.total).toBe(0);
    });

    it("should return all activity logs", async () => {
      await seedFactory.createActivityLog({
        action: "REVIEW_APPROVED",
        userId: "user-1",
      });
      await seedFactory.createActivityLog({
        action: "REVIEW_REJECTED",
        userId: "user-2",
      });
      await seedFactory.createActivityLog({
        action: "USER_LOGIN",
        userId: "user-1",
      });

      const request = createMockRequest("/api/activity-logs");
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: unknown[];
        meta: { total: number };
      }>(response, 200);

      expect(data.items).toHaveLength(3);
      expect(data.meta.total).toBe(3);
    });

    it("should return logs sorted by createdAt desc by default", async () => {
      const old = await seedFactory.createActivityLog({
        action: "USER_LOGIN",
        createdAt: new Date("2024-01-01"),
      });
      const newer = await seedFactory.createActivityLog({
        action: "REVIEW_APPROVED",
        createdAt: new Date("2024-01-02"),
      });
      const newest = await seedFactory.createActivityLog({
        action: "REVIEW_REJECTED",
        createdAt: new Date("2024-01-03"),
      });

      const request = createMockRequest("/api/activity-logs");
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ id: string }>;
      }>(response, 200);

      expect(data.items[0].id).toBe(newest.id);
      expect(data.items[1].id).toBe(newer.id);
      expect(data.items[2].id).toBe(old.id);
    });
  });

  describe("Filtering", () => {
    beforeEach(async () => {
      await seedFactory.createActivityLog({
        action: "REVIEW_APPROVED",
        userRole: "REVIEWER",
        riskLevel: "LOW",
      });
      await seedFactory.createActivityLog({
        action: "REVIEW_REJECTED",
        userRole: "ADMIN",
        riskLevel: "MEDIUM",
      });
      await seedFactory.createActivityLog({
        action: "BULK_REJECT",
        userRole: "ADMIN",
        riskLevel: "HIGH",
      });
    });

    it("should filter by action", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { action: "REVIEW_APPROVED" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ action: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].action).toBe("REVIEW_APPROVED");
    });

    it("should filter by userRole", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { userRole: "ADMIN" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ userRole: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(2);
      expect(data.items.every((log) => log.userRole === "ADMIN")).toBe(true);
    });

    it("should filter by riskLevel", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { riskLevel: "HIGH" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ riskLevel: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].riskLevel).toBe("HIGH");
    });

    it("should combine multiple filters", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: {
          userRole: "ADMIN",
          riskLevel: "HIGH",
        },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ userRole: string; riskLevel: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].userRole).toBe("ADMIN");
      expect(data.items[0].riskLevel).toBe("HIGH");
    });
  });

  describe("Search", () => {
    beforeEach(async () => {
      await seedFactory.createActivityLog({
        userName: "John Doe",
        targetId: "review-123",
        action: "REVIEW_APPROVED",
      });
      await seedFactory.createActivityLog({
        userName: "Jane Smith",
        targetId: "review-456",
        action: "REVIEW_REJECTED",
      });
    });

    it("should search by userName", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { search: "John" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ userName: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].userName).toBe("John Doe");
    });

    it("should search by targetId", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { search: "review-456" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ targetId: string | null }>;
      }>(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].targetId).toBe("review-456");
    });

    it("should search by action (partial match)", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { search: "APPROVED" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ action: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].action).toBe("REVIEW_APPROVED");
    });
  });

  describe("Date Range Filtering", () => {
    beforeEach(async () => {
      await seedFactory.createActivityLog({
        action: "USER_LOGIN",
        createdAt: new Date("2024-01-01"),
      });
      await seedFactory.createActivityLog({
        action: "REVIEW_APPROVED",
        createdAt: new Date("2024-01-15"),
      });
      await seedFactory.createActivityLog({
        action: "REVIEW_REJECTED",
        createdAt: new Date("2024-01-31"),
      });
    });

    it("should filter by startDate", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { startDate: "2024-01-15" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: unknown[];
      }>(response, 200);

      expect(data.items).toHaveLength(2);
    });

    it("should filter by endDate", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { endDate: "2024-01-15" },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: unknown[];
      }>(response, 200);

      expect(data.items).toHaveLength(2);
    });

    it("should filter by date range", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: {
          startDate: "2024-01-10",
          endDate: "2024-01-20",
        },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: unknown[];
      }>(response, 200);

      expect(data.items).toHaveLength(1);
    });
  });

  describe("Sorting", () => {
    beforeEach(async () => {
      await seedFactory.createActivityLog({
        action: "USER_LOGIN",
        riskLevel: "LOW",
        createdAt: new Date("2024-01-01"),
      });
      await seedFactory.createActivityLog({
        action: "REVIEW_APPROVED",
        riskLevel: "MEDIUM",
        createdAt: new Date("2024-01-02"),
      });
      await seedFactory.createActivityLog({
        action: "BULK_REJECT",
        riskLevel: "HIGH",
        createdAt: new Date("2024-01-03"),
      });
    });

    it("should sort by createdAt ascending", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: {
          sortBy: "createdAt",
          sortDir: "asc",
        },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ action: string }>;
      }>(response, 200);

      expect(data.items[0].action).toBe("USER_LOGIN");
      expect(data.items[2].action).toBe("BULK_REJECT");
    });

    it("should sort by riskLevel", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: {
          sortBy: "riskLevel",
          sortDir: "desc",
        },
      });
      const response = await GET(request);

      const data = await assertJsonResponse<{
        items: Array<{ riskLevel: string }>;
      }>(response, 200);

      expect(data.items).toHaveLength(3);
    });
  });

  describe("Authorization", () => {
    it("should require ADMIN role", async () => {
      const { requireAuth } = await import("@/server/auth");
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ message: "Forbidden" }, { status: 403 })
      );

      const request = createMockRequest("/api/activity-logs");
      const response = await GET(request);

      await assertErrorResponse(response, 403, "Forbidden");
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for invalid action", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { action: "INVALID_ACTION" },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });

    it("should return 400 for invalid userRole", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { userRole: "INVALID_ROLE" },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });

    it("should return 400 for invalid riskLevel", async () => {
      const request = createMockRequest("/api/activity-logs", {
        searchParams: { riskLevel: "INVALID_LEVEL" },
      });
      const response = await GET(request);

      await assertErrorResponse(response, 400);
    });
  });
});

describe("POST /api/activity-logs", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Log Creation", () => {
    it("should create activity log with required fields", async () => {
      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: {
          action: "REVIEW_APPROVED",
          targetId: "review-123",
        },
      });

      const response = await POST(request);
      const data = await assertJsonResponse<{
        id: string;
        action: string;
        userId: string;
        userName: string;
        userRole: string;
        targetId: string;
        riskLevel: string;
      }>(response, 201);

      expect(data.id).toBeDefined();
      expect(data.action).toBe("REVIEW_APPROVED");
      expect(data.userId).toBe(mockSession.user.id);
      expect(data.userName).toBeDefined();
      expect(data.userRole).toBe("ADMIN");
      expect(data.targetId).toBe("review-123");
      expect(data.riskLevel).toBe("LOW");
    });

    it("should create log with groupId and metadata", async () => {
      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: {
          action: "BULK_REJECT",
          groupId: "bulk-123",
          metadata: {
            count: 5,
            reason: "Quality issues",
          },
        },
      });

      const response = await POST(request);
      const data = await assertJsonResponse<{
        groupId: string | null;
        metadata: Record<string, unknown> | null;
        riskLevel: string;
      }>(response, 201);

      expect(data.groupId).toBe("bulk-123");
      expect(data.metadata).toEqual({
        count: 5,
        reason: "Quality issues",
      });
      expect(data.riskLevel).toBe("HIGH");
    });

    it("should persist log to database", async () => {
      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: {
          action: "STREAM_STARTED",
          targetId: "review-456",
        },
      });

      const response = await POST(request);
      const data = await assertJsonResponse<{ id: string }>(response, 201);

      const prisma = getTestPrisma();
      const log = await prisma.activityLog.findUnique({
        where: { id: data.id },
      });

      expect(log).toBeDefined();
      expect(log?.action).toBe("STREAM_STARTED");
    });

    it("should set appropriate risk levels for different actions", async () => {
      const actions: Array<{
        action: string;
        expectedRisk: "LOW" | "MEDIUM" | "HIGH";
      }> = [
        { action: "USER_LOGIN", expectedRisk: "LOW" },
        { action: "REVIEW_APPROVED", expectedRisk: "LOW" },
        { action: "STREAM_CANCELLED", expectedRisk: "MEDIUM" },
        { action: "BULK_REJECT", expectedRisk: "HIGH" },
      ];

      for (const { action, expectedRisk } of actions) {
        const request = createMockRequest("/api/activity-logs", {
          method: "POST",
          body: { action },
        });

        const response = await POST(request);
        const data = await assertJsonResponse<{ riskLevel: string }>(
          response,
          201
        );

        expect(data.riskLevel).toBe(expectedRisk);
      }
    });
  });

  describe("Validation", () => {
    it("should require action field", async () => {
      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: {},
      });

      const response = await POST(request);
      await assertErrorResponse(response, 400);
    });

    it("should validate action enum", async () => {
      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: {
          action: "INVALID_ACTION",
        },
      });

      const response = await POST(request);
      await assertErrorResponse(response, 400);
    });

    it("should accept null for optional fields", async () => {
      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: {
          action: "USER_LOGIN",
          targetId: null,
          groupId: null,
          metadata: null,
        },
      });

      const response = await POST(request);
      const data = await assertJsonResponse<{
        targetId: null;
        groupId: null;
        metadata: null;
      }>(response, 201);

      expect(data.targetId).toBeNull();
      expect(data.groupId).toBeNull();
      expect(data.metadata).toBeUndefined();
    });
  });

  describe("Authorization", () => {
    it("should require authentication", async () => {
      const { requireAuth } = await import("@/server/auth");
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      );

      const request = createMockRequest("/api/activity-logs", {
        method: "POST",
        body: { action: "USER_LOGIN" },
      });

      const response = await POST(request);
      await assertErrorResponse(response, 401, "Unauthorized");
    });
  });
});

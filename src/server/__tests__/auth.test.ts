import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth, getSession } from "../auth";
import { NextResponse } from "next/server";
import { ROLES } from "@/shared/constants/roles";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/features/auth/auth", () => ({
  authOptions: {},
}));

describe("Auth Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSession", () => {
    it("should call getServerSession with authOptions", async () => {
      const { getServerSession } = await import("next-auth");
      const mockSession = {
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: ROLES.REVIEWER,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

      const session = await getSession();

      expect(getServerSession).toHaveBeenCalledTimes(1);
      expect(session).toEqual(mockSession);
    });

    it("should return null when no session exists", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe("requireAuth", () => {
    describe("Authentication", () => {
      it("should return session when user is authenticated", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: {
            id: "user-1",
            email: "test@example.com",
            name: "Test User",
            role: ROLES.REVIEWER,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth();

        expect(result).toEqual(mockSession);
        expect(result).not.toBeInstanceOf(NextResponse);
      });

      it("should return 401 when no session exists", async () => {
        const { getServerSession } = await import("next-auth");
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const result = await requireAuth();

        expect(result).toBeInstanceOf(NextResponse);
        if (result instanceof NextResponse) {
          expect(result.status).toBe(401);
          const body = await result.json();
          expect(body.message).toBe("Unauthorized");
        }
      });

      it("should return 401 when session has no user", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: null,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        } as any;

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth();

        expect(result).toBeInstanceOf(NextResponse);
        if (result instanceof NextResponse) {
          expect(result.status).toBe(401);
        }
      });
    });

    describe("Authorization", () => {
      it("should allow access when user has required role", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: {
            id: "admin-1",
            email: "admin@example.com",
            name: "Admin User",
            role: ROLES.ADMIN,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth([ROLES.ADMIN]);

        expect(result).toEqual(mockSession);
        expect(result).not.toBeInstanceOf(NextResponse);
      });

      it("should return 403 when user lacks required role", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: {
            id: "reviewer-1",
            email: "reviewer@example.com",
            name: "Reviewer User",
            role: ROLES.REVIEWER,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth([ROLES.ADMIN]);

        expect(result).toBeInstanceOf(NextResponse);
        if (result instanceof NextResponse) {
          expect(result.status).toBe(403);
          const body = await result.json();
          expect(body.message).toBe("Forbidden");
        }
      });

      it("should allow access when user has one of multiple allowed roles", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: {
            id: "reviewer-1",
            email: "reviewer@example.com",
            name: "Reviewer User",
            role: ROLES.REVIEWER,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth([ROLES.ADMIN, ROLES.REVIEWER]);

        expect(result).toEqual(mockSession);
      });

      it("should allow access when no roles are specified", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: {
            id: "user-1",
            email: "user@example.com",
            name: "Any User",
            role: ROLES.REVIEWER,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth();

        expect(result).toEqual(mockSession);
      });

      it("should allow access when empty roles array is provided", async () => {
        const { getServerSession } = await import("next-auth");
        const mockSession = {
          user: {
            id: "user-1",
            email: "user@example.com",
            name: "Any User",
            role: ROLES.REVIEWER,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

        const result = await requireAuth([]);

        expect(result).toEqual(mockSession);
        expect(result).not.toBeInstanceOf(NextResponse);
      });
    });

    describe("Edge Cases", () => {
      it("should prioritize authentication over authorization", async () => {
        const { getServerSession } = await import("next-auth");
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const result = await requireAuth([ROLES.ADMIN]);

        expect(result).toBeInstanceOf(NextResponse);
        if (result instanceof NextResponse) {
          expect(result.status).toBe(401);
        }
      });

      it("should handle ADMIN-only routes correctly", async () => {
        const { getServerSession } = await import("next-auth");

        const adminSession = {
          user: {
            id: "admin-1",
            email: "admin@example.com",
            name: "Admin",
            role: ROLES.ADMIN,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(adminSession);
        const adminResult = await requireAuth([ROLES.ADMIN]);
        expect(adminResult).toEqual(adminSession);

        const reviewerSession = {
          user: {
            id: "reviewer-1",
            email: "reviewer@example.com",
            name: "Reviewer",
            role: ROLES.REVIEWER,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        vi.mocked(getServerSession).mockResolvedValueOnce(reviewerSession);
        const reviewerResult = await requireAuth([ROLES.ADMIN]);
        expect(reviewerResult).toBeInstanceOf(NextResponse);
        if (reviewerResult instanceof NextResponse) {
          expect(reviewerResult.status).toBe(403);
        }
      });

      it("should handle ANY authenticated user routes correctly", async () => {
        const { getServerSession } = await import("next-auth");

        const sessions = [
          {
            user: {
              id: "admin-1",
              email: "admin@example.com",
              name: "Admin",
              role: ROLES.ADMIN,
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            user: {
              id: "reviewer-1",
              email: "reviewer@example.com",
              name: "Reviewer",
              role: ROLES.REVIEWER,
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

        for (const session of sessions) {
          vi.mocked(getServerSession).mockResolvedValueOnce(session);
          const result = await requireAuth();
          expect(result).toEqual(session);
        }
      });
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils/render";
import React from "react";
import { useSession } from "next-auth/react";
import InsightsPage from "@app/insights/page";
import {
  mockReviewerSession,
  mockAdminSession,
} from "@/test/utils/mockSession";

describe("routeProtection", () => {
  it("reviewer cannot access admin routes", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockReviewerSession,
      status: "authenticated",
    } as any);

    render(<InsightsPage />, { session: mockReviewerSession });

    await waitFor(() => {
      const heading = screen.queryByRole("heading", { name: /insights/i });
      expect(heading).toBeNull();
    });
  });

  it("unauthenticated user is redirected to login", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
    } as any);

    render(<InsightsPage />, { session: null });

    await waitFor(() => {
      const heading = screen.queryByRole("heading", { name: /insights/i });
      expect(heading).toBeNull();
    });
  });

  it("admin can access admin routes", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockAdminSession,
      status: "authenticated",
    } as any);

    render(<InsightsPage />, { session: mockAdminSession });

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: /insights/i })
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

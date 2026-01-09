import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@/test/utils/render";
import { useSession } from "next-auth/react";
import InsightsPage from "@app/insights/page";
import {
  mockReviewerSession,
  mockAdminSession,
} from "@/test/utils/mockSession";

describe("roleAccess", () => {
  afterEach(() => {
    cleanup();
  });

  it("reviewer is blocked from insights", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockReviewerSession,
      status: "authenticated",
    } as any);

    const { container } = render(<InsightsPage />, {
      session: mockReviewerSession,
    });

    const forbiddenHeadings = container.querySelectorAll("h1");
    const forbidden403 = Array.from(forbiddenHeadings).find(
      (h1) => h1.textContent === "403"
    );
    expect(forbidden403).toBeInTheDocument();

    const forbiddenTexts = screen.getAllByText(/access forbidden/i);
    expect(forbiddenTexts.length).toBeGreaterThan(0);
  });

  it("admin can access insights", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockAdminSession,
      status: "authenticated",
    } as any);

    render(<InsightsPage />, { session: mockAdminSession });

    expect(
      await screen.findByRole("heading", { name: /insights/i })
    ).toBeInTheDocument();
  });
});

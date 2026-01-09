import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils/render";
import React from "react";
import ReviewDetailPage from "@app/review/[id]/page";
import { server } from "@/test/msw/server";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/shared/constants";
import { mockAdminSession } from "@/test/utils/mockSession";
import { useSession } from "next-auth/react";
import userEvent from "@testing-library/user-event";
import * as nextNavigation from "next/navigation";

describe("approveReject", () => {
  const testItem = {
    id: "item-1",
    prompt: "What are the SOLID principles",
    modelOutput: "SOLID principles are...",
    status: "PENDING" as const,
    priority: "medium" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewedAt: null,
    feedback: null,
  };

  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({
      data: mockAdminSession,
      status: "authenticated",
    } as any);

    vi.mocked(nextNavigation.useParams).mockReturnValue({ id: "item-1" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("approve/reject -> cache invalidation", async () => {
    const user = userEvent.setup();
    let patchCalled = false;

    server.use(
      http.get(`${API_BASE_URL}/review-items/item-1`, () => {
        return HttpResponse.json(testItem);
      }),
      http.patch(`${API_BASE_URL}/review-items/item-1`, async ({ request }) => {
        patchCalled = true;
        const body = (await request.json()) as any;
        return HttpResponse.json({
          ...testItem,
          ...body,
          status: "APPROVED",
          reviewedAt: new Date().toISOString(),
        });
      })
    );

    render(<ReviewDetailPage />, { session: mockAdminSession });

    await waitFor(
      () => {
        expect(
          screen.getByText("What are the SOLID principles")
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    await waitFor(
      () => {
        expect(patchCalled).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});

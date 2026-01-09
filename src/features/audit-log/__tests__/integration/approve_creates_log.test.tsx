import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@/test/utils/render";
import React from "react";
import { useReviewDecision } from "@/features/review/detail/hooks/useReviewDecision";
import { server } from "@/test/msw/server";
import { http, HttpResponse } from "msw";
import { mockAdminSession } from "@/test/utils/mockSession";
import { API_BASE_URL } from "@/shared/constants";
import userEvent from "@testing-library/user-event";

const TestComponent = ({ itemId }: { itemId: string }) => {
  const { mutate } = useReviewDecision(itemId);
  return (
    <button onClick={() => mutate({ status: "APPROVED" })}>Approve</button>
  );
};

describe("approve_creates_log", () => {
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });

  it(
    "Trigger approve mutation and assert log entry is created",
    { timeout: 10000 },
    async () => {
      const user = userEvent.setup();
      let resolveLog!: (v: any) => void;
      const logPromise = new Promise<any>((res) => (resolveLog = res));

      server.use(
        http.patch(
          `${API_BASE_URL}/review-items/item-1`,
          async ({ request }) => {
            const body = (await request.json()) as any;
            return HttpResponse.json({ id: "item-1", ...body });
          }
        ),
        http.post(`${API_BASE_URL}/activity-logs`, async ({ request }) => {
          const body = await request.json();
          resolveLog(body);
          return HttpResponse.json({ id: "new-log-id" });
        })
      );

      const { container } = render(<TestComponent itemId="item-1" />, {
        session: mockAdminSession,
      });

      const approveButton =
        container.querySelector("button[onclick]") ||
        container.querySelector("button");
      if (!approveButton) throw new Error("Approve button not found");

      await user.click(approveButton as HTMLElement);

      const logBody = (await Promise.race([
        logPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Log creation timeout")), 10000)
        ),
      ])) as any;

      expect(logBody.action).toBe("REVIEW_APPROVED");
      expect(logBody.targetId).toBe("item-1");
    }
  );
});

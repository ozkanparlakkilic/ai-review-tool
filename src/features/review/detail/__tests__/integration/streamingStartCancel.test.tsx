import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@/test/utils/render";
import React from "react";
import { OutputPanel } from "@/features/review/detail/components/output-panel";
import { server } from "@/test/msw/server";
import { http, HttpResponse } from "msw";
import { mockAdminSession } from "@/test/utils/mockSession";
import { useSession } from "next-auth/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", async () => {
  const actual = await vi.importActual("next-auth/react");
  return {
    ...actual,
    useSession: vi.fn(),
  };
});

vi.mock("@/features/audit-log/services/activity-log", () => ({
  activityLogService: {
    createLog: vi.fn().mockResolvedValue({}),
  },
}));

describe("streamingStartCancel", () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({
      data: mockAdminSession,
      status: "authenticated",
    } as any);
  });

  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });

  it("stream start/cancel + partial output", async () => {
    const user = userEvent.setup();
    const chunks = ["Hello", " World", "!", " This", " is", " streaming"];

    server.use(
      http.get("/api/review-items/item-1/stream", () => {
        return HttpResponse.json({
          chunks,
          delayMs: 10,
        });
      })
    );

    const { container } = render(
      <OutputPanel output="Initial output" itemId="item-1" />,
      {
        session: mockAdminSession,
      }
    );

    const streamButton = await waitFor(
      () => {
        const buttons = container.querySelectorAll("button");
        const streamBtn = Array.from(buttons).find(
          (btn) =>
            btn.textContent?.includes("Stream Output") ||
            btn.textContent?.includes("▶")
        );
        if (!streamBtn) throw new Error("Stream button not found");
        return streamBtn as HTMLElement;
      },
      { timeout: 5000 }
    );

    await user.click(streamButton);

    await waitFor(
      () => {
        expect(screen.getByText(/streaming/i)).toBeInTheDocument();
        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(
      () => {
        expect(screen.queryByRole("button", { name: /cancel/i })).toBeNull();
      },
      { timeout: 3000 }
    );
  });
});

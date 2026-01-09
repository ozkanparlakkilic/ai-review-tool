import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils/render";
import React from "react";
import { useSession } from "next-auth/react";
import AuditLogPage from "@app/audit-log/page";
import { mockAdminSession } from "@/test/utils/mockSession";
import userEvent from "@testing-library/user-event";
import { server } from "@/test/msw/server";

describe("csv_export_contains_filtered_data", () => {
  let createElementSpy: any;
  let clickSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;

  beforeEach(() => {
    clickSpy = vi.fn();

    const originalCreateElement = document.createElement.bind(document);

    createElementSpy = vi.spyOn(document, "createElement");
    appendChildSpy = vi.spyOn(document.body, "appendChild");
    removeChildSpy = vi.spyOn(document.body, "removeChild");

    createElementSpy.mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        const originalClick = element.click.bind(element);
        element.click = () => {
          clickSpy();
          originalClick();
        };
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.resetHandlers();
  });

  it("Apply filter and click export button", async () => {
    const user = userEvent.setup();

    vi.mocked(useSession).mockReturnValue({
      data: mockAdminSession,
      status: "authenticated",
    } as any);

    render(<AuditLogPage />, { session: mockAdminSession });

    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).toBeNull();
      },
      { timeout: 3000 }
    );

    const exportButton = await waitFor(
      () => {
        return screen.getByRole("button", { name: /export csv/i });
      },
      { timeout: 3000 }
    );

    await user.click(exportButton);

    await waitFor(
      () => {
        expect(clickSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});

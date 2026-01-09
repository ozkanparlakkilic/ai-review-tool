import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@/test/utils/render";
import React from "react";
import AuditLogPage from "@app/audit-log/page";
import { mockReviewerSession } from "@/test/utils/mockSession";
import { AppShell } from "@/shared/components/app-shell";

describe("reviewer_blocked_from_audit_log", () => {
  afterEach(() => {
    cleanup();
  });

  it("Simulate reviewer session and assert access is blocked", async () => {
    render(<AuditLogPage />, { session: mockReviewerSession });

    await waitFor(() => {
      const heading = screen.queryByRole("heading", { name: /^audit log$/i });
      expect(heading).toBeNull();
    });
  });

  it("Assert nav link is hidden for reviewer", async () => {
    render(<AppShell>Content</AppShell>, { session: mockReviewerSession });

    const auditLogLinks = screen.queryAllByRole("link", {
      name: /^audit log$/i,
    });
    expect(auditLogLinks.length).toBe(0);

    const insightsLinks = screen.queryAllByRole("link", {
      name: /^insights$/i,
    });
    expect(insightsLinks.length).toBe(0);
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@/test/utils/render";
import React from "react";
import { useBulkDecision } from "@/features/review/queue/hooks/useBulkDecision";
import { server } from "@/test/msw/server";
import { http, HttpResponse } from "msw";
import { mockAdminSession } from "@/test/utils/mockSession";
import { API_BASE_URL } from "@/shared/constants";
import userEvent from "@testing-library/user-event";
import { DataTableBulkActions } from "@/components/ui/data-table/bulk-actions";
import type { CreateActivityLogDto } from "@/features/audit-log/services/activity-log";

const TestComponent = ({ ids }: { ids: string[] }) => {
  const { mutate } = useBulkDecision();
  const mockTable = {
    getFilteredSelectedRowModel: () => ({
      rows: ids.map((id) => ({ original: { id } })),
    }),
    resetRowSelection: vi.fn(),
  };

  return (
    <DataTableBulkActions table={mockTable as any} entityName="Review">
      <button
        onClick={() =>
          mutate({ ids, status: "REJECTED", feedback: "Bulk reject" })
        }
      >
        Reject Selected
      </button>
    </DataTableBulkActions>
  );
};

describe("bulk_reject_creates_grouped_logs", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it("Perform bulk reject and assert grouped logs exist", async () => {
    const user = userEvent.setup();
    const logs: CreateActivityLogDto[] = [];
    let resolveLog!: (v: CreateActivityLogDto) => void;
    const logPromise = new Promise<CreateActivityLogDto>(
      (res) => (resolveLog = res)
    );

    server.use(
      http.post(`${API_BASE_URL}/activity-logs`, async ({ request }) => {
        const body = (await request.json()) as CreateActivityLogDto;
        if (!body) {
          return HttpResponse.json({ error: "Invalid body" }, { status: 400 });
        }
        logs.push(body);
        if (body.action === "BULK_REJECT") {
          resolveLog(body);
        }
        return HttpResponse.json({ id: "log-" + logs.length });
      })
    );

    render(<TestComponent ids={["item-1", "item-2"]} />, {
      session: mockAdminSession,
    });

    const trigger = screen.getByRole("button", { name: /reject selected/i });
    await user.click(trigger);

    const bulkLog = await logPromise;

    expect(bulkLog).toBeDefined();
    expect(bulkLog.action).toBe("BULK_REJECT");
    expect(bulkLog.metadata).toBeDefined();
    expect(bulkLog.metadata?.count).toBe(2);
    expect(bulkLog.metadata?.ids).toEqual(["item-1", "item-2"]);
  });
});

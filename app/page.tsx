"use client";

import { useEffect } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { ReviewItem, ReviewStatus } from "@/shared/types";
import { useReviewQueue } from "@/features/review/queue/hooks/useReviewQueue";
import { useCreateBulkDecisionMutation } from "@/features/review/queue/hooks/useCreateBulkDecisionMutation";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/features/review/queue/components/columns";
import { priorities, statuses } from "@/features/review/queue/constants";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ActivityAction } from "@/shared/types/activity-log";
import { activityLogService } from "@/features/audit-log/services/activity-log";

export default function HomePage() {
  const {
    items,
    meta,
    loading,
    error,
    status,
    setStatus,
    priority,
    setPriority,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting,
    pagination,
    setPagination,
  } = useReviewQueue();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const createBulkDecisionMutation = useCreateBulkDecisionMutation({
    options: {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["review-items"] });
        queryClient.invalidateQueries({ queryKey: ["metrics"] });
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      },
      onSuccess: (_data, variables) => {
        toast.success(
          variables.status === "APPROVED"
            ? "Items approved successfully"
            : "Items rejected successfully"
        );
        activityLogService
          .createLog({
            action:
              variables.status === "APPROVED"
                ? ActivityAction.BULK_APPROVE
                : ActivityAction.BULK_REJECT,
            metadata: {
              count: variables.ids.length,
              ids: variables.ids,
              feedback: variables.feedback,
            },
          })
          .catch((error) => {
            console.error("Failed to create activity log:", error);
          });
      },
      onError: () => {
        toast.error("Failed to create bulk decision. Please try again.");
      },
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load review items. Please try again."
      );
    }
  }, [error]);

  const handleApprove = (ids: string[]) => {
    createBulkDecisionMutation.mutate({ ids, status: "APPROVED" });
  };

  const handleReject = (ids: string[]) => {
    createBulkDecisionMutation.mutate({ ids, status: "REJECTED" });
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Review Queue</h2>
            <p className="text-muted-foreground mt-1">
              Review and validate AI-generated content
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={items}
          meta={meta}
          searchKey="prompt"
          searchPlaceholder="Filter prompts..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[
            {
              columnId: "status",
              title: "Status",
              options: statuses,
              value: status.length > 0 ? status.join(",") : undefined,
              onChange: (value) => {
                if (!value) {
                  setStatus([]);
                } else {
                  const statusArray = value
                    .split(",")
                    .filter(Boolean) as ReviewStatus[];
                  setStatus(statusArray);
                }
              },
              multiple: true,
            },
            {
              columnId: "priority",
              title: "Priority",
              options: priorities,
              value: priority.length > 0 ? priority.join(",") : undefined,
              onChange: (value) => {
                if (!value) {
                  setPriority([]);
                } else {
                  const priorityArray = value
                    .split(",")
                    .filter(Boolean) as Array<
                    "low" | "medium" | "high" | "critical"
                  >;
                  setPriority(priorityArray);
                }
              },
              multiple: true,
            },
          ]}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          renderBulkActions={
            isAdmin
              ? (table) => (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const ids = table
                          .getFilteredSelectedRowModel()
                          .rows.map((r) => (r.original as ReviewItem).id);
                        handleReject(ids);
                        table.resetRowSelection();
                      }}
                      disabled={createBulkDecisionMutation.isPending}
                    >
                      Reject Selected
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const ids = table
                          .getFilteredSelectedRowModel()
                          .rows.map((r) => (r.original as ReviewItem).id);
                        handleApprove(ids);
                        table.resetRowSelection();
                      }}
                      disabled={createBulkDecisionMutation.isPending}
                    >
                      Approve Selected
                    </Button>
                  </>
                )
              : undefined
          }
          enableRowSelection={(row) =>
            (row.original as ReviewItem).status === "PENDING"
          }
          isLoading={loading}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

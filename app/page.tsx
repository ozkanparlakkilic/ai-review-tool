"use client";

import { AppShell } from "@/shared/components/app-shell";
import { ReviewItem } from "@/shared/types";
import { useReviewQueue } from "@/features/review/queue/hooks/useReviewQueue";
import { useBulkDecision } from "@/features/review/queue/hooks/useBulkDecision";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/features/review/queue/components/columns";
import { priorities, statuses } from "@/features/review/queue/constants";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function HomePage() {
  const { items, loading, error } = useReviewQueue();
  const { isAdmin } = useAuth();
  const mutation = useBulkDecision();

  const handleApprove = (ids: string[]) => {
    mutation.mutate({ ids, status: "APPROVED" });
  };

  const handleReject = (ids: string[]) => {
    mutation.mutate({ ids, status: "REJECTED" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">Error Loading Queue</h2>
          <p className="text-muted-foreground">
            Failed to load review items. Please try again.
          </p>
        </div>
      </AppShell>
    );
  }

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
          searchKey="prompt"
          searchPlaceholder="Filter prompts..."
          filters={[
            {
              columnId: "status",
              title: "Status",
              options: statuses,
            },
            {
              columnId: "priority",
              title: "Priority",
              options: priorities,
            },
          ]}
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
                      disabled={mutation.isPending}
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
                      disabled={mutation.isPending}
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
        />
      </AppShell>
    </ProtectedRoute>
  );
}

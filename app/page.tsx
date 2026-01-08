"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { EmptyState } from "@/shared/components/empty-state";
import { QueueHeader } from "@/features/review/queue/components/queue-header";
import { StatusFilter } from "@/features/review/queue/components/status-filter";
import { ReviewTable } from "@/features/review/queue/components/review-table";
import { BulkActionBar } from "@/features/review/queue/components/bulk-action-bar";
import { ConfirmBulkDialog } from "@/features/review/queue/components/confirm-bulk-dialog";
import { RejectReasonDialog } from "@/features/review/queue/components/reject-reason-dialog";
import { Input } from "@/components/ui/input";
import { useReviewQueue } from "@/features/review/queue/hooks/useReviewQueue";
import { useRowSelection } from "@/features/review/queue/hooks/useRowSelection";
import { useBulkDecision } from "@/features/review/queue/hooks/useBulkDecision";
import { toast } from "sonner";

export default function HomePage() {
  const {
    items,
    loading,
    error,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
  } = useReviewQueue();

  const {
    selectedIds,
    selectedCount,
    toggleRow,
    toggleAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useRowSelection();

  const mutation = useBulkDecision();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject";
  }>({ open: false, action: "approve" });

  const [rejectDialog, setRejectDialog] = useState(false);

  useEffect(() => {
    clearSelection();
  }, [status, searchQuery, clearSelection]);

  const handleApprove = () => {
    setConfirmDialog({ open: true, action: "approve" });
  };

  const handleReject = () => {
    setRejectDialog(true);
  };

  const handleConfirmApprove = async () => {
    try {
      const ids = Array.from(selectedIds);
      const result = await mutation.mutateAsync({
        ids,
        status: "APPROVED",
      });

      toast.success(`Approved ${result.updated.length} items`);
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} items failed`);
      }
      clearSelection();
      setConfirmDialog({ open: false, action: "approve" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to approve items"
      );
    }
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      const ids = Array.from(selectedIds);
      const result = await mutation.mutateAsync({
        ids,
        status: "REJECTED",
        feedback: reason,
      });

      toast.success(`Rejected ${result.updated.length} items`);
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} items failed`);
      }
      clearSelection();
      setRejectDialog(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject items"
      );
    }
  };

  const itemIds = items.map((item) => item.id);
  const allSelected = isAllSelected(itemIds);
  const someSelected = isSomeSelected(itemIds);

  return (
    <AppShell>
      <QueueHeader />

      <div className="mb-6 flex flex-col gap-4">
        <StatusFilter value={status} onChange={setStatus} />
        <Input
          placeholder="Search prompts…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <BulkActionBar
        selectedCount={selectedCount}
        onApprove={handleApprove}
        onReject={handleReject}
        onClear={clearSelection}
        disabled={mutation.isPending}
      />

      {loading && (
        <div className="text-muted-foreground py-12 text-center">
          Loading...
        </div>
      )}

      {error && (
        <div className="text-destructive py-12 text-center">
          Error: {error.message}
        </div>
      )}

      {!loading && !error && items.length === 0 && <EmptyState />}

      {!loading && !error && items.length > 0 && (
        <ReviewTable
          items={items}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={(checked) => toggleAll(itemIds, checked)}
          isAllSelected={allSelected}
          isSomeSelected={someSelected}
        />
      )}

      <ConfirmBulkDialog
        open={confirmDialog.open && confirmDialog.action === "approve"}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        action="approve"
        count={selectedCount}
        onConfirm={handleConfirmApprove}
      />

      <RejectReasonDialog
        open={rejectDialog}
        onOpenChange={setRejectDialog}
        count={selectedCount}
        onConfirm={handleConfirmReject}
      />
    </AppShell>
  );
}

"use client";

import React from "react";
import { AppShell } from "@/shared/components/app-shell";
import { EmptyState } from "@/shared/components/empty-state";
import { QueueHeader } from "@/features/review/queue/components/queue-header";
import { StatusFilter } from "@/features/review/queue/components/status-filter";
import { ReviewTable } from "@/features/review/queue/components/review-table";
import { Input } from "@/components/ui/input";
import { useReviewQueue } from "@/features/review/queue/hooks/useReviewQueue";

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

      {!loading && !error && items.length > 0 && <ReviewTable items={items} />}
    </AppShell>
  );
}

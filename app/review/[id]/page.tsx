"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { useReviewDetail } from "@/features/review/detail/hooks/useReviewDetail";
import { useReviewDecision } from "@/features/review/detail/hooks/useReviewDecision";
import { ReviewHeader } from "@/features/review/detail/components/review-header";
import { PromptPanel } from "@/features/review/detail/components/prompt-panel";
import { OutputPanel } from "@/features/review/detail/components/output-panel";
import { DecisionBar } from "@/features/review/detail/components/decision-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReviewStatus } from "@/shared/types";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { item, loading, error } = useReviewDetail(id);
  const mutation = useReviewDecision(id);

  const handleUpdate = async (
    status: ReviewStatus,
    feedback?: string | null
  ) => {
    await mutation.mutateAsync({ status, feedback });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </AppShell>
    );
  }

  if (error || !item) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <div className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">
              {error ? "Error Loading Review" : "Review Not Found"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error
                ? error.message
                : "The review item you're looking for doesn't exist."}
            </p>
            <Button variant="outline" onClick={() => router.push("/")}>
              ← Back to Queue
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <ReviewHeader status={item.status} />

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <PromptPanel prompt={item.prompt} />
          <OutputPanel output={item.modelOutput} />
        </div>

        <DecisionBar
          currentStatus={item.status}
          currentFeedback={item.feedback}
          onUpdate={handleUpdate}
          saving={mutation.isPending}
        />
      </div>
    </AppShell>
  );
}

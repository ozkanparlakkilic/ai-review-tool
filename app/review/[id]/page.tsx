"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { useReviewDetail } from "@/features/review/detail/hooks/useReviewDetail";
import { useCreateReviewDecisionMutation } from "@/features/review/detail/hooks/useCreateReviewDecisionMutation";
import { useQueryClient } from "@tanstack/react-query";
import { PromptPanel } from "@/features/review/detail/components/prompt-panel";
import { OutputPanel } from "@/features/review/detail/components/output-panel";
import { DecisionBar } from "@/features/review/detail/components/decision-bar";
import { StatusBadge } from "@/shared/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReviewStatus } from "@/shared/types";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { toast } from "sonner";
import { activityLogService } from "@/features/audit-log/services/activity-log";
import { ActivityAction } from "@/shared/types/activity-log";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { item, loading, error } = useReviewDetail(id);
  const queryClient = useQueryClient();

  const mutation = useCreateReviewDecisionMutation({
    options: {
      onError: () => {
        toast.error("Failed to update review. Please try again.");
      },

      onSuccess: (_, variables) => {
        const message =
          variables.status === "APPROVED"
            ? "Review approved successfully"
            : "Review rejected successfully";
        toast.success(message);

        activityLogService
          .createLog({
            action:
              variables.status === "APPROVED"
                ? ActivityAction.REVIEW_APPROVED
                : ActivityAction.REVIEW_REJECTED,
            targetId: variables.id,
            metadata: {
              feedback: variables.feedback,
            },
          })
          .catch((error) => {
            console.error("Failed to create activity log:", error);
          });
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["review-items"] });
        queryClient.invalidateQueries({ queryKey: ["metrics"] });
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      },
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load review item. Please try again."
      );
    }
  }, [error]);

  const handleUpdate = async (
    status: ReviewStatus,
    feedback?: string | null
  ) => {
    await mutation.mutateAsync({ id, status, feedback });
  };

  const hasError = !!error || (!loading && !item);
  const displayStatus = item?.status || "PENDING";
  const displayPrompt = item?.prompt || "";
  const displayOutput = item?.modelOutput || "";

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                ← Back to Queue
              </Button>
              <h1 className="text-2xl font-bold">Review Item</h1>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <StatusBadge status={displayStatus as ReviewStatus} />
            )}
          </div>

          {hasError && !loading && (
            <div className="border-destructive/50 bg-destructive/10 mb-6 rounded-lg border p-4">
              <div>
                <h3 className="text-destructive text-sm font-semibold">
                  {error ? "Error Loading Review" : "Review Not Found"}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {error
                    ? "The review item could not be loaded. Some features may be unavailable."
                    : "The review item you're looking for doesn't exist."}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {loading ? (
              <>
                <div className="rounded-lg border p-6">
                  <Skeleton className="mb-2 h-6 w-24" />
                  <Skeleton className="mb-4 h-4 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <div className="rounded-lg border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <Skeleton className="mb-2 h-6 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-64 w-full" />
                </div>
              </>
            ) : (
              <>
                <PromptPanel
                  prompt={displayPrompt || "Unable to load prompt"}
                />
                <OutputPanel
                  output={displayOutput || "Unable to load output"}
                  itemId={id}
                />
              </>
            )}
          </div>

          <DecisionBar
            currentStatus={displayStatus as ReviewStatus}
            currentFeedback={item?.feedback}
            onUpdate={handleUpdate}
            saving={mutation.isPending}
            disabled={hasError || loading}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

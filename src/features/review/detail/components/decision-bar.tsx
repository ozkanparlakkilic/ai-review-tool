import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ReviewStatus } from "@/shared/types";
import { FeedbackForm } from "./feedback-form";
import {
  MIN_FEEDBACK_LENGTH,
  FEEDBACK_REQUIRED_MESSAGE,
  SUCCESS_MESSAGES,
} from "../constants";

interface DecisionBarProps {
  currentStatus: ReviewStatus;
  currentFeedback?: string | null;
  onUpdate: (status: ReviewStatus, feedback?: string | null) => Promise<void>;
  saving: boolean;
  disabled?: boolean;
}

export const DecisionBar = memo(function DecisionBar({
  currentStatus,
  currentFeedback,
  onUpdate,
  saving,
  disabled = false,
}: DecisionBarProps) {
  const [feedback, setFeedback] = useState(currentFeedback || "");
  const [error, setError] = useState("");

  const handleDecision = async (status: ReviewStatus) => {
    setError("");

    if (status === "REJECTED" && feedback.trim().length < MIN_FEEDBACK_LENGTH) {
      setError(FEEDBACK_REQUIRED_MESSAGE);
      return;
    }

    try {
      await onUpdate(status, feedback.trim() || null);
      toast.success(SUCCESS_MESSAGES[status]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update review"
      );
    }
  };

  return (
    <section
      className="bg-card space-y-4 rounded-lg border p-6"
      aria-label="Review decision"
    >
      <FeedbackForm
        value={feedback}
        onChange={(value) => {
          setFeedback(value);
          setError("");
        }}
        error={error}
        disabled={saving || disabled}
      />

      <Separator />

      <div
        className="flex items-center justify-end gap-3"
        role="group"
        aria-label="Review actions"
      >
        <Button
          variant="outline"
          onClick={() => handleDecision("REJECTED")}
          disabled={saving || disabled || currentStatus === "REJECTED"}
          aria-label="Reject this review"
        >
          {saving ? "Saving..." : "Reject"}
        </Button>
        <Button
          onClick={() => handleDecision("APPROVED")}
          disabled={saving || disabled || currentStatus === "APPROVED"}
          aria-label="Approve this review"
        >
          {saving ? "Saving..." : "Approve"}
        </Button>
      </div>
    </section>
  );
});

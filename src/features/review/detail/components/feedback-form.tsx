import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function FeedbackForm({
  value,
  onChange,
  error,
  disabled,
}: FeedbackFormProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="feedback" className="text-sm font-medium">
        Feedback (Optional)
      </label>
      <Textarea
        id="feedback"
        placeholder="Add notes about this review..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className="resize-none"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

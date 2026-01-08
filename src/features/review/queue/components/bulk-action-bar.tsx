import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onClear,
  disabled,
}: BulkActionBarProps) {
  return (
    <div
      className={cn(
        "mb-4 overflow-hidden transition-all duration-300",
        selectedCount > 0 ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="bg-muted flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
          </span>
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-sm underline"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={disabled}
          >
            Reject Selected
          </Button>
          <Button size="sm" onClick={onApprove} disabled={disabled}>
            Approve Selected
          </Button>
        </div>
      </div>
    </div>
  );
}

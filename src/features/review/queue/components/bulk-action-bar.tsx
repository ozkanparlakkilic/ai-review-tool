import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const BulkActionBar = memo(function BulkActionBar({
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
      role="region"
      aria-live="polite"
      aria-label="Bulk actions"
    >
      <div className="bg-muted flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <span className="font-medium" aria-live="polite" aria-atomic="true">
            {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
          </span>
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-sm underline"
            aria-label="Clear selection"
          >
            Clear selection
          </button>
        </div>

        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Bulk review actions"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={disabled}
            aria-label={`Reject ${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}`}
          >
            Reject Selected
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={disabled}
            aria-label={`Approve ${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}`}
          >
            Approve Selected
          </Button>
        </div>
      </div>
    </div>
  );
});

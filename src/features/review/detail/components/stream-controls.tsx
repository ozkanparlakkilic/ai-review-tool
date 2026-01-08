import React from "react";
import { Button } from "@/components/ui/button";

interface StreamControlsProps {
  isStreaming: boolean;
  isComplete: boolean;
  onStart: () => void;
  onCancel: () => void;
  showJumpToLatest: boolean;
  onJumpToLatest: () => void;
}

export function StreamControls({
  isStreaming,
  isComplete,
  onStart,
  onCancel,
  showJumpToLatest,
  onJumpToLatest,
}: StreamControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {!isStreaming && !isComplete && (
        <Button size="sm" variant="outline" onClick={onStart}>
          ▶ Stream Output
        </Button>
      )}

      {isStreaming && (
        <>
          <span className="text-muted-foreground text-sm">Streaming...</span>
          <Button size="sm" variant="destructive" onClick={onCancel}>
            ⏹ Cancel
          </Button>
        </>
      )}

      {isComplete && (
        <span className="text-muted-foreground text-sm">✓ Completed</span>
      )}

      {showJumpToLatest && (
        <Button size="sm" variant="secondary" onClick={onJumpToLatest}>
          ↓ Jump to Latest
        </Button>
      )}
    </div>
  );
}

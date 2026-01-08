import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStreamedOutput } from "../hooks/useStreamedOutput";
import { StreamControls } from "./stream-controls";

interface OutputPanelProps {
  output: string;
  itemId: string;
}

export function OutputPanel({ output, itemId }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const {
    streamedText,
    isStreaming,
    isComplete,
    error: streamError,
    startStreaming,
    cancelStreaming,
  } = useStreamedOutput(itemId);

  const displayText = streamedText || output;

  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 50;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setIsNearBottom(true);
      setShowJumpToLatest(false);
    }
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    requestAnimationFrame(() => {
      if (isNearBottom) {
        scrollToBottom();
      } else {
        setShowJumpToLatest(true);
      }
    });
  }, [streamedText, isStreaming, isNearBottom, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);

    if (nearBottom) {
      setShowJumpToLatest(false);
    }
  }, [checkIfNearBottom]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      toast.success("Output copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy output");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Model Output</CardTitle>
            <CardDescription>AI-generated response</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <StreamControls
              isStreaming={isStreaming}
              isComplete={isComplete}
              onStart={startStreaming}
              onCancel={cancelStreaming}
              showJumpToLatest={showJumpToLatest}
              onJumpToLatest={scrollToBottom}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="bg-muted max-h-[400px] overflow-y-auto rounded-md p-4"
        >
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {displayText}
          </pre>
          {streamError && (
            <p className="text-destructive mt-4 text-sm">
              Error: {streamError.message}
            </p>
          )}
          {isStreaming === false && streamedText && !isComplete && (
            <p className="text-muted-foreground mt-4 text-sm italic">
              Generation cancelled
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

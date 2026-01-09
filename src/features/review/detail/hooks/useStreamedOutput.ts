import { useState, useRef, useCallback, useEffect } from "react";
import { getStreamConfig } from "../services/reviewStreamApi";
import { activityLogService } from "@/features/audit-log/services/activity-log";
import { ActivityAction } from "@/shared/types/activity-log";
import { StreamBuffer } from "../utils/stream-buffer";

export function useStreamedOutput(itemId: string) {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<StreamBuffer>(new StreamBuffer());
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const flushBuffer = useCallback(() => {
    const content = bufferRef.current.flush();
    if (content) {
      setStreamedText((prev) => prev + content);
    }
  }, []);

  const startStreaming = useCallback(async () => {
    setIsStreaming(true);
    setIsComplete(false);
    setError(null);
    setStreamedText("");
    bufferRef.current.flush();

    activityLogService.createLog({
      action: ActivityAction.STREAM_STARTED,
      targetId: itemId,
    });

    abortControllerRef.current = new AbortController();

    flushIntervalRef.current = setInterval(() => {
      flushBuffer();
    }, 100);

    try {
      const config = await getStreamConfig(itemId);
      const { chunks, delayMs } = config;

      for (let i = 0; i < chunks.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        bufferRef.current.append(chunks[i]);

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      flushBuffer();
      setIsComplete(true);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }
      setIsStreaming(false);
    }
  }, [itemId, flushBuffer]);

  const cancelStreaming = useCallback(() => {
    if (isStreaming) {
      activityLogService.createLog({
        action: ActivityAction.STREAM_CANCELLED,
        targetId: itemId,
      });
    }
    abortControllerRef.current?.abort();
    flushBuffer();
    setIsStreaming(false);
  }, [flushBuffer, isStreaming, itemId]);

  const reset = useCallback(() => {
    cancelStreaming();
    setStreamedText("");
    setIsComplete(false);
    setError(null);
  }, [cancelStreaming]);

  useEffect(() => {
    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    streamedText,
    isStreaming,
    isComplete,
    error,
    startStreaming,
    cancelStreaming,
    reset,
  };
}

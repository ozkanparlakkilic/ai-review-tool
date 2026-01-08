import { useState, useRef, useCallback, useEffect } from "react";
import { getStreamConfig } from "../services/reviewStreamApi";

export function useStreamedOutput(itemId: string) {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<string>("");
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const flushBuffer = useCallback(() => {
    if (bufferRef.current) {
      setStreamedText((prev) => prev + bufferRef.current);
      bufferRef.current = "";
    }
  }, []);

  const startStreaming = useCallback(async () => {
    setIsStreaming(true);
    setIsComplete(false);
    setError(null);
    setStreamedText("");
    bufferRef.current = "";

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

        bufferRef.current += chunks[i];

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
    abortControllerRef.current?.abort();
    flushBuffer();
    setIsStreaming(false);
  }, [flushBuffer]);

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

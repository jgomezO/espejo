import { useState, useCallback } from "react";

export function useAIInsight() {
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState(null);

  const callAI = useCallback(async (serviceFn, ...args) => {
    setLoading(true);
    setError(null);
    setStreamingText("");
    try {
      const result = await serviceFn(...args);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const callAIStream = useCallback(async (serviceFn, ...args) => {
    setLoading(true);
    setError(null);
    setStreamingText("");
    try {
      const onChunk = (text) => setStreamingText(text);
      const result = await serviceFn(...args, onChunk);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Backward-compatible wrapper for MirrorSummary
  const fetchInsight = useCallback(async (reflection) => {
    const { generateMirrorSummary } = await import("../services/anthropicService.js");
    return callAI(generateMirrorSummary, reflection);
  }, [callAI]);

  return { loading, streamingText, error, callAI, callAIStream, fetchInsight };
}

import { useCallback, useEffect, useRef, useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

/** Copies text to the clipboard and reports a short-lived status for UI feedback. */
export function useCopy(text: string, resetMs = 1500) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  };

  useEffect(() => clearTimer, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimer();
    timeoutRef.current = window.setTimeout(() => setStatus("idle"), resetMs);
  }, [text, resetMs]);

  return { status, copy };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * One mutation's lifecycle for a form or button: `pending` while it runs (so
 * the control can disable itself and refuse double submits), the error shown
 * next to that control, and a short success status that clears itself.
 */
export function useAction(successMessage?: string) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, message = successMessage): Promise<T | undefined> => {
      if (pending) return undefined;
      setPending(true);
      setError(null);
      setStatus(null);
      try {
        const result = await fn();
        if (message) {
          setStatus(message);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setStatus(null), 3000);
        }
        return result;
      } catch (e) {
        setError(e instanceof Error ? cleanError(e.message) : "Something went wrong. Try again.");
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [pending, successMessage],
  );

  return { run, pending, error, status, setError };
}

/** Convex errors arrive as "[Request ID: …] Server Error\nUncaught Error: <message>". */
function cleanError(message: string): string {
  const uncaught = message.split("\n").find((line) => line.startsWith("Uncaught Error: "));
  return uncaught ? uncaught.replace("Uncaught Error: ", "").split(" at ")[0] : message;
}

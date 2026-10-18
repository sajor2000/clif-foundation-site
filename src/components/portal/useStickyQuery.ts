"use client";

import { useQuery } from "convex/react";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";
import { useState } from "react";

/**
 * useQuery that keeps showing the last result while new arguments load, so
 * typing in a filter or year field doesn't blank the page. `stale` is true
 * while the shown data belongs to the previous arguments.
 */
export function useStickyQuery<Q extends FunctionReference<"query">>(
  query: Q,
  args: FunctionArgs<Q> | "skip",
): { data: FunctionReturnType<Q> | undefined; stale: boolean } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const current = useQuery(query, args as any) as FunctionReturnType<Q> | undefined;
  // React's "storing information from previous renders" pattern.
  const [last, setLast] = useState<FunctionReturnType<Q> | undefined>(undefined);
  if (current !== undefined && current !== last) setLast(current);
  return { data: current ?? last, stale: current === undefined && last !== undefined };
}

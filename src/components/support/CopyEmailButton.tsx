"use client";

import { useEffect, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/content";

type CopyState = "idle" | "copied" | "failed";

const LABELS: Record<CopyState, string> = {
  idle: "Copy email address",
  copied: "Copied",
  failed: "Copy failed",
};

const ANNOUNCEMENTS: Record<CopyState, string> = {
  idle: "",
  copied: "Email address copied",
  failed: "Copy failed, select the address instead",
};

const STATES = Object.keys(LABELS) as CopyState[];

export function CopyEmailButton() {
  // `n` counts copies, so a repeat click restarts the reset window.
  const [copy, setCopy] = useState<{ state: CopyState; n: number }>({
    state: "idle",
    n: 0,
  });

  // The reset lives in an effect, not the click handler: its cleanup owns the
  // timer, and it re-arms when a hidden (Activity) page is shown again.
  useEffect(() => {
    if (copy.state === "idle") return;
    const reset = window.setTimeout(
      () => setCopy((c) => (c.n === copy.n ? { state: "idle", n: c.n } : c)),
      1800,
    );
    return () => window.clearTimeout(reset);
  }, [copy]);

  async function onCopy() {
    let next: CopyState = "copied";
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      next = "failed";
    }
    setCopy((c) => ({ state: next, n: c.n + 1 }));
  }

  return (
    <>
      {/* Every label sits in one grid cell, so the width never changes. */}
      <button
        type="button"
        aria-label="Copy email address"
        onClick={onCopy}
        className="copy-btn"
      >
        {STATES.map((key) => (
          <span
            key={key}
            aria-hidden="true"
            className="copy-btn__label"
            data-active={key === copy.state}
          >
            {LABELS[key]}
          </span>
        ))}
      </button>
      <span role="status" className="sr-only copy-btn-status">
        {ANNOUNCEMENTS[copy.state]}
      </span>
    </>
  );
}

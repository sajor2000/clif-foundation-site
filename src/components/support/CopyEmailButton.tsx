"use client";

import { useEffect, useRef, useState } from "react";
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

export function CopyEmailButton() {
  const [state, setState] = useState<CopyState>("idle");
  const reset = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(reset.current), []);

  async function onCopy() {
    window.clearTimeout(reset.current);
    let next: CopyState = "copied";
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      next = "failed";
    }
    setState(next);
    reset.current = window.setTimeout(() => setState("idle"), 1800);
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
        {(Object.keys(LABELS) as CopyState[]).map((key) => (
          <span
            key={key}
            aria-hidden="true"
            className="copy-btn__label"
            data-active={key === state}
          >
            {LABELS[key]}
          </span>
        ))}
      </button>
      <span role="status" className="sr-only copy-btn-status">
        {ANNOUNCEMENTS[state]}
      </span>
    </>
  );
}

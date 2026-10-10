"use client";

import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/content";

export function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(CONTACT_EMAIL);
        } catch {
          /* ignore */
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
      style={{
        minHeight: 48,
        padding: "0 18px",
        borderRadius: 3,
        border: "1px solid var(--border-strong)",
        background: "transparent",
        font: "500 15px var(--font-sans)",
        color: "var(--text-primary)",
        cursor: "pointer",
      }}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy address"}</span>
    </button>
  );
}

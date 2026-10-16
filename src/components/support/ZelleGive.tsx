"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { CONTACT_EMAIL, ZELLE_RECIPIENT } from "@/lib/content";

const GIFT_NOTICE_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Zelle gift notice")}&body=${encodeURIComponent(`I sent a Zelle gift to ${ZELLE_RECIPIENT}.\n\nAmount:\nDate:\nName:\nNotes:\n`)}`;

export function ZelleGive() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const scheduleReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div
      style={{
        border: "1px solid var(--border-strong)",
        borderRadius: 6,
        background: "var(--bg-figure)",
        padding: "28px 24px",
        display: "grid",
        gap: 16,
        maxWidth: 560,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "-0.01em",
          }}
        >
          Give by Zelle
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--text-body)",
          }}
        >
          Send a gift from your bank&apos;s Zelle app or website. Use this
          recipient email exactly. Zelle transfers are final; for larger gifts,
          email us first.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          padding: "16px 18px",
          border: "1px solid var(--border)",
          borderRadius: 4,
          background: "var(--bg-page)",
        }}
      >
        <span
          className="eyebrow"
          style={{ fontSize: 11, color: "var(--text-muted)" }}
        >
          Zelle recipient
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            fontWeight: 500,
            wordBreak: "break-all",
            userSelect: "all",
          }}
        >
          {ZELLE_RECIPIENT}
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--text-muted)",
          }}
        >
          Before you send, confirm the name shown in your bank&apos;s Zelle
          screen is CLIF Foundation. If it is not, cancel the transfer.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(ZELLE_RECIPIENT);
              setCopyState("copied");
            } catch {
              setCopyState("failed");
            }
            scheduleReset();
          }}
        >
          <span aria-live="polite">
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Copy failed — select email above"
                : "Copy Zelle email"}
          </span>
        </Button>
        <Button variant="secondary" href={GIFT_NOTICE_HREF}>
          Email a gift notice
        </Button>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--text-muted)",
        }}
      >
        Card checkout is not available yet. 501(c)(3) recognition is pending;
        we cannot promise that a gift is tax-deductible.
      </p>
    </div>
  );
}

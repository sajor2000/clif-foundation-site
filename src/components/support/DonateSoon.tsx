"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";

export function DonateSoon() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          Online giving
        </h3>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--text-body)" }}>
          Online giving — coming soon. Until Stripe Nonprofit checkout is
          configured, gifts start with an email inquiry.
        </p>
      </div>
      <Button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setMessage(null);
          try {
            const res = await fetch("/api/donate", { method: "POST" });
            const data = (await res.json()) as { message?: string };
            setMessage(data.message ?? "Online giving — coming soon");
          } catch {
            setMessage("Online giving — coming soon");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Checking…" : "Try online giving"}
      </Button>
      {message ? (
        <p
          role="status"
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

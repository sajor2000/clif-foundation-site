"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Button } from "@/components/core/Button";

const KINDS = ["gift", "partnership", "program", "other"] as const;

export function InquiryForm() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("gift");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organization: organization || undefined,
          kind,
          message: message || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        mailto?: string;
        message?: string;
      };
      if (!res.ok || !data.mailto) {
        setError(data.message ?? "Invalid inquiry");
        return;
      }
      window.location.href = data.mailto;
    } catch {
      setError("Could not prepare inquiry email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-panel)",
        background: "var(--bg-figure)",
        padding: "28px 24px",
        display: "grid",
        gap: 14,
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
          Email inquiry
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.55,
            color: "var(--text-body)",
          }}
        >
          We check the details, then open a draft in your email app. The form
          does not store your message on the server.
        </p>
      </div>
      <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
        Name{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
          (required)
        </span>
        <input
          required
          name="name"
          autoComplete="name"
          aria-required="true"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
        Organization (optional)
        <input
          name="organization"
          autoComplete="organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
        Kind
        <select
          name="kind"
          autoComplete="off"
          value={kind}
          onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
          style={inputStyle}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
        Message (optional)
        <textarea
          name="message"
          autoComplete="off"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ ...inputStyle, height: "auto", padding: 12 }}
        />
      </label>
      {error ? (
        <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Preparing…" : "Open email draft"}
      </Button>
    </form>
  );
}

const inputStyle: CSSProperties = {
  height: 44,
  padding: "0 12px",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-control)",
  background: "var(--bg-page)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
};

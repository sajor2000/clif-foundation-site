"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle } from "@/components/portal/portal-styles";

const ROLES = ["member", "secretary", "chair", "admin"] as const;

export function MembersView() {
  const members = useQuery(api.board.listMembers);
  const role = useQuery(api.board.myRole);
  const upsert = useMutation(api.board.upsertMember);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [memberRole, setMemberRole] = useState<(typeof ROLES)[number]>("member");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onAdd() {
    setError(null);
    setSaved(false);
    try {
      await upsert({
        email,
        role: memberRole,
        displayName: displayName || undefined,
      });
      setEmail("");
      setDisplayName("");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save member");
    }
  }

  if (role !== undefined && role !== "admin") {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <h1 style={pageTitle}>Members</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Only admins can edit the board allowlist. Ask an admin to add your email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <h1 style={pageTitle}>Members allowlist</h1>
        <p style={{ margin: "8px 0 0", maxWidth: 560, lineHeight: 1.55, fontSize: 15 }}>
          Only these emails can use the portal once the list is non-empty. Add directors manually
          (public roster JSON does not include emails).
        </p>
      </div>

      <div style={{ ...panelStyle, maxWidth: 520 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Add or update member</p>
        <input
          placeholder="email@example.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          type="email"
          autoComplete="off"
        />
        <input
          placeholder="Display name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={inputStyle}
        />
        <select
          value={memberRole}
          onChange={(e) => setMemberRole(e.target.value as (typeof ROLES)[number])}
          style={inputStyle}
          aria-label="Role"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {error ? (
          <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" style={{ margin: 0, fontSize: 14, color: "var(--accent-mint)" }}>
            Saved.
          </p>
        ) : null}
        <Button type="button" onClick={onAdd} disabled={!email.trim()}>
          Save member
        </Button>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {!members ? (
          <li>Loading…</li>
        ) : members.length === 0 ? (
          <li style={{ color: "var(--text-muted)" }}>No members yet.</li>
        ) : (
          members.map((m) => (
            <li
              key={m.email}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span style={{ fontWeight: 500 }}>{m.displayName || m.email}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                {m.email} · {m.role ?? "member"}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { BoardRole } from "../../../convex/lib/vocab";

/** Two access levels: officers run the board's records, directors vote and read. */
const ACCESS_LEVELS: { value: BoardRole; label: string }[] = [
  { value: "member", label: "Director: votes and reads" },
  { value: "admin", label: "Officer: full admin" },
];
const TITLES = ["Director", "President", "Secretary", "Treasurer"] as const;
const accessLabel = (role: string | undefined) =>
  role === "admin" || role === "secretary" || role === "chair" ? "officer" : "director access";
import { Button } from "@/components/core/Button";
import { FormStatus } from "@/components/portal/FormStatus";
import { useAction } from "@/components/portal/useAction";
import { inputStyle, pageTitle, panelStyle } from "@/components/portal/portal-styles";


export function MembersView() {
  const members = useQuery(api.board.listMembers);
  const role = useQuery(api.board.myRole);
  const upsert = useMutation(api.board.upsertMember);
  const remove = useMutation(api.board.removeMember);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const removeAction = useAction("Member removed.");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  // "" = keep the member's current value when updating (new members default
  // to director access with the Director title on the server).
  const [memberRole, setMemberRole] = useState<BoardRole | "">("");
  const [memberTitle, setMemberTitle] = useState<string>("");
  const [isDirector, setIsDirector] = useState(true);
  const saveAction = useAction("Saved.");

  async function onRemove(target: string) {
    await removeAction.run(() => remove({ email: target }));
    setConfirmRemove(null);
  }

  async function onAdd() {
    const done = await saveAction.run(async () => {
      await upsert({
        email,
        role: memberRole || undefined,
        title: memberTitle || undefined,
        displayName: displayName || undefined,
        isDirector,
      });
      return true;
    });
    if (done) {
      setEmail("");
      setDisplayName("");
      setIsDirector(true);
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
          Portal access is by email. Quorum counts only members marked as directors (role alone does
          not count).
        </p>
      </div>

      <PendingRequests />

      <div style={{ ...panelStyle, maxWidth: 520 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Add or update member</p>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Email
          <input
            placeholder="email@example.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            type="email"
            autoComplete="off"
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Display name (optional)
          <input
            placeholder="Jane Director"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Title
          <select value={memberTitle} onChange={(e) => setMemberTitle(e.target.value)} style={inputStyle}>
            <option value="">Keep current (new members: Director)</option>
            {TITLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Access
          <select
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as BoardRole | "")}
            style={inputStyle}
          >
            <option value="">Keep current (new members: Director)</option>
            {ACCESS_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 14,
            minHeight: 44,
          }}
        >
          <input
            type="checkbox"
            checked={isDirector}
            onChange={(e) => setIsDirector(e.target.checked)}
          />
          Voting director (counts toward quorum)
        </label>
        <FormStatus error={saveAction.error} status={saveAction.status} />
        <Button type="button" onClick={onAdd} disabled={!email.trim()} pending={saveAction.pending}>
          {saveAction.pending ? "Saving…" : "Save member"}
        </Button>
      </div>

      <FormStatus error={removeAction.error} status={removeAction.status} />
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
              <span style={{ fontWeight: 500 }}>
                {m.displayName || m.email}
                {m.title ? <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> · {m.title}</span> : null}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                {m.email} · {accessLabel(m.role)}
                {m.isDirector ? "" : " · does not vote"}
              </span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {confirmRemove === m.email ? (
                  <>
                    <Button type="button" variant="secondary" onClick={() => onRemove(m.email)} pending={removeAction.pending}>
                      Confirm removal
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setConfirmRemove(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Remove ${m.email}`}
                    onClick={() => setConfirmRemove(m.email)}
                  >
                    Remove
                  </Button>
                )}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function PendingRequests() {
  const requests = useQuery(api.board.listAccessRequests);
  const decide = useMutation(api.board.decideAccessRequest);
  const [roles, setRoles] = useState<Record<string, BoardRole>>({});
  const decideAction = useAction();
  const [deciding, setDeciding] = useState<string | null>(null);

  async function onDecide(id: Id<"accessRequests">, approve: boolean) {
    setDeciding(id);
    await decideAction.run(
      () => decide({ id, approve, role: approve ? (roles[id] ?? "member") : undefined }),
      approve ? "Approved. They now have portal access." : "Request denied.",
    );
    setDeciding(null);
  }

  if (!requests || requests.length === 0) return null;

  return (
    <div style={{ ...panelStyle, maxWidth: 720 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>Pending requests ({requests.length})</p>
      <FormStatus error={decideAction.error} status={decideAction.status} />
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {requests.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ display: "grid", gap: 2, minWidth: 220, flex: "1 1 220px" }}>
              <span style={{ fontWeight: 500 }}>{r.name || r.email}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                {r.email} · requested {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </span>
            <select
              aria-label={`Role for ${r.email}`}
              value={roles[r.id] ?? "member"}
              onChange={(e) =>
                setRoles((prev) => ({ ...prev, [r.id]: e.target.value as BoardRole }))
              }
              style={inputStyle}
            >
              {ACCESS_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <Button type="button" onClick={() => onDecide(r.id, true)} pending={deciding === r.id} disabled={decideAction.pending}>
              Approve
            </Button>
            <Button type="button" variant="secondary" onClick={() => onDecide(r.id, false)} pending={deciding === r.id} disabled={decideAction.pending}>
              Deny
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

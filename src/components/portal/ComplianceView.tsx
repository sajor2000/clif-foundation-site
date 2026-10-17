"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

export function ComplianceView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState("");
  const [meetingId, setMeetingId] = useState<Id<"meetings"> | "">("");
  const [error, setError] = useState<string | null>(null);
  const role = useQuery(api.board.myRole);
  const dashboard = useQuery(api.compliance.getDashboard, { year });
  const audit = useQuery(api.compliance.listAuditEvents, {});
  const meetings = useQuery(api.meetings.listMeetings);
  const upsert990 = useMutation(api.form990.upsertReview);
  const canMark990 =
    role === "admin" || role === "secretary" || role === "chair";

  function exportCsv() {
    if (!audit) return;
    const header = "createdAt,kind,actorEmail,summary";
    const rows = audit.map((e) =>
      [
        new Date(e.createdAt).toISOString(),
        e.kind,
        e.actorEmail ?? "",
        `"${e.summary.replace(/"/g, '""')}"`,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clif-board-audit-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function mark990Reviewed() {
    setError(null);
    if (!meetingId && !notes.trim()) {
      setError("Select a review meeting or enter notes before recording.");
      return;
    }
    try {
      await upsert990({
        taxYear: year,
        boardReviewedBeforeFiled: true,
        reviewMeetingId: meetingId || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record 990 review");
    }
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Stay compliant</h1>
      <label style={{ display: "flex", gap: 12, alignItems: "center" }}>
        Year
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: 100, height: 44 }}
          aria-label="Compliance year"
        />
      </label>

      {dashboard ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Conflict of interest</h2>
            <p style={{ margin: 0 }}>
              Disclosures: {dashboard.coi.submitted} / {dashboard.coi.eligible}
            </p>
          </div>
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Policies</h2>
            <p style={{ margin: 0 }}>Adopted: {dashboard.policies.adopted.join(", ") || "none"}</p>
            <p style={{ margin: 0 }}>Missing: {dashboard.policies.missing.join(", ") || "none"}</p>
          </div>
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Form 990 review</h2>
            <p style={{ margin: 0 }}>
              Board reviewed before filed:{" "}
              {dashboard.form990.boardReviewedBeforeFiled ? "yes" : "no"}
            </p>
            {canMark990 ? (
              <>
                <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                  Review meeting (optional)
                  <select
                    value={meetingId}
                    onChange={(e) =>
                      setMeetingId((e.target.value || "") as Id<"meetings"> | "")
                    }
                    style={inputStyle}
                  >
                    <option value="">Select a meeting…</option>
                    {(meetings ?? []).map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} · {new Date(m.scheduledAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                  Notes (required if no meeting)
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, height: "auto", padding: 12 }}
                    placeholder="Describe the board review (date, attendees, outcome)"
                  />
                </label>
                {error ? (
                  <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
                    {error}
                  </p>
                ) : null}
                <Button type="button" variant="secondary" onClick={mark990Reviewed}>
                  Mark {year} 990 as board-reviewed
                </Button>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                Secretary, chair, or admin can record the Form 990 board review.
              </p>
            )}
          </div>
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Minutes gaps</h2>
            {dashboard.minutesGaps.length === 0 ? (
              <p style={{ margin: 0 }}>No held meetings missing approved minutes.</p>
            ) : (
              <ul style={{ margin: 0 }}>
                {dashboard.minutesGaps.map((g) => (
                  <li key={g.meetingId}>
                    {g.title} ({new Date(g.scheduledAt).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <h2 style={{ ...sectionTitle, margin: 0 }}>Activity log</h2>
          <Button type="button" variant="secondary" onClick={exportCsv} disabled={!audit?.length}>
            Export audit log (CSV)
          </Button>
        </div>
        {!audit ? (
          <p>Loading…</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {audit.map((e, i) => (
              <li
                key={`${e.createdAt}-${i}`}
                style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}
              >
                {new Date(e.createdAt).toLocaleString()} · {e.kind} · {e.summary}
                {e.actorEmail ? ` · ${e.actorEmail}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

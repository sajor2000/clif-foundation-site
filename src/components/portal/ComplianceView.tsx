"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/core/Button";
import { FormStatus } from "@/components/portal/FormStatus";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";
import { useAction } from "@/components/portal/useAction";
import { useStickyQuery } from "@/components/portal/useStickyQuery";
import { YearField } from "@/components/portal/YearField";
import { POLICY_TYPES } from "../../../convex/lib/vocab";

const policyLabel = (value: string) => POLICY_TYPES.find((p) => p.value === value)?.label ?? value;

export function ComplianceView() {
  const [year, setYear] = useState(new Date().getFullYear());
  // The 990 reviewed this year covers the prior calendar year.
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1);
  const [notes, setNotes] = useState("");
  const [meetingId, setMeetingId] = useState<Id<"meetings"> | "">("");
  const review = useAction("Form 990 review recorded.");
  const role = useQuery(api.board.myRole);
  // Keep the last dashboard on screen (dimmed) while a new year loads.
  const { data: dashboard, stale } = useStickyQuery(api.compliance.getDashboard, { year, taxYear });
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
    if (!meetingId && !notes.trim()) {
      review.setError("Select a review meeting or enter notes before recording.");
      return;
    }
    await review.run(() =>
      upsert990({
        taxYear,
        boardReviewedBeforeFiled: true,
        reviewMeetingId: meetingId || undefined,
        notes: notes.trim() || undefined,
      }),
    );
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Stay compliant</h1>
      <YearField label="COI year" value={year} onCommit={setYear} />

      {dashboard ? (
        <div
          style={{ display: "grid", gap: 16, opacity: stale ? 0.6 : 1 }}
          aria-busy={stale || undefined}
        >
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Conflict of interest</h2>
            <p style={{ margin: 0 }}>
              Directors who filed for {year}: {dashboard.coi.submitted} / {dashboard.coi.eligible}
            </p>
            {dashboard.coi.missing.length ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                Still to file: {dashboard.coi.missing.join(", ")}
              </p>
            ) : null}
          </div>
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Policies</h2>
            <p style={{ margin: 0 }}>Adopted: {dashboard.policies.adopted.map(policyLabel).join(", ") || "none"}</p>
            <p style={{ margin: 0 }}>Missing: {dashboard.policies.missing.map(policyLabel).join(", ") || "none"}</p>
          </div>
          <div style={panelStyle}>
            <h2 style={{ ...sectionTitle, fontSize: 20 }}>Form 990 review</h2>
            <YearField label="Tax year" value={taxYear} onCommit={setTaxYear} />
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
                <FormStatus error={review.error} status={review.status} />
                <Button type="button" variant="secondary" onClick={mark990Reviewed} pending={review.pending}>
                  Mark {taxYear} 990 as board-reviewed
                </Button>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
                Officers record the board’s Form 990 review.
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
          <p style={{ color: "var(--text-muted)" }}>Loading activity…</p>
        ) : audit.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No activity yet.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {audit.map((e) => (
              <li
                key={e.id}
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

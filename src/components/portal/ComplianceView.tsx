"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

export function ComplianceView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const dashboard = useQuery(api.compliance.getDashboard, { year });
  const audit = useQuery(api.compliance.listAuditEvents);
  const upsert990 = useMutation(api.form990.upsertReview);

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Compliance</h1>
      <label style={{ display: "flex", gap: 12, alignItems: "center" }}>
        Year
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: 100, height: 44 }}
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
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                upsert990({
                  taxYear: year,
                  boardReviewedBeforeFiled: true,
                  notes: "Recorded from compliance dashboard",
                })
              }
            >
              Mark {year} 990 as board-reviewed
            </Button>
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

      <section>
        <h2 style={sectionTitle}>Recent activity</h2>
        {!audit ? (
          <p>Loading…</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {audit.map((e, i) => (
              <li
                key={`${e.createdAt}-${i}`}
                style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}
              >
                {new Date(e.createdAt).toLocaleString()} · {e.summary}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

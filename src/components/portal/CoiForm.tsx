"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle } from "@/components/portal/portal-styles";

export function CoiForm() {
  const year = new Date().getFullYear();
  const existing = useQuery(api.coi.getMyDisclosure, { year });
  const submit = useMutation(api.coi.submitDisclosure);
  const [hasConflict, setHasConflict] = useState(false);
  const [details, setDetails] = useState("");
  const [saved, setSaved] = useState(false);

  async function onSubmit() {
    await submit({ year, hasConflict, details: details || undefined });
    setSaved(true);
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <h1 style={pageTitle}>Annual COI disclosure</h1>
      <p style={{ margin: 0, lineHeight: 1.55 }}>
        Complete once per calendar year. Your answers support Form 990 Part VI conflict-of-interest
        disclosures.
      </p>
      {existing ? (
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Last submitted {new Date(existing.submittedAt).toLocaleString()}.
        </p>
      ) : null}
      <div style={panelStyle}>
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: 15,
            minHeight: 44,
          }}
        >
          <input
            type="checkbox"
            checked={hasConflict}
            onChange={(e) => setHasConflict(e.target.checked)}
          />
          I have a reportable conflict or relationship to disclose
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Details (if any)
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            style={{ ...inputStyle, height: "auto", padding: 12 }}
          />
        </label>
        <Button type="button" onClick={onSubmit}>
          Submit {year} disclosure
        </Button>
        {saved ? (
          <p role="status" style={{ margin: 0, color: "var(--accent-text)", fontSize: 14 }}>
            Saved.
          </p>
        ) : null}
      </div>
    </div>
  );
}

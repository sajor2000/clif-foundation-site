"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { FormStatus } from "@/components/portal/FormStatus";
import { inputStyle, pageTitle, panelStyle } from "@/components/portal/portal-styles";
import { useAction } from "@/components/portal/useAction";

export function CoiForm() {
  const year = new Date().getFullYear();
  const existing = useQuery(api.coi.getMyDisclosure, { year });
  const submit = useMutation(api.coi.submitDisclosure);
  const [draftConflict, setDraftConflict] = useState<boolean | null>(null);
  const [draftDetails, setDraftDetails] = useState<string | null>(null);
  const action = useAction("Disclosure saved.");

  const hasConflict = draftConflict ?? existing?.hasConflict ?? false;
  const details = draftDetails ?? existing?.details ?? "";

  async function onSubmit() {
    const ok = await action.run(async () => {
      await submit({ year, hasConflict, details: details || undefined });
      return true;
    });
    if (ok) {
      setDraftConflict(null);
      setDraftDetails(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <h1 style={pageTitle}>Annual COI disclosure</h1>
      <p style={{ margin: 0, lineHeight: 1.55 }}>
        Complete once per calendar year. Your answers support Form 990 Part VI conflict-of-interest
        disclosures.
      </p>
      {/* Always one line, so the form doesn't jump when the query resolves. */}
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", minHeight: "1.5em" }}>
        {existing === undefined
          ? "Checking your disclosure…"
          : existing
            ? `Last submitted ${new Date(existing.submittedAt).toLocaleString()}.`
            : `Not yet submitted for ${year}.`}
      </p>
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
            onChange={(e) => setDraftConflict(e.target.checked)}
          />
          I have a reportable conflict or relationship to disclose
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Details (if any)
          <textarea
            value={details}
            onChange={(e) => setDraftDetails(e.target.value)}
            rows={5}
            style={{ ...inputStyle, height: "auto", padding: 12 }}
          />
        </label>
        <FormStatus error={action.error} status={action.status} />
        <Button type="button" onClick={onSubmit} pending={action.pending}>
          {action.pending ? "Saving…" : `Submit ${year} disclosure`}
        </Button>
      </div>
    </div>
  );
}

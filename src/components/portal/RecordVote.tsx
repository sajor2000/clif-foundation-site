"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BALLOT_CHOICES, type BallotChoice } from "../../../convex/lib/vocab";
import { Button } from "@/components/core/Button";
import { inputStyle } from "@/components/portal/portal-styles";

type Entry = BallotChoice | "absent";

/**
 * For a vote taken outside the portal (in a meeting, or before the portal
 * existed): an officer enters each director's vote, and the motion closes
 * with that result. Directors marked absent are not counted as voting.
 */
export function RecordVote({ motionId, motionTitle }: { motionId: Id<"motions">; motionTitle: string }) {
  const members = useQuery(api.board.listMembers);
  const record = useMutation(api.motions.recordVote);
  const [votes, setVotes] = useState<Record<string, Entry>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const directors = (members ?? []).filter((m) => m.isDirector);
  const entered = Object.entries(votes).filter(([, c]) => c !== "absent") as [string, BallotChoice][];

  async function onRecord() {
    setError(null);
    setSaving(true);
    try {
      await record({ motionId, votes: entered.map(([email, choice]) => ({ email, choice })) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record the vote");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details style={{ width: "100%" }}>
      <summary style={{ cursor: "pointer", color: "var(--link)", minHeight: "var(--control-md)", display: "flex", alignItems: "center" }}>
        Record votes taken in a meeting
      </summary>
      <div style={{ display: "grid", gap: 10, paddingTop: 8, maxWidth: 560 }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-body)" }}>
          Enter how each director voted on “{motionTitle}”. Recording closes the motion with this
          result.
        </p>
        {directors.map((d) => (
          <label
            key={d.email}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 14 }}
          >
            <span>
              {d.displayName || d.email}
              {d.title ? <span style={{ color: "var(--text-muted)" }}> · {d.title}</span> : null}
            </span>
            <select
              value={votes[d.email] ?? "absent"}
              onChange={(e) => setVotes((prev) => ({ ...prev, [d.email]: e.target.value as Entry }))}
              style={{ ...inputStyle, minWidth: 140 }}
              aria-label={`Vote of ${d.displayName || d.email}`}
            >
              <option value="absent">Absent / did not vote</option>
              {BALLOT_CHOICES.map((c) => (
                <option key={c} value={c}>
                  {c === "recuse" ? "Recused" : c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </label>
        ))}
        {error ? (
          <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
            {error}
          </p>
        ) : null}
        <Button type="button" onClick={onRecord} disabled={!entered.length || saving}>
          {saving ? "Recording…" : `Record ${entered.length} ${entered.length === 1 ? "vote" : "votes"} and close`}
        </Button>
      </div>
    </details>
  );
}

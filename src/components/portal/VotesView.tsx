"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

type StatusFilter = "open" | "closed" | "draft" | "all";

export function VotesView({ focusId }: { focusId?: string } = {}) {
  const [filter, setFilter] = useState<StatusFilter>("open");
  const open = useQuery(api.motions.listMotions, { status: "open" });
  const closed = useQuery(api.motions.listMotions, { status: "closed" });
  const draft = useQuery(api.motions.listMotions, { status: "draft" });
  const all = useQuery(api.motions.listMotions, {});
  const createMotion = useMutation(api.motions.createMotion);
  const setStatus = useMutation(api.motions.setMotionStatus);
  const castBallot = useMutation(api.motions.castBallot);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    setError(null);
    await createMotion({
      title,
      description: description || undefined,
      motionType: consent ? "consent" : "standard",
    });
    setTitle("");
    setDescription("");
  }

  const list =
    filter === "open"
      ? open
      : filter === "closed"
        ? closed
        : filter === "draft"
          ? draft
          : all;

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Votes</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Filter motions">
        {(["open", "closed", "draft", "all"] as const).map((f) => (
          <Button
            key={f}
            type="button"
            variant={filter === f ? "primary" : "secondary"}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <div style={{ ...panelStyle, maxWidth: 520 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>New motion</p>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Title
          <input
            placeholder="e.g. Approve Q3 minutes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Description (optional)
          <textarea
            placeholder="Context for directors"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, height: "auto", padding: 12 }}
          />
        </label>
        <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center", minHeight: 44 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Written consent (all directors must vote yes)
        </label>
        <Button type="button" onClick={onCreate} disabled={!title.trim()}>
          Create draft motion
        </Button>
      </div>

      {error ? (
        <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
          {error}
        </p>
      ) : null}

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={sectionTitle}>Motions</h2>
        {!list ? (
          <p>Loading…</p>
        ) : list.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No motions in this filter.</p>
        ) : (
          list.map(({ motion, tally }) => (
            <div
              key={motion._id}
              id={`motion-${motion._id}`}
              style={{
                ...panelStyle,
                outline:
                  focusId === motion._id ? "2px solid var(--accent)" : undefined,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                <Link href={`/portal/votes/${motion._id}`} style={{ color: "inherit" }}>
                  {motion.title}
                </Link>
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                {motion.status} · {motion.motionType}
              </p>
              {motion.description ? (
                <p style={{ margin: 0, fontSize: 14 }}>{motion.description}</p>
              ) : null}
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                Yes {tally.yes} · No {tally.no} · Abstain {tally.abstain} · Recuse {tally.recuse} ·
                Voted {tally.voted}/{tally.eligible}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {motion.status === "draft" ? (
                  <Button
                    type="button"
                    onClick={() => setStatus({ motionId: motion._id, status: "open" })}
                  >
                    Open voting
                  </Button>
                ) : null}
                {motion.status === "open" ? (
                  <>
                    {(["yes", "no", "abstain", "recuse"] as const).map((choice) => (
                      <Button
                        key={choice}
                        type="button"
                        variant="secondary"
                        onClick={() => castBallot({ motionId: motion._id, choice })}
                      >
                        Vote {choice}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      onClick={() =>
                        setStatus({ motionId: motion._id, status: "closed" }).catch((e: Error) =>
                          setError(e.message),
                        )
                      }
                    >
                      Close voting
                    </Button>
                  </>
                ) : null}
                {motion.status === "closed" ? (
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: tally.passed ? "var(--accent-text)" : "var(--status-error)",
                    }}
                  >
                    {tally.passed ? "Passed" : "Not passed"}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

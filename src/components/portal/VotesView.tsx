"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

export function VotesView() {
  const open = useQuery(api.motions.listMotions, { status: "open" });
  const all = useQuery(api.motions.listMotions, {});
  const createMotion = useMutation(api.motions.createMotion);
  const setStatus = useMutation(api.motions.setMotionStatus);
  const castBallot = useMutation(api.motions.castBallot);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);

  async function onCreate() {
    await createMotion({
      title,
      description: description || undefined,
      motionType: consent ? "consent" : "standard",
    });
    setTitle("");
    setDescription("");
  }

  const list = open ?? all;

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Votes</h1>

      <div style={{ ...panelStyle, maxWidth: 520 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>New motion</p>
        <input
          placeholder="Motion title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ ...inputStyle, height: "auto", padding: 12 }}
        />
        <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Written consent (all directors must vote yes)
        </label>
        <Button type="button" onClick={onCreate}>
          Create draft motion
        </Button>
      </div>

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={sectionTitle}>Motions</h2>
        {!list ? (
          <p>Loading…</p>
        ) : list.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No motions yet.</p>
        ) : (
          list.map(({ motion, tally }) => (
            <div key={motion._id} style={panelStyle}>
              <p style={{ margin: 0, fontWeight: 600 }}>{motion.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                {motion.status} · {motion.motionType}
              </p>
              {motion.description ? (
                <p style={{ margin: 0, fontSize: 14 }}>{motion.description}</p>
              ) : null}
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                Yes {tally.yes} · No {tally.no} · Abstain {tally.abstain} · Recuse {tally.recuse}
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
                      onClick={() => setStatus({ motionId: motion._id, status: "closed" })}
                    >
                      Close voting
                    </Button>
                  </>
                ) : null}
                {motion.status === "closed" && tally.passed ? (
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-mint)" }}>
                    Passed
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

"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { BallotChoice } from "../../../convex/lib/vocab";
import { Button } from "@/components/core/Button";
import { FilterChip } from "@/components/core/FilterChip";
import { Tag } from "@/components/core/Tag";
import { FormStatus } from "@/components/portal/FormStatus";
import { RecordVote } from "@/components/portal/RecordVote";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";
import { useAction } from "@/components/portal/useAction";

type StatusFilter = "open" | "closed" | "draft" | "all";
type Tally = { yes: number; no: number; abstain: number; recuse: number; eligible: number; voted: number; passed: boolean };

const CHOICE_LABEL: Record<BallotChoice, string> = {
  yes: "Yes",
  no: "No",
  abstain: "Abstain",
  recuse: "Recuse",
};
const STATUS_LABEL: Record<Doc<"motions">["status"], string> = {
  draft: "Draft",
  open: "Open for voting",
  closed: "Closed",
};

export function VotesView({ focusId }: { focusId?: string } = {}) {
  const [filter, setFilter] = useState<StatusFilter>(focusId ? "all" : "open");
  // One subscription; filters are applied client-side.
  const all = useQuery(api.motions.listMotions, {});
  const canVote = useQuery(api.board.amIDirector) === true;
  const role = useQuery(api.board.myRole);
  const isOfficer = role === "admin" || role === "secretary" || role === "chair";

  const counts = {
    open: all?.filter((m) => m.motion.status === "open").length ?? 0,
    closed: all?.filter((m) => m.motion.status === "closed").length ?? 0,
    draft: all?.filter((m) => m.motion.status === "draft").length ?? 0,
    all: all?.length ?? 0,
  };
  const list = all?.filter((m) => filter === "all" || m.motion.status === filter);

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Votes</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Filter motions">
        {(["open", "closed", "draft", "all"] as const).map((f) => (
          <FilterChip
            key={f}
            label={f === "all" ? "All" : STATUS_LABEL[f]}
            pressed={filter === f}
            count={all ? counts[f] : undefined}
            onClick={() => setFilter(f)}
          />
        ))}
      </div>

      {isOfficer ? <NewMotion /> : null}

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={sectionTitle}>Motions</h2>
        {!list ? (
          <p style={{ color: "var(--text-muted)" }}>Loading motions…</p>
        ) : list.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            {filter === "open"
              ? "No motions are open for voting."
              : filter === "draft"
                ? "No draft motions."
                : filter === "closed"
                  ? "No closed motions yet."
                  : "No motions yet."}
            {isOfficer && filter !== "closed" ? " Create one above." : ""}
          </p>
        ) : (
          list.map(({ motion, tally, myChoice }) => (
            <MotionCard
              key={motion._id}
              motion={motion}
              tally={tally}
              myChoice={myChoice}
              focused={focusId === motion._id}
              canVote={canVote}
              isOfficer={isOfficer}
            />
          ))
        )}
      </section>
    </div>
  );
}

function NewMotion() {
  const createMotion = useMutation(api.motions.createMotion);
  const action = useAction("Draft motion created.");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);

  async function onCreate() {
    const id = await action.run(() =>
      createMotion({
        title,
        description: description || undefined,
        motionType: consent ? "consent" : "standard",
      }),
    );
    if (id) {
      setTitle("");
      setDescription("");
      setConsent(false);
    }
  }

  return (
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
      <FormStatus error={action.error} status={action.status} />
      <Button type="button" onClick={onCreate} disabled={!title.trim()} pending={action.pending}>
        {action.pending ? "Creating…" : "Create draft motion"}
      </Button>
    </div>
  );
}

function MotionCard({
  motion,
  tally,
  myChoice,
  focused,
  canVote,
  isOfficer,
}: {
  motion: Doc<"motions">;
  tally: Tally;
  myChoice: BallotChoice | null;
  focused: boolean;
  canVote: boolean;
  isOfficer: boolean;
}) {
  const setStatus = useMutation(api.motions.setMotionStatus);
  const castBallot = useMutation(api.motions.castBallot);
  const vote = useAction();
  const control = useAction();
  const [voting, setVoting] = useState<BallotChoice | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const statusId = `motion-status-${motion._id}`;

  async function onVote(choice: BallotChoice) {
    setVoting(choice);
    await vote.run(() => castBallot({ motionId: motion._id as Id<"motions">, choice }));
    setVoting(null);
  }

  return (
    <article
      id={`motion-${motion._id}`}
      style={{ ...panelStyle, outline: focused ? "2px solid var(--accent)" : undefined }}
      aria-labelledby={`motion-title-${motion._id}`}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}>
        <Link
          id={`motion-title-${motion._id}`}
          href={`/portal/votes/${motion._id}`}
          className="portal-row-link"
          style={{ color: "inherit", fontWeight: 600 }}
        >
          {motion.title}
        </Link>
        <Tag status={motion.status === "open" ? "existing" : "neutral"}>{STATUS_LABEL[motion.status]}</Tag>
        {motion.motionType === "consent" ? <Tag>Written consent</Tag> : null}
      </div>
      {motion.description ? <p style={{ margin: 0, fontSize: 14 }}>{motion.description}</p> : null}
      {motion.minutesId && motion.meetingId ? (
        <Link href={`/portal/meetings/${motion.meetingId}`} className="portal-row-link" style={{ color: "var(--link)", fontSize: 14 }}>
          Read the minutes
        </Link>
      ) : null}
      {motion.recordedBy ? (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
          Votes recorded from a meeting by {motion.recordedBy}
        </p>
      ) : null}
      <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
        Yes {tally.yes} · No {tally.no} · Abstain {tally.abstain} · Recuse {tally.recuse} · Voted {tally.voted}/{tally.eligible}
      </p>

      {motion.status === "open" && canVote ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div role="group" aria-label="Your vote" aria-describedby={statusId} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(["yes", "no", "abstain", "recuse"] as const).map((choice) => (
              <Button
                key={choice}
                type="button"
                variant={myChoice === choice ? "primary" : "secondary"}
                aria-pressed={myChoice === choice}
                pending={vote.pending}
                onClick={() => onVote(choice)}
                style={{ minWidth: 104 }}
              >
                {voting === choice ? "Voting…" : CHOICE_LABEL[choice]}
              </Button>
            ))}
          </div>
          <p id={statusId} role="status" style={{ margin: 0, fontSize: 14, color: "var(--text-body)" }}>
            {myChoice ? `Your vote: ${CHOICE_LABEL[myChoice]}. You can change it until voting closes.` : "You haven't voted yet."}
          </p>
          <FormStatus error={vote.error} />
        </div>
      ) : null}

      {isOfficer && (motion.status === "draft" || motion.status === "open") ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {motion.status === "draft" ? (
              <Button
                type="button"
                pending={control.pending}
                onClick={() => control.run(() => setStatus({ motionId: motion._id, status: "open" }))}
              >
                {control.pending ? "Opening…" : "Open voting"}
              </Button>
            ) : confirmClose ? (
              <>
                <Button
                  type="button"
                  pending={control.pending}
                  onClick={async () => {
                    await control.run(() => setStatus({ motionId: motion._id, status: "closed" }));
                    setConfirmClose(false);
                  }}
                >
                  {control.pending ? "Closing…" : "Confirm: close voting"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirmClose(false)} disabled={control.pending}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setConfirmClose(true)}>
                Close voting
              </Button>
            )}
          </div>
          {confirmClose ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-body)" }}>
              Closing records the result ({tally.voted} of {tally.eligible} voted) and can’t be undone.
            </p>
          ) : null}
          <FormStatus error={control.error} />
          {motion.status === "open" ? <RecordVote motionId={motion._id} motionTitle={motion.title} /> : null}
        </div>
      ) : null}

      {motion.status === "closed" ? (
        <span style={{ fontSize: 14, fontWeight: 600, color: tally.passed ? "var(--accent-text)" : "var(--status-error)" }}>
          {tally.passed ? "Passed" : "Not passed"}
        </span>
      ) : null}
    </article>
  );
}

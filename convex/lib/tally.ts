import type { BallotChoice, MotionStatus, MotionType } from "./vocab";

export type Tally = {
  yes: number;
  no: number;
  abstain: number;
  recuse: number;
  /** Directors whose vote counts toward the result. */
  eligible: number;
  voted: number;
  passed: boolean;
};

/**
 * Count a motion's ballots. Only current directors' ballots count (access role
 * never makes someone a voter). A consent motion needs a yes from every
 * director who has not recused; a standard motion needs more yes than no.
 * Nothing passes until the motion is closed.
 */
export function tallyBallots(
  ballots: ReadonlyArray<{ voterEmail?: string; choice: BallotChoice; castAt?: number }>,
  directorEmails: ReadonlySet<string>,
  motionType: MotionType,
  status: MotionStatus,
): Tally {
  // One ballot per director: their most recent one.
  const latest = new Map<string, { choice: BallotChoice; castAt: number }>();
  for (const b of ballots) {
    const email = b.voterEmail?.toLowerCase();
    if (!email || !directorEmails.has(email)) continue;
    const prev = latest.get(email);
    if (!prev || (b.castAt ?? 0) >= prev.castAt) latest.set(email, { choice: b.choice, castAt: b.castAt ?? 0 });
  }
  const counted = [...latest.values()];
  const count = (choice: BallotChoice) => counted.filter((b) => b.choice === choice).length;
  const yes = count("yes");
  const no = count("no");
  const abstain = count("abstain");
  const recuse = count("recuse");
  const eligible =
    motionType === "consent" ? directorEmails.size - recuse : directorEmails.size;

  let passed = false;
  if (status === "closed" && eligible > 0) {
    passed =
      motionType === "consent"
        ? yes === eligible && no === 0 && abstain === 0
        : yes > no;
  }

  return { yes, no, abstain, recuse, eligible, voted: counted.length, passed };
}

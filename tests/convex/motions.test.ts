import { describe, expect, it } from "vitest";
import { ADMIN, api, as, backend, seedBoard } from "./setup";

async function openMotion(t: ReturnType<typeof backend>, motionType: "standard" | "consent") {
  const id = await as(t, ADMIN).mutation(api.motions.createMotion, { title: "Budget", motionType });
  await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId: id, status: "open" });
  return id;
}

describe("voting", () => {
  it("only directors vote, and only their ballots count", async () => {
    const t = backend();
    await seedBoard(t, [
      { email: "d1@x.org" },
      { email: "officer@x.org", role: "secretary", isDirector: false },
    ]);
    const id = await openMotion(t, "standard");
    await as(t, "d1@x.org").mutation(api.motions.castBallot, { motionId: id, choice: "yes" });
    await expect(
      as(t, "officer@x.org").mutation(api.motions.castBallot, { motionId: id, choice: "no" }),
    ).rejects.toThrow(/Only directors/);
    expect(await as(t, "officer@x.org").query(api.board.amIDirector, {})).toBe(false);
    const got = await as(t, ADMIN).query(api.motions.getMotion, { motionId: id });
    expect(got?.tally).toMatchObject({ yes: 1, no: 0, eligible: 2, voted: 1 });
  });

  it("a closed result is frozen when directors change later", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }]);
    const id = await openMotion(t, "consent");
    await as(t, ADMIN).mutation(api.motions.castBallot, { motionId: id, choice: "yes" });
    await as(t, "d1@x.org").mutation(api.motions.castBallot, { motionId: id, choice: "yes" });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId: id, status: "closed" });
    const before = await as(t, ADMIN).query(api.motions.getMotion, { motionId: id });
    expect(before?.tally.passed).toBe(true);

    await as(t, ADMIN).mutation(api.board.upsertMember, { email: "d2@x.org", isDirector: true });
    const after = await as(t, ADMIN).query(api.motions.getMotion, { motionId: id });
    expect(after?.tally).toEqual(before?.tally);
  });

  it("voting is refused once a motion is closed", async () => {
    const t = backend();
    await seedBoard(t, []);
    const id = await openMotion(t, "standard");
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId: id, status: "closed" });
    await expect(
      as(t, ADMIN).mutation(api.motions.castBallot, { motionId: id, choice: "yes" }),
    ).rejects.toThrow(/closed/);
  });
});

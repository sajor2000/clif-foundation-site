"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { FormStatus } from "@/components/portal/FormStatus";
import { MinutesApproval } from "@/components/portal/MinutesApproval";
import { MinutesItems } from "@/components/portal/MinutesItems";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";
import { useAction } from "@/components/portal/useAction";

export function MeetingsView({ meetingId }: { meetingId?: string } = {}) {
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selected = meetingId ?? pickedId;
  const meetings = useQuery(api.meetings.listMeetings);
  const role = useQuery(api.board.myRole);
  const isOfficer = role === "admin" || role === "secretary" || role === "chair";
  const createMeeting = useMutation(api.meetings.createMeeting);
  const upsertMinutes = useMutation(api.meetings.upsertMinutes);
  const reviseMinutes = useMutation(api.meetings.reviseMinutes);
  const updateAttendance = useMutation(api.meetings.updateAttendance);
  const exportMinutes = useQuery(
    api.meetings.getMinutesExport,
    selected ? { meetingId: selected } : "skip",
  );
  const [draftMinutes, setDraftMinutes] = useState<string | null>(null);
  const [draftAttendees, setDraftAttendees] = useState<string | null>(null);
  const [draftMeetingId, setDraftMeetingId] = useState<string | null>(null);
  const createAction = useAction("Meeting created.");
  const attendanceAction = useAction("Attendance saved; meeting marked held.");
  const minutesAction = useAction("Minutes saved.");

  const detail = useQuery(
    api.meetings.getMeeting,
    selected ? { meetingId: selected } : "skip",
  );

  const minutesBody =
    selected && draftMeetingId === selected && draftMinutes !== null
      ? draftMinutes
      : (detail?.minutes?.body ?? "");
  const attendees =
    selected && draftMeetingId === selected && draftAttendees !== null
      ? draftAttendees
      : (detail?.meeting.attendeeEmails.join(", ") ?? "");

  function editMinutes(value: string) {
    if (!selected) return;
    setDraftMeetingId(selected);
    setDraftMinutes(value);
  }

  function editAttendees(value: string) {
    if (!selected) return;
    setDraftMeetingId(selected);
    setDraftAttendees(value);
  }

  async function onCreate() {
    if (!title || !scheduledAt) return;
    const id = await createAction.run(() =>
      createMeeting({ title, scheduledAt: new Date(scheduledAt).getTime() }),
    );
    if (id) {
      setPickedId(id);
      setTitle("");
      setScheduledAt("");
    }
  }

  async function saveMinutes() {
    if (!detail) return;
    const ok = await minutesAction.run(async () => {
      await upsertMinutes({ meetingId: detail.meeting._id, body: minutesBody });
      return true;
    });
    if (ok) setDraftMinutes(null);
  }

  async function onRevise() {
    if (!detail) return;
    const ok = await minutesAction.run(async () => {
      await reviseMinutes({ meetingId: detail.meeting._id, body: minutesBody });
      return true;
    }, "New draft version started.");
    if (ok) setDraftMinutes(null);
  }

  async function saveAttendance() {
    if (!detail) return;
    const emails = attendees
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const ok = await attendanceAction.run(async () => {
      await updateAttendance({
        meetingId: detail.meeting._id,
        attendeeEmails: emails,
        status: "held",
        heldAt: Date.now(),
      });
      return true;
    });
    if (ok) setDraftAttendees(null);
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Meetings and minutes</h1>

      {!meetingId && isOfficer ? (
        <div style={{ ...panelStyle, maxWidth: 520 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Schedule meeting</p>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Title
            <input
              placeholder="e.g. Q4 board meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Date and time
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              style={inputStyle}
            />
          </label>
          <FormStatus error={createAction.error} status={createAction.status} />
          <Button type="button" onClick={onCreate} disabled={!title.trim() || !scheduledAt} pending={createAction.pending}>
            {createAction.pending ? "Creating…" : "Create meeting"}
          </Button>
        </div>
      ) : null}

      {!meetingId ? (
        <section style={{ display: "grid", gap: 12 }}>
          <h2 style={sectionTitle}>Meetings</h2>
          {!meetings ? (
            <p style={{ color: "var(--text-muted)" }}>Loading meetings…</p>
          ) : meetings.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No meetings yet.{isOfficer ? " Schedule the first one above." : " Officers schedule meetings here."}
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {meetings.map((m) => (
                <li key={m._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <Link
                    href={`/portal/meetings/${m._id}`}
                    className="portal-row-link"
                    style={{
                      color: "var(--link)",
                      fontWeight: selected === m._id ? 700 : 500,
                      fontSize: 16,
                    }}
                  >
                    {m.title} · {new Date(m.scheduledAt).toLocaleString()}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {selected && detail === null ? (
        <p role="status" style={{ margin: 0, color: "var(--text-muted)" }}>
          Meeting not found. Choose one from the list.
        </p>
      ) : null}
      {selected && detail ? (
        <div style={{ display: "grid", gap: 16 }}>
          <h2 style={sectionTitle}>{detail.meeting.title}</h2>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
            Status: {detail.meeting.status} · Quorum required: {detail.meeting.quorumRequired}
            {detail.meeting.quorumMet !== undefined
              ? ` · Quorum met: ${detail.meeting.quorumMet ? "yes" : "no"}`
              : ""}

          </p>
          {isOfficer ? (
            <>
              <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                Attendee emails (comma-separated)
                <input
                  value={attendees}
                  onChange={(e) => editAttendees(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <FormStatus error={attendanceAction.error} status={attendanceAction.status} />
              <Button type="button" variant="secondary" onClick={saveAttendance} pending={attendanceAction.pending}>
                {attendanceAction.pending ? "Saving…" : "Save attendance and mark held"}
              </Button>
            </>
          ) : null}
          <MinutesApproval
            meeting={detail.meeting}
            minutes={detail.minutes}
            minutesFile={detail.minutesFile}
            approvalMotion={detail.approvalMotion}
            isOfficer={isOfficer}
          />
          {isOfficer && detail.minutes?.status !== "published_for_review" ? (
            <>
              <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                Minutes text (optional if you attach a file)
                <textarea
                  value={minutesBody}
                  onChange={(e) => editMinutes(e.target.value)}
                  rows={8}
                  style={{ ...inputStyle, height: "auto", padding: 12 }}
                  disabled={detail.minutes?.status === "approved"}
                />
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {detail.minutes?.status === "approved" ? (
                  <Button type="button" variant="secondary" onClick={onRevise} pending={minutesAction.pending}>
                    Revise (new version)
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={() => saveMinutes()} pending={minutesAction.pending}>
                    Save minutes text
                  </Button>
                )}
              </div>
            </>
          ) : detail.minutes?.body ? (
            <div style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.55, maxWidth: "70ch" }}>
              {detail.minutes.body}
            </div>
          ) : null}
          <FormStatus error={minutesAction.error} status={minutesAction.status} />
          {detail.minutes ? (
            <MinutesItems minutes={detail.minutes} items={detail.items} canEdit={isOfficer} />
          ) : (
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
              Save a draft to start adding agenda items.
            </p>
          )}
          {exportMinutes ? (
            <details>
              <summary style={{ cursor: "pointer", color: "var(--link)" }}>Preview export</summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  background: "var(--bg-figure)",
                  padding: 16,
                  borderRadius: "var(--radius-panel)",
                }}
              >
                {exportMinutes}
              </pre>
            </details>
          ) : null}
        </div>
      ) : meetingId ? (
        <p>Loading meeting…</p>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

export function MeetingsView({ meetingId }: { meetingId?: string } = {}) {
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selected = meetingId ?? pickedId;
  const meetings = useQuery(api.meetings.listMeetings);
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
  const [error, setError] = useState<string | null>(null);

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
    const id = await createMeeting({
      title,
      scheduledAt: new Date(scheduledAt).getTime(),
    });
    setPickedId(id);
    setTitle("");
  }

  async function saveMinutes(status?: "draft" | "published_for_review" | "approved") {
    if (!detail) return;
    setError(null);
    try {
      await upsertMinutes({
        meetingId: detail.meeting._id,
        body: minutesBody,
        status,
      });
      setDraftMinutes(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save minutes");
    }
  }

  async function onRevise() {
    if (!detail) return;
    setError(null);
    try {
      await reviseMinutes({
        meetingId: detail.meeting._id,
        body: minutesBody,
      });
      setDraftMinutes(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revise");
    }
  }

  async function saveAttendance() {
    if (!detail) return;
    const emails = attendees
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    await updateAttendance({
      meetingId: detail.meeting._id,
      attendeeEmails: emails,
      status: "held",
      heldAt: Date.now(),
    });
    setDraftAttendees(null);
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Meetings and minutes</h1>

      {!meetingId ? (
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
          <Button type="button" onClick={onCreate}>
            Create meeting
          </Button>
        </div>
      ) : null}

      {!meetingId ? (
        <section style={{ display: "grid", gap: 12 }}>
          <h2 style={sectionTitle}>Meetings</h2>
          {!meetings ? (
            <p>Loading…</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {meetings.map((m) => (
                <li
                  key={m._id}
                  style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}
                >
                  <Link
                    href={`/portal/meetings/${m._id}`}
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
            {detail.minutes
              ? ` · Minutes v${detail.minutes.version} (${detail.minutes.status})`
              : ""}
          </p>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Attendee emails (comma-separated)
            <input
              value={attendees}
              onChange={(e) => editAttendees(e.target.value)}
              style={inputStyle}
            />
          </label>
          <Button type="button" variant="secondary" onClick={saveAttendance}>
            Save attendance and mark held
          </Button>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Minutes body
            <textarea
              value={minutesBody}
              onChange={(e) => editMinutes(e.target.value)}
              rows={8}
              style={{ ...inputStyle, height: "auto", padding: 12 }}
              disabled={detail.minutes?.status === "approved"}
            />
          </label>
          {error ? (
            <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
              {error}
            </p>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {detail.minutes?.status === "approved" ? (
              <Button type="button" onClick={onRevise}>
                Revise (new version)
              </Button>
            ) : (
              <>
                <Button type="button" variant="secondary" onClick={() => saveMinutes("draft")}>
                  Save draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => saveMinutes("published_for_review")}
                >
                  Publish for review
                </Button>
                {detail.minutes?.status === "published_for_review" ? (
                  <Button
                    type="button"
                    onClick={() => saveMinutes("approved")}
                    disabled={detail.meeting.status !== "held"}
                  >
                    Approve minutes
                  </Button>
                ) : null}
              </>
            )}
          </div>
          {exportMinutes ? (
            <details>
              <summary style={{ cursor: "pointer", color: "var(--link)" }}>Preview export</summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  background: "var(--bg-figure)",
                  padding: 16,
                  borderRadius: 6,
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

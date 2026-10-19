"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { Cause, Effect, Exit } from "effect";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { ACCEPTED_UPLOAD_TYPES } from "../../../convex/lib/uploads";
import { Button } from "@/components/core/Button";
import { FormStatus } from "@/components/portal/FormStatus";
import { sectionTitle } from "@/components/portal/portal-styles";
import { useAction } from "@/components/portal/useAction";
import {
  formatUploadError,
  uploadDocumentProgram,
  type UploadDocumentError,
} from "@/lib/effect/upload";

const STATUS_TEXT: Record<Doc<"minutes">["status"], string> = {
  draft: "Draft",
  published_for_review: "Out for a board vote",
  approved: "Approved by board vote",
};

/**
 * Minutes are approved by the board, not by one person: attach the minutes
 * file (PDF or Word), then send it to a vote. The vote is written consent, so
 * the minutes are approved only when every director votes yes.
 */
export function MinutesApproval({
  meeting,
  minutes,
  minutesFile,
  approvalMotion,
  isOfficer,
}: {
  meeting: Doc<"meetings">;
  minutes: Doc<"minutes"> | null;
  minutesFile: { title: string; url: string | null } | null;
  approvalMotion: { id: Id<"motions">; status: Doc<"motions">["status"] } | null;
  isOfficer: boolean;
}) {
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);
  const attachFile = useMutation(api.meetings.attachMinutesFile);
  const sendForApproval = useMutation(api.meetings.sendMinutesForApproval);
  const [file, setFile] = useState<File | null>(null);
  // Bumped after an upload to clear the file picker.
  const [fileKey, setFileKey] = useState(0);
  const attach = useAction("Uploaded and attached.");
  const send = useAction("Sent to the board for a vote.");

  const editable = !minutes || minutes.status === "draft";
  const held = meeting.status === "held";
  const hasContent = Boolean(minutesFile || minutes?.body?.trim());

  async function onAttach() {
    if (!file) return;
    const ok = await attach.run(async () => {
      const exit = await Effect.runPromiseExit(
        uploadDocumentProgram(
          { title: `Minutes: ${meeting.title}`, category: "meeting", file },
          {
            generateUploadUrl,
            saveDocument: (args) =>
              saveDocument({
                storageId: args.storageId as Id<"_storage">,
                title: args.title,
                category: "meeting",
                contentType: args.contentType,
                retentionClass: "permanent",
              }),
          },
        ),
      );
      if (Exit.isFailure(exit)) {
        const squashed = Cause.squash(exit.cause);
        throw new Error(
          squashed && typeof squashed === "object" && "_tag" in squashed
            ? formatUploadError(squashed as UploadDocumentError)
            : "Upload failed",
        );
      }
      await attachFile({
        meetingId: meeting._id,
        documentId: exit.value.documentId as Id<"documents">,
      });
      return true;
    });
    if (ok) {
      setFile(null);
      setFileKey((k) => k + 1);
    }
  }

  return (
    <section style={{ display: "grid", gap: 12, borderTop: "1px solid var(--border-strong)", paddingTop: 16 }}>
      <h3 style={{ ...sectionTitle, fontSize: 18 }}>Minutes approval</h3>
      <p style={{ margin: 0, fontSize: 15 }}>
        {minutes ? `Version ${minutes.version} · ${STATUS_TEXT[minutes.status]}` : "No minutes yet"}
        {minutes?.status === "approved" && minutes.certifiedAt
          ? ` on ${new Date(minutes.certifiedAt).toLocaleDateString()}`
          : ""}
      </p>

      {minutesFile ? (
        <p style={{ margin: 0, fontSize: 15 }}>
          {minutesFile.url ? (
            <a href={minutesFile.url} target="_blank" rel="noopener noreferrer" className="portal-row-link" style={{ color: "var(--link)" }}>
              {minutesFile.title}
            </a>
          ) : (
            minutesFile.title
          )}
        </p>
      ) : null}

      {approvalMotion ? (
        <Link href={`/portal/votes/${approvalMotion.id}`} style={{ color: "var(--link)", fontSize: 15, display: "inline-flex", alignItems: "center", minHeight: "var(--control-md)" }}>
          {approvalMotion.status === "open" ? "Read the minutes and vote" : "View the vote"}
        </Link>
      ) : null}

      {isOfficer && editable ? (
        <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            {minutesFile ? "Replace the minutes file (PDF or Word)" : "Minutes file (PDF or Word)"}
            <input
              key={fileKey}
              type="file"
              accept={ACCEPTED_UPLOAD_TYPES}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={onAttach} disabled={!file || send.pending} pending={attach.pending}>
              {attach.pending ? "Uploading…" : "Attach file"}
            </Button>
            <Button
              type="button"
              onClick={() => send.run(() => sendForApproval({ meetingId: meeting._id }))}
              disabled={!held || !hasContent || attach.pending}
              pending={send.pending}
            >
              {send.pending ? "Sending…" : "Send to board for approval"}
            </Button>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-body)" }}>
            Approval is by written consent: the minutes pass only when every director votes yes.
          </p>
          {!held ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              Mark the meeting as held before sending its minutes for approval.
            </p>
          ) : !hasContent ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              Attach the minutes file or enter the minutes text first.
            </p>
          ) : null}
        </div>
      ) : null}

      <FormStatus error={attach.error ?? send.error} status={attach.status ?? send.status} />
    </section>
  );
}

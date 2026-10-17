"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { panelStyle, pageTitle } from "@/components/portal/portal-styles";

export function PortalHome() {
  const year = new Date().getFullYear();
  const role = useQuery(api.board.myRole);
  const bootstrap = useMutation(api.board.bootstrapAdmin);
  const canLoadBoard = role !== undefined && role !== null && role !== "bootstrap_eligible";
  const dashboard = useQuery(
    api.compliance.getDashboard,
    canLoadBoard ? { year } : "skip",
  );

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1 style={pageTitle}>Board workspace</h1>
        <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.55, color: "var(--text-body)" }}>
          Three jobs: get paperwork for your CPA, run meetings and votes, stay compliant for Form 990.
        </p>
      </div>

      {role === "bootstrap_eligible" ? (
        <div style={panelStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>First-time setup</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            No board allowlist yet. Claim admin, then add director emails under Members. Public
            board roster JSON has no emails—add them here.
          </p>
          <Button type="button" onClick={() => bootstrap({})}>
            Claim admin for my account
          </Button>
        </div>
      ) : null}

      {role === null ? <RequestAccessPanel /> : null}

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        <JobCard
          href="/portal/reporting"
          title="1. Get paperwork"
          body="Download tax, policy, financial files and approved minutes for CPA or Form 990 prep."
          primary
        />
        <JobCard
          href="/portal/meetings"
          title="2. Do board work"
          body="Record attendance, draft and approve minutes, and cast votes on motions."
        />
        <JobCard
          href="/portal/compliance"
          title="3. Stay compliant"
          body="COI disclosures, policy checklist, Form 990 board review, and activity log."
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14 }}>
        <Link href="/portal/documents" style={{ color: "var(--link)" }}>
          Upload documents
        </Link>
        <Link href="/portal/votes" style={{ color: "var(--link)" }}>
          Open votes
        </Link>
        <Link href="/portal/coi" style={{ color: "var(--link)" }}>
          Annual COI
        </Link>
        {role === "admin" ? (
          <Link href="/portal/members" style={{ color: "var(--link)" }}>
            Members allowlist
          </Link>
        ) : null}
      </div>

      {dashboard ? (
        <div style={panelStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>{year} at a glance</p>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: 14 }}>
            <li>
              COI: {dashboard.coi.submitted} / {dashboard.coi.eligible}
              {dashboard.coi.complete ? " · complete" : " · incomplete"}
            </li>
            <li>
              Form 990 review:{" "}
              {dashboard.form990.boardReviewedBeforeFiled ? "recorded" : "not recorded"}
            </li>
            <li>
              Policies missing:{" "}
              {dashboard.policies.missing.length
                ? dashboard.policies.missing.join(", ")
                : "none"}
            </li>
            <li>Meetings without approved minutes: {dashboard.minutesGaps.length}</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function RequestAccessPanel() {
  const status = useQuery(api.board.myAccessRequest);
  const requestAccess = useMutation(api.board.requestAccess);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onRequest() {
    setError(null);
    setSending(true);
    try {
      await requestAccess({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your request");
    } finally {
      setSending(false);
    }
  }

  if (status === undefined) return null;

  if (status === "pending") {
    return (
      <div style={panelStyle} role="status">
        <p style={{ margin: 0, fontWeight: 600 }}>Request sent</p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          An admin will review your request. This page updates on its own once you are approved.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <p style={{ margin: 0, fontWeight: 600 }}>
        {status === "denied" ? "Access not approved" : "Request board access"}
      </p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
        {status === "denied"
          ? "An admin did not approve your last request. If this is a mistake, you can ask again."
          : "Your account is not on the board allowlist yet. Send a request and an admin will review it."}
      </p>
      {error ? (
        <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
          {error}
        </p>
      ) : null}
      <Button type="button" onClick={onRequest} disabled={sending}>
        {status === "denied" ? "Ask again" : "Request access"}
      </Button>
    </div>
  );
}

function JobCard({
  href,
  title,
  body,
  primary,
}: {
  href: string;
  title: string;
  body: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        ...panelStyle,
        textDecoration: "none",
        color: "inherit",
        borderColor: primary ? "var(--accent)" : "var(--border-strong)",
        minHeight: 140,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-body)" }}>
        {body}
      </p>
      <span style={{ fontSize: 14, color: "var(--link)", fontWeight: 500 }}>Open →</span>
    </Link>
  );
}

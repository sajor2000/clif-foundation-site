"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { panelStyle, pageTitle } from "@/components/portal/portal-styles";

export function PortalHome() {
  const year = new Date().getFullYear();
  const dashboard = useQuery(api.compliance.getDashboard, { year });
  const members = useQuery(api.board.listMembers);
  const role = useQuery(api.board.myRole);
  const bootstrap = useMutation(api.board.bootstrapAdmin);

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1 style={pageTitle}>Board workspace</h1>
        <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.55, color: "var(--text-body)" }}>
          Three jobs: get paperwork for your CPA, run meetings and votes, stay compliant for Form 990.
        </p>
      </div>

      {members !== undefined && members.length === 0 ? (
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

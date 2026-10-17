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
  const bootstrap = useMutation(api.board.bootstrapAdmin);

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1 style={pageTitle}>Board workspace</h1>
        <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.55, color: "var(--text-body)" }}>
          Download everything you need for Form 990, audits, and grant reporting from{" "}
          <Link href="/portal/reporting" style={{ color: "var(--link)" }}>
            Reporting pack
          </Link>
          . Upload new files under Documents.
        </p>
      </div>

      {members !== undefined && members.length === 0 ? (
        <div style={panelStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>First-time setup</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            No board allowlist yet. Claim admin to add director emails and roles.
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
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <QuickCard
          href="/portal/reporting"
          title="Reporting pack"
          body="Tax, policies, financials, and approved minutes with one-click downloads."
          primary
        />
        <QuickCard
          href="/portal/documents"
          title="All documents"
          body="Search, filter, and upload board files."
        />
        <QuickCard
          href="/portal/compliance"
          title="Compliance checklist"
          body="COI, policies, Form 990 review, and minutes gaps."
        />
        <QuickCard href="/portal/votes" title="Open votes" body="Cast ballots on pending motions." />
      </div>

      {dashboard ? (
        <div style={panelStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>{year} compliance snapshot</p>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: 14 }}>
            <li>
              COI disclosures: {dashboard.coi.submitted} / {dashboard.coi.eligible}{" "}
              {dashboard.coi.complete ? "· complete" : "· incomplete"}
            </li>
            <li>
              Form 990 board review:{" "}
              {dashboard.form990.boardReviewedBeforeFiled ? "recorded" : "not recorded"}
            </li>
            <li>
              Policies missing:{" "}
              {dashboard.policies.missing.length
                ? dashboard.policies.missing.join(", ")
                : "none"}
            </li>
            <li>Held meetings without approved minutes: {dashboard.minutesGaps.length}</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function QuickCard({
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
        borderColor: primary ? "var(--accent-mint)" : "var(--border-strong)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, fontSize: 17 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-body)" }}>
        {body}
      </p>
      <span style={{ fontSize: 14, color: "var(--link)", fontWeight: 500 }}>Open →</span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { POLICY_TYPES } from "../../../convex/lib/vocab";
import { panelStyle, pageTitle, sectionTitle } from "@/components/portal/portal-styles";

export function PortalHome() {
  const year = new Date().getFullYear();
  const role = useQuery(api.board.myRole);
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

      {role === "bootstrap_eligible" ? <ClaimAdminPanel /> : null}

      {role === null ? <RequestAccessPanel /> : null}

      {canLoadBoard ? (
        <>
          <ul style={hairlineList}>
            <JobRow
              href="/portal/reporting"
              title="Get paperwork"
              body="Tax, policy and financial files plus approved minutes, ready for your CPA or Form 990."
            />
            <JobRow
              href="/portal/meetings"
              title="Do board work"
              body="Record attendance, draft and approve minutes, and vote on motions."
            />
            <JobRow
              href="/portal/compliance"
              title="Stay compliant"
              body="Conflict of interest disclosures, the policy checklist, Form 990 review and the activity log."
            />
          </ul>

          <nav aria-label="Shortcuts" style={{ display: "flex", flexWrap: "wrap", columnGap: 20 }}>
            {[
              { href: "/portal/documents", label: "Upload documents" },
              { href: "/portal/votes", label: "Open votes" },
              { href: "/portal/coi", label: "Annual COI" },
              ...(role === "admin" ? [{ href: "/portal/members", label: "Members" }] : []),
            ].map((l) => (
              <Link key={l.href} href={l.href} style={shortcut}>
                {l.label}
              </Link>
            ))}
          </nav>
        </>
      ) : null}

      {dashboard ? (
        <section aria-labelledby="glance-heading" style={{ display: "grid", gap: 12, maxWidth: 680 }}>
          <h2 id="glance-heading" style={{ ...sectionTitle, fontSize: 20 }}>
            {year} at a glance
          </h2>
          <dl style={{ ...hairlineList, margin: 0 }}>
            <GlanceRow
              term="Conflict of interest disclosures"
              value={`${dashboard.coi.submitted} of ${dashboard.coi.eligible} ${dashboard.coi.eligible === 1 ? "director" : "directors"}${dashboard.coi.complete ? " · complete" : ""}`}
            />
            <GlanceRow
              term={`Form 990 review (tax year ${dashboard.form990.taxYear})`}
              value={dashboard.form990.boardReviewedBeforeFiled ? "Recorded" : "Not recorded"}
            />
            <GlanceRow
              term="Policies still to register"
              value={
                dashboard.policies.missing.length
                  ? dashboard.policies.missing.map(policyLabel).join(", ")
                  : "None"
              }
            />
            <GlanceRow
              term="Held meetings without approved minutes"
              value={String(dashboard.minutesGaps.length)}
            />
          </dl>
        </section>
      ) : null}
    </div>
  );
}

const hairlineList = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  borderTop: "1px solid var(--border-strong)",
  maxWidth: 880,
} as const;

const shortcut = {
  color: "var(--link)",
  fontSize: 15,
  display: "inline-flex",
  alignItems: "center",
  minHeight: "var(--control-md)",
} as const;

const policyLabel = (value: string) =>
  POLICY_TYPES.find((p) => p.value === value)?.label ?? value;

function JobRow({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <li style={{ borderBottom: "1px solid var(--border)" }}>
      <Link
        href={href}
        className="portal-job-row"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "4px 24px",
          alignItems: "center",
          padding: "20px 12px",
          textDecoration: "none",
          color: "inherit",
          minHeight: "var(--control-md)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.015em" }}>
          {title}
        </span>
        <span aria-hidden="true" style={{ gridRow: "1 / span 2", gridColumn: 2, color: "var(--link)", fontSize: 20 }}>
          →
        </span>
        <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text-body)", maxWidth: "62ch" }}>
          {body}
        </span>
      </Link>
    </li>
  );
}

function GlanceRow({ term, value }: { term: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "4px 16px",
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
        fontSize: 15,
      }}
    >
      <dt style={{ color: "var(--text-body)", flex: "1 1 14rem" }}>{term}</dt>
      <dd style={{ margin: 0, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </dd>
    </div>
  );
}

function ClaimAdminPanel() {
  const bootstrap = useMutation(api.board.bootstrapAdmin);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  async function onClaim() {
    setError(null);
    setClaiming(true);
    try {
      await bootstrap({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not claim admin");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div style={{ ...panelStyle, maxWidth: 640 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>First-time setup</p>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
        The board has no members yet. Claim admin for this account, then approve directors as they
        request access under Members.
      </p>
      {error ? (
        <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
          {error}
        </p>
      ) : null}
      <Button type="button" onClick={onClaim} disabled={claiming}>
        {claiming ? "Claiming…" : "Claim admin for my account"}
      </Button>
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


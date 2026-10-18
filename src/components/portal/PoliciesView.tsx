"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { POLICY_TYPES, type PolicyType } from "../../../convex/lib/vocab";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle } from "@/components/portal/portal-styles";

export function PoliciesView() {
  const policies = useQuery(api.policies.listPolicies);
  const role = useQuery(api.board.myRole);
  const isOfficer = role === "admin" || role === "secretary" || role === "chair";
  const register = useMutation(api.policies.registerPolicy);
  const closedMotions = useQuery(api.motions.listMotions, { status: "closed" });
  const passed = (closedMotions ?? []).filter((m) => m.tally.passed).map((m) => m.motion);
  const [motionId, setMotionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [policyType, setPolicyType] = useState<PolicyType>(POLICY_TYPES[0].value);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState(1);
  const [instructions, setInstructions] = useState("");

  async function onRegister() {
    setError(null);
    try {
      await register({
        policyType,
        title,
        version,
        reportingInstructions: instructions || undefined,
        motionId: passed.find((m) => m._id === motionId)?._id,
      });
      setTitle("");
      setMotionId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not register the policy");
    }
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Policy registry</h1>
      <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.55 }}>
        Register adopted governance policies and link each to the board motion that adopted it.
        Upload the signed PDF under Documents (category Governance policy).
      </p>

      {isOfficer ? (
      <div style={{ ...panelStyle, maxWidth: 520 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Register policy</p>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Policy type
          <select
            value={policyType}
            onChange={(e) =>
              setPolicyType(e.target.value as PolicyType)
            }
            style={inputStyle}
          >
            {POLICY_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Title
          <input
            placeholder="e.g. Conflict of interest policy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Version
          <input
            type="number"
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Reporting instructions (optional)
          <textarea
            placeholder="Where auditors can find the signed PDF"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            style={{ ...inputStyle, height: "auto", padding: 12 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Adopted by motion (recommended)
          <select value={motionId} onChange={(e) => setMotionId(e.target.value)} style={inputStyle}>
            <option value="">Not linked (adopted before the portal)</option>
            {passed.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
                {m.closedAt ? ` · ${new Date(m.closedAt).toLocaleDateString()}` : ""}
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
            {error}
          </p>
        ) : null}
        <Button type="button" onClick={onRegister} disabled={!title.trim()}>
          Register
        </Button>
      </div>
      ) : null}

      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {!policies ? (
          <li>Loading…</li>
        ) : (
          policies.map((p) => (
            <li
              key={p._id}
              style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}
            >
              <strong>{p.title}</strong> · v{p.version} · {p.policyType}
              {p.adoptedAt ? (
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {" "}
                  · adopted {new Date(p.adoptedAt).toLocaleDateString()}
                  {p.motionId ? " by board motion" : ""}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

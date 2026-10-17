"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { POLICY_TYPES, type PolicyType } from "../../../convex/lib/vocab";
import { Button } from "@/components/core/Button";
import { inputStyle, pageTitle, panelStyle } from "@/components/portal/portal-styles";

export function PoliciesView() {
  const policies = useQuery(api.policies.listPolicies);
  const register = useMutation(api.policies.registerPolicy);
  const [policyType, setPolicyType] = useState<PolicyType>(POLICY_TYPES[0].value);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState(1);
  const [instructions, setInstructions] = useState("");

  async function onRegister() {
    await register({
      policyType,
      title,
      version,
      reportingInstructions: instructions || undefined,
    });
    setTitle("");
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <h1 style={pageTitle}>Policy registry</h1>
      <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.55 }}>
        Register adopted governance policies. Upload the PDF under Documents (category Policy) and
        link the file later if needed.
      </p>

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
        <Button type="button" onClick={onRegister}>
          Register
        </Button>
      </div>

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
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { inputStyle } from "@/components/portal/portal-styles";

const MIN = 2000;
const MAX = 2100;

/**
 * A year input that doesn't query on every keystroke: typing "2025" would
 * otherwise ask for 2, 20 and 202 first and blank the page. The draft commits
 * on blur, Enter, or a short pause, and only within 2000–2100.
 */
export function YearField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (year: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [synced, setSynced] = useState(value);
  // Follow outside changes to the committed value (React's previous-render pattern).
  if (value !== synced) {
    setSynced(value);
    setDraft(String(value));
  }

  const parsed = Number(draft);
  const valid = /^\d{4}$/.test(draft) && parsed >= MIN && parsed <= MAX;

  useEffect(() => {
    if (!valid || parsed === value) return;
    const t = setTimeout(() => onCommit(parsed), 250);
    return () => clearTimeout(t);
  }, [draft, valid, parsed, value, onCommit]);

  function commit() {
    if (valid) onCommit(parsed);
    else setDraft(String(value));
  }

  return (
    <label style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14 }}>
      {label}
      <input
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        aria-invalid={!valid}
        style={{ ...inputStyle, width: 110 }}
      />
    </label>
  );
}

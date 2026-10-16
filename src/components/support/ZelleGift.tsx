"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { CONTACT_EMAIL, ZELLE_MEMO } from "@/lib/content";

const SUGGESTED_DOLLARS = [50, 100, 250, 500, 1000] as const;
const MIN_DOLLARS = 1;
const MAX_DOLLARS = 100_000;

function copyWithSelection(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

function dollars(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function ZelleGift({ recipient }: { recipient: string }) {
  const [amount, setAmount] = useState<number>(100);
  const [custom, setCustom] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"recipient" | "note" | null>(null);
  const [copyBlocked, setCopyBlocked] = useState(false);

  const amountLabel = dollars(amount);
  const note = [
    "Zelle",
    `To: ${recipient}`,
    `Amount: ${amountLabel}`,
    `Memo: ${ZELLE_MEMO}`,
  ].join("\n");

  const acknowledgmentHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "CLIF Foundation gift",
  )}&body=${encodeURIComponent(
    [
      "I sent a gift by Zelle.",
      "",
      "Name: ",
      `Amount: ${amountLabel}`,
      "Date: ",
      `Zelle address: ${recipient}`,
      `Memo: ${ZELLE_MEMO}`,
    ].join("\n"),
  )}`;

  function choosePreset(dollarsAmount: number) {
    setAmount(dollarsAmount);
    setCustom("");
    setAmountError(null);
  }

  function onCustomChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCustom(digits);
    if (digits === "") {
      setAmountError(null);
      return;
    }
    const next = Number(digits);
    if (next < MIN_DOLLARS || next > MAX_DOLLARS) {
      setAmountError(
        `Enter an amount from ${dollars(MIN_DOLLARS)} to ${dollars(MAX_DOLLARS)}.`,
      );
      return;
    }
    setAmount(next);
    setAmountError(null);
  }

  async function copy(text: string, which: "recipient" | "note") {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = copyWithSelection(text);
    }
    setCopied(ok ? which : null);
    setCopyBlocked(!ok);
    window.setTimeout(() => {
      setCopied(null);
      setCopyBlocked(false);
    }, 2000);
  }

  return (
    <section
      id="give"
      aria-labelledby="give-heading"
      style={{
        border: "1px solid var(--border-strong)",
        borderRadius: 6,
        background: "var(--bg-figure)",
        padding: "28px 24px",
        display: "grid",
        gap: 20,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <h3
          id="give-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "-0.01em",
          }}
        >
          Send a gift by Zelle
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--text-body)",
          }}
        >
          The transfer is completed in your bank. This page does not charge a
          card. If your bank cannot find the address below, email us and we
          will confirm the receiving details.
        </p>
      </div>

      <dl
        style={{
          margin: 0,
          display: "grid",
          gap: 0,
          borderTop: "1px solid var(--border-strong)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 4,
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <dt
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            to
          </dt>
          <dd style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{recipient}</dd>
        </div>
        <div
          style={{
            display: "grid",
            gap: 4,
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <dt
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            amount
          </dt>
          <dd style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{amountLabel}</dd>
        </div>
        <div
          style={{
            display: "grid",
            gap: 4,
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <dt
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            memo
          </dt>
          <dd style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{ZELLE_MEMO}</dd>
        </div>
      </dl>

      <fieldset
        style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 10 }}
      >
        <legend style={{ fontSize: 15, fontWeight: 500, padding: 0 }}>
          Amount to enter in your bank
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGESTED_DOLLARS.map((dollarsAmount) => {
            const selected = custom === "" && amount === dollarsAmount;
            return (
              <button
                key={dollarsAmount}
                type="button"
                aria-pressed={selected}
                onClick={() => choosePreset(dollarsAmount)}
                style={{
                  minHeight: 48,
                  padding: "0 16px",
                  borderRadius: 3,
                  border: "1px solid var(--border-strong)",
                  background: selected
                    ? "var(--action-primary-bg)"
                    : "transparent",
                  color: selected
                    ? "var(--action-primary-fg)"
                    : "var(--text-primary)",
                  font: "500 15px var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                {dollars(dollarsAmount)}
              </button>
            );
          })}
        </div>
        <label style={{ display: "grid", gap: 6, maxWidth: 220 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Other amount (USD)
          </span>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={custom}
            aria-invalid={amountError ? true : undefined}
            onChange={(event) => onCustomChange(event.target.value)}
            style={{
              minHeight: 48,
              padding: "0 12px",
              borderRadius: 3,
              border: "1px solid var(--border-strong)",
              background: "transparent",
              color: "var(--text-primary)",
              font: "500 16px var(--font-sans)",
            }}
          />
        </label>
        {amountError ? (
          <p role="alert" style={{ margin: 0, fontSize: 15, color: "var(--text-body)" }}>
            {amountError}
          </p>
        ) : null}
      </fieldset>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Button onClick={() => void copy(recipient, "recipient")}>
          {copied === "recipient" ? "Address copied" : "Copy Zelle address"}
        </Button>
        <Button variant="secondary" onClick={() => void copy(note, "note")}>
          {copied === "note" ? "Note copied" : "Copy transfer note"}
        </Button>
        <Button variant="secondary" href={acknowledgmentHref}>
          Email this gift
        </Button>
      </div>
      <p role="status" style={{ margin: 0, fontSize: 15, color: "var(--text-body)" }}>
        {copyBlocked
          ? "Copy is blocked in this browser. Select the address above and copy it manually."
          : copied === "recipient"
            ? "Zelle address copied."
            : copied === "note"
              ? "Transfer note copied."
              : "Enter this amount and memo in your bank’s Zelle screen."}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--text-body)",
        }}
      >
        Bank limits on Zelle vary. For a gift above your bank’s limit, or for a
        restricted gift, email {CONTACT_EMAIL} before you send. After a
        transfer, use “Email this gift” so we can send a written acknowledgment.
        Zelle may show a name rather than an email, and we can match the gift
        only when we can identify the donor.
      </p>
    </section>
  );
}

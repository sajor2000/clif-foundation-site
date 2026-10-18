"use client";

/**
 * The one status line for a form or control: errors are alerts; success is an
 * always-mounted polite live region, so screen readers announce it.
 */
export function FormStatus({ error, status }: { error?: string | null; status?: string | null }) {
  return (
    <>
      {error ? (
        <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
          {error}
        </p>
      ) : null}
      <p
        role="status"
        className="portal-status"
        style={{ margin: 0, minHeight: 0, fontSize: 14, color: "var(--accent-text)" }}
      >
        {status ?? ""}
      </p>
    </>
  );
}

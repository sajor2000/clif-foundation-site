"use client";

export function FilterChip({
  label,
  count,
  pressed = false,
  onClick,
}: {
  label: string;
  count?: number;
  pressed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="chip">
      {label}
      {count != null ? <span className="chip__count">{count}</span> : null}
    </button>
  );
}

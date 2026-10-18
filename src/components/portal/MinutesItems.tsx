"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/core/Button";
import { inputStyle, sectionTitle } from "@/components/portal/portal-styles";

/** Agenda items within a minutes version, each with any COI recusals. */
export function MinutesItems({
  minutes,
  items,
}: {
  minutes: Doc<"minutes">;
  items: Doc<"minutesItems">[];
}) {
  const members = useQuery(api.board.listMembers);
  const addItem = useMutation(api.meetings.addMinutesItem);
  const [title, setTitle] = useState("");
  const [discussion, setDiscussion] = useState("");
  const [recused, setRecused] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const directors = (members ?? []).filter((m) => m.isDirector);
  const editable = minutes.status !== "approved";
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  async function onAdd() {
    setError(null);
    try {
      await addItem({
        minutesId: minutes._id,
        title,
        discussion: discussion.trim() || undefined,
        sortOrder: (sorted.at(-1)?.sortOrder ?? 0) + 1,
        coiRecusals: recused,
      });
      setTitle("");
      setDiscussion("");
      setRecused([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the item");
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h3 style={{ ...sectionTitle, fontSize: 18 }}>Agenda items</h3>
      {sorted.length ? (
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
          {sorted.map((item) => (
            <li key={item._id}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              {item.discussion ? <p style={{ margin: "4px 0 0" }}>{item.discussion}</p> : null}
              {item.coiRecusals.length ? (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  Recused: {item.coiRecusals.join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>No agenda items yet.</p>
      )}

      {editable ? (
        <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Item title
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Discussion (optional)
            <textarea
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: 12 }}
            />
          </label>
          {directors.length ? (
            <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 6 }}>
              <legend style={{ fontSize: 14, marginBottom: 6 }}>Recused for a conflict of interest</legend>
              {directors.map((d) => (
                <label key={d.email} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, minHeight: 32 }}>
                  <input
                    type="checkbox"
                    checked={recused.includes(d.email)}
                    onChange={(e) =>
                      setRecused((prev) =>
                        e.target.checked ? [...prev, d.email] : prev.filter((x) => x !== d.email),
                      )
                    }
                  />
                  {d.displayName || d.email}
                </label>
              ))}
            </fieldset>
          ) : null}
          {error ? (
            <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
              {error}
            </p>
          ) : null}
          <Button type="button" variant="secondary" onClick={onAdd} disabled={!title.trim()}>
            Add agenda item
          </Button>
        </div>
      ) : null}
    </section>
  );
}

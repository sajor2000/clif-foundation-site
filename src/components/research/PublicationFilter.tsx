"use client";

import { useMemo, useState } from "react";
import { FilterChip } from "@/components/core/FilterChip";
import { PublicationRow } from "@/components/data/PublicationRow";
import { PUBLICATIONS, type PubType } from "@/lib/content";

type Filter = "All" | "Journals" | "Preprints";

const MAP: Record<Filter, PubType | null> = {
  All: null,
  Journals: "Journal",
  Preprints: "Preprint",
};

export function PublicationFilter() {
  const [filter, setFilter] = useState<Filter>("All");

  const pubs = useMemo(
    () => PUBLICATIONS.filter((p) => !MAP[filter] || p.type === MAP[filter]),
    [filter],
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(26px,2.8vw,36px)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Publications
        </h2>
        <div
          role="group"
          aria-label="Filter publications"
          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
        >
          {(Object.keys(MAP) as Filter[]).map((label) => (
            <FilterChip
              key={label}
              label={label}
              count={
                PUBLICATIONS.filter((p) => !MAP[label] || p.type === MAP[label])
                  .length
              }
              pressed={label === filter}
              onClick={() => setFilter(label)}
            />
          ))}
        </div>
      </div>
      <p
        aria-live="polite"
        style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        Showing {pubs.length} of {PUBLICATIONS.length} publications
      </p>
      <div className="hairline-list">
        {pubs.map((p) => (
          <PublicationRow
            key={p.url}
            year={p.year}
            title={p.title}
            venue={p.venue}
            type={p.type.toLowerCase()}
            href={p.url}
          />
        ))}
      </div>
    </div>
  );
}

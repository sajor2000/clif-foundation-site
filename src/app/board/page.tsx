import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BoardMemberList } from "@/components/board/BoardMemberList";
import { SiteShell } from "@/components/layout/SiteShell";
import {
  BOARD_DIRECTORS,
  BOARD_MEMBERS,
  BOARD_OFFICERS,
} from "@/lib/board";
import { GOVERNING_DOCS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Board & Governance",
  description:
    "The CLIF Foundation Board of Directors: members, roles and biographies for the Illinois nonprofit supporting the Common Longitudinal ICU data Format.",
  path: "/board",
});

export default function BoardPage() {
  return (
    <SiteShell current="board">
      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(56px,8vw,112px)",
          paddingBottom: "clamp(40px,5vw,64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 72px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 560px", display: "grid", gap: 24 }}>
          <span className="eyebrow">04 / board_and_governance</span>
          <h1 className="display-l">Board of directors</h1>
        </div>
        <p
          style={{
            flex: "1 1 360px",
            margin: 0,
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-body)",
            borderLeft: "1px solid var(--border-strong)",
            paddingLeft: 20,
          }}
        >
          The CLIF Foundation Board of Directors has {BOARD_MEMBERS.length}{" "}
          members. Roles and biographies are listed below.
        </p>
      </section>

      <section
        className="page-wrap"
        style={{ paddingBottom: "clamp(48px,6vw,72px)" }}
      >
        <div
          style={{
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-panel)",
            background: "var(--bg-figure)",
            overflow: "hidden",
          }}
        >
          {/* Explicit roles keep table semantics when the rows stack on phones. */}
          <table className="board-roster" role="table">
            <caption className="sr-only">CLIF Foundation board: seat, name, and affiliation</caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">seat</th>
                <th scope="col" role="columnheader">name</th>
                <th scope="col" role="columnheader">affiliation</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {[...BOARD_OFFICERS, ...BOARD_DIRECTORS].map((member) => (
                <tr key={member.id} role="row">
                  <td role="cell" className="board-roster__seat">{member.role}</td>
                  <th scope="row" role="rowheader" className="board-roster__name">{member.name}</th>
                  <td role="cell" className="board-roster__affiliation">{member.affiliation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="directors"
        className="page-wrap"
        style={{ paddingBottom: "clamp(72px,8vw,112px)" }}
      >
        <div style={{ display: "grid", gap: 20, marginBottom: 8 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--type-display-m)",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Directors
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--text-body)",
              maxWidth: 640,
            }}
          >
            Biographies are paraphrased from public institutional and
            professional sources.
          </p>
        </div>
        <BoardMemberList members={BOARD_MEMBERS} />
      </section>

      <section className="band">
        <div
          className="page-wrap"
          style={{
            paddingTop: "clamp(72px,8vw,112px)",
            paddingBottom: "clamp(72px,8vw,112px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "40px 72px",
          }}
        >
          <div
            style={{
              flex: "1 1 400px",
              display: "grid",
              gap: 16,
              alignContent: "start",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "var(--type-display-m)",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              Relationship to the Consortium
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-body)",
                maxWidth: 520,
              }}
            >
              The CLIF Consortium maintains its own governance for research, data,
              and the standard. The Foundation’s role is limited to supporting
              adoption.
            </p>
            <a
              href="https://clif-icu.com/governance"
              className="linkish"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consortium governance ↗
            </a>
          </div>
          <div style={{ flex: "1 1 440px" }} className="hairline-list">
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-muted)",
                padding: "14px 0",
              }}
            >
              governing_documents
            </span>
            {GOVERNING_DOCS.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 16px",
                  justifyContent: "space-between",
                  minHeight: 60,
                  padding: "12px 0",
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 17 }}>{d.name}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

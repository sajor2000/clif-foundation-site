import Image from "next/image";
import type { BoardMember } from "@/lib/board";

export function BoardMemberList({ members }: { members: BoardMember[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderTop: "1px solid var(--border-strong)",
      }}
    >
      {members.map((member) => (
        <li
          key={member.id}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(96px, 120px) minmax(0, 1fr)",
            gap: "20px 28px",
            padding: "28px 0",
            borderBottom: "1px solid var(--border)",
            alignItems: "start",
          }}
        >
          <Image
            src={member.imageSrc}
            alt={member.imageAlt}
            width={120}
            height={120}
            sizes="120px"
            style={{
              width: "100%",
              maxWidth: 120,
              height: "auto",
              aspectRatio: "1",
              objectFit: "cover",
              borderRadius: 4,
              background: "var(--bg-figure)",
              border: "1px solid var(--border-subtle)",
            }}
          />
          <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {member.nameWithCredentials}
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 16px",
                fontSize: 15,
                color: "var(--text-muted)",
              }}
            >
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {member.role}
              </span>
              {member.affiliation ? <span>{member.affiliation}</span> : null}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--text-body)",
                maxWidth: 720,
              }}
            >
              {member.bio}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

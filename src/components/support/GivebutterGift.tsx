"use client";

import { CONTACT_EMAIL } from "@/lib/content";
import type { GivebutterEmbed } from "@/lib/givebutter";

export function GivebutterGift({ embed }: { embed: GivebutterEmbed }) {
  return (
    <section
      id="give"
      aria-labelledby="give-heading"
      className="givebutter-panel"
    >
      <div className="givebutter-panel__intro">
        <p className="eyebrow" style={{ margin: 0 }}>
          Secure online gift
        </p>
        <h2
          id="give-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Give to CLIF Foundation
        </h2>
        <p
          style={{
            margin: 0,
            maxWidth: "42rem",
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-body)",
          }}
        >
          Processed by Givebutter — card and other methods available on this
          form. You receive an emailed receipt immediately. We keep donor
          records in Givebutter so we can resend acknowledgment details for
          your files.
        </p>
      </div>
      <div className="givebutter-panel__form">
        {embed.kind === "widget" ? (
          <givebutter-widget id={embed.id} />
        ) : (
          <givebutter-giving-form campaign={embed.campaign} max-width="100%" />
        )}
      </div>
      <p className="givebutter-panel__footnote">
        For a pledge, named purpose, or institutional gift, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="linkish">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </section>
  );
}

/** Donor-facing placeholder when no widget ID or campaign code is set yet. */
export function GivebutterNotConfigured() {
  return (
    <section
      id="give"
      aria-labelledby="give-heading"
      className="givebutter-panel givebutter-panel--pending"
    >
      <div className="givebutter-panel__intro">
        <p className="eyebrow" style={{ margin: 0 }}>
          Online giving
        </p>
        <h2
          id="give-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Give to CLIF Foundation
        </h2>
        <p
          style={{
            margin: 0,
            maxWidth: "42rem",
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-body)",
          }}
        >
          The online form will appear here shortly. To give now, or to discuss a
          pledge or restricted gift, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="linkish">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

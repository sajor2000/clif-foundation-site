import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/core/Button";
import { SiteShell } from "@/components/layout/SiteShell";
import { CopyEmailButton } from "@/components/support/CopyEmailButton";
import { InquiryForm } from "@/components/support/InquiryForm";
import { ZelleGift } from "@/components/support/ZelleGift";
import {
  CONTACT_EMAIL,
  GIFT_PROGRAMS,
  SUPPORT_PATHS,
  TAX_STATUS_GIVING,
  ZELLE_MEMO,
  zelleRecipient,
} from "@/lib/content";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <SiteShell current="support">
      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(56px,8vw,120px)",
          paddingBottom: "clamp(56px,6vw,96px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 80px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 560px", display: "grid", gap: 24 }}>
          <span className="eyebrow">05 / support</span>
          <h1
            className="display-xl"
            style={{ fontSize: "var(--type-display-xl)" }}
          >
            Send a gift from your bank.
          </h1>
        </div>
        <div style={{ flex: "1 1 380px", display: "grid", gap: 20 }}>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--text-body)",
            }}
          >
            Send a gift by Zelle to the Foundation bank account, or email us to
            discuss a larger gift, a partnership, or another way to help.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button href={`mailto:${CONTACT_EMAIL}`} size="lg">
              {CONTACT_EMAIL}
            </Button>
            <CopyEmailButton />
          </div>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "grid",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
            gap: 16,
          }}
        >
          {SUPPORT_PATHS.map((p) => (
            <div
              key={p.n}
              style={{
                display: "grid",
                gridTemplateRows: "auto auto 1fr auto",
                gap: 12,
                padding: "22px 20px",
                border: "1px solid var(--border-strong)",
                borderRadius: 6,
                background: "var(--bg-figure)",
              }}
            >
              <span className="eyebrow" style={{ fontSize: 12 }}>
                {p.n}
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {p.who}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: "var(--text-body)",
                }}
              >
                {p.body}
              </p>
              <a
                href={p.href}
                {...(p.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="linkish"
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  marginTop: 8,
                }}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <InquiryForm />
          <ZelleGift recipient={zelleRecipient()} />
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 72px",
        }}
      >
        <div
          style={{
            flex: "1 1 360px",
            display: "grid",
            gap: 14,
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
            What a gift funds
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--text-body)",
              textWrap: "pretty",
            }}
          >
            Four programs aimed at scaling CLIF adoption beyond observational
            research. Gifts support implementation help, education, open-source
            stewardship, and convening.
          </p>
          <Link href="/our-work" className="linkish">
            Program details
          </Link>
        </div>
        <ul
          style={{
            flex: "1 1 520px",
            margin: 0,
            padding: 0,
            listStyle: "none",
            borderTop: "1px solid var(--border-strong)",
          }}
        >
          {GIFT_PROGRAMS.map((p) => (
            <li
              key={p.n}
              style={{
                padding: "20px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 20px",
              }}
            >
              <span
                style={{
                  flex: "0 0 32px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "var(--link)",
                  paddingTop: 4,
                }}
              >
                {p.n}
              </span>
              <div style={{ flex: "1 1 320px", display: "grid", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 500 }}>{p.t}</span>
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "var(--text-body)",
                  }}
                >
                  {p.d}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="band">
        <div
          className="page-wrap"
          style={{
            paddingTop: "clamp(72px,8vw,104px)",
            paddingBottom: "clamp(72px,8vw,104px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "40px 72px",
          }}
        >
          <div
            style={{
              flex: "1 1 360px",
              display: "grid",
              gap: 14,
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
              How giving works
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-body)",
                textWrap: "pretty",
              }}
            >
              A gift can be sent now with Zelle. A larger or restricted gift still
              starts with a short email.
            </p>
          </div>
          <ol
            style={{
              flex: "1 1 520px",
              margin: 0,
              padding: 0,
              listStyle: "none",
              borderTop: "1px solid var(--border-strong)",
            }}
          >
            {[
              [
                "1",
                "Send with Zelle",
                `In your bank, send the gift to ${zelleRecipient()} and use the memo “${ZELLE_MEMO}”.`,
              ],
              [
                "2",
                "Tell us who you are",
                `Email ${CONTACT_EMAIL} with your name, the amount, and the date. We use that to send a written acknowledgment.`,
              ],
              [
                "3",
                "Larger or restricted gifts",
                "For a pledge, a named purpose, or a gift above your bank’s Zelle limit, write first. Purpose and timing are confirmed in writing before you transfer.",
              ],
              [
                "4",
                "Tax status, stated plainly",
                TAX_STATUS_GIVING,
              ],
            ].map(([n, t, d]) => (
              <li
                key={n}
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 20px",
                }}
              >
                <span
                  style={{
                    flex: "0 0 32px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "var(--link)",
                    paddingTop: 4,
                  }}
                >
                  {n}
                </span>
                <div style={{ flex: "1 1 320px", display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 500 }}>{t}</span>
                  <span
                    style={{
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: "var(--text-body)",
                    }}
                  >
                    {d}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(72px,8vw,104px)",
          paddingBottom: "clamp(72px,8vw,104px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 72px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 360px", display: "grid", gap: 14 }}>
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
            Who is behind it
          </h2>
        </div>
        <div
          style={{
            flex: "1 1 520px",
            display: "grid",
            gap: 18,
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-body)",
            maxWidth: 720,
          }}
        >
          <p style={{ margin: 0 }}>
            CLIF was built by the CLIF Consortium, a network of clinician-scientists
            and data scientists at academic medical centers. CLIF Foundation was
            incorporated in Illinois to scale adoption beyond observational
            research: tools, mapping, training, and implementation help that
            research grants do not cover.
          </p>
          <p style={{ margin: 0 }}>
            The Board of Directors is listed on the board page. Governing
            documents will be published there when adopted.
          </p>
          <Link href="/board" className="linkish">
            Board and governance →
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Cause, Effect, Exit } from "effect";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/core/Button";
import {
  formatUploadError,
  uploadDocumentProgram,
  type UploadDocumentError,
} from "@/lib/effect/upload";

const CATEGORIES = ["governance", "legal", "meeting", "other"] as const;

function clerkReady() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function convexReady() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export function DocumentPortal() {
  if (!clerkReady()) {
    return (
      <PortalFrame>
        <StatusPanel
          title="Clerk not configured"
          body="Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable the board portal. Public pages work without Clerk."
        />
      </PortalFrame>
    );
  }

  if (!convexReady()) {
    return (
      <PortalFrame>
        <StatusPanel
          title="Convex not configured"
          body="Set NEXT_PUBLIC_CONVEX_URL (from npx convex dev) to load board documents."
        />
      </PortalFrame>
    );
  }

  return <AuthenticatedPortal />;
}

function AuthenticatedPortal() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <PortalFrame>
        <StatusPanel title="Loading portal…" body="Checking board session." />
      </PortalFrame>
    );
  }

  if (!isSignedIn) {
    return (
      <PortalFrame>
        <StatusPanel
          title="Board sign-in required"
          body="This route is for board members. Sign in with your Clerk account."
          action={<Button href="/portal/sign-in">Sign in</Button>}
        />
      </PortalFrame>
    );
  }

  return <DocumentWorkspace />;
}

function DocumentWorkspace() {
  const docs = useQuery(api.documents.listDocuments);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("governance");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUploading(true);

    const exit = await Effect.runPromiseExit(
      uploadDocumentProgram(
        { title, category, file },
        {
          generateUploadUrl,
          saveDocument: (args) =>
            saveDocument({
              ...args,
              storageId: args.storageId as Id<"_storage">,
            }),
        },
      ),
    );

    setUploading(false);

    if (Exit.isSuccess(exit)) {
      setTitle("");
      setFile(null);
      return;
    }

    const squashed = Cause.squash(exit.cause);
    if (
      squashed &&
      typeof squashed === "object" &&
      "_tag" in squashed
    ) {
      setError(formatUploadError(squashed as UploadDocumentError));
      return;
    }
    setError("Upload failed");
  }

  return (
    <PortalFrame>
      <div style={{ display: "grid", gap: 40 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--type-display-m)",
            letterSpacing: "-0.02em",
          }}
        >
          Board documents
        </h1>
        <section style={{ display: "grid", gap: 16 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 28,
            }}
          >
            Upload a document
          </h2>
          <form
            onSubmit={onUpload}
            style={{
              display: "grid",
              gap: 14,
              maxWidth: 520,
              border: "1px solid var(--border-strong)",
              borderRadius: 6,
              padding: 20,
              background: "var(--bg-figure)",
            }}
          >
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Title{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                (required)
              </span>
              <input
                name="title"
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                aria-required="true"
                maxLength={200}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Category
              <select
                name="category"
                autoComplete="off"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as (typeof CATEGORIES)[number])
                }
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              File
              <input
                name="file"
                type="file"
                autoComplete="off"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>
            {error ? (
              <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload document"}
            </Button>
          </form>
        </section>

        <section style={{ display: "grid", gap: 16 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 28,
            }}
          >
            Documents
          </h2>
          {docs === undefined ? (
            <p style={{ color: "var(--text-muted)" }}>Loading documents…</p>
          ) : docs.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No documents yet. Upload the first board file above.
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                borderTop: "1px solid var(--border-strong)",
              }}
            >
              {docs.map((doc) => (
                <DocumentRow key={doc._id} doc={doc} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </PortalFrame>
  );
}

function DocumentRow({
  doc,
}: {
  doc: {
    _id: Id<"documents">;
    title: string;
    category: string;
    storageId: Id<"_storage">;
    contentType: string;
    createdAt: number;
  };
}) {
  const url = useQuery(api.documents.getDocumentUrl, {
    storageId: doc.storageId,
  });

  return (
    <li
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 24px",
        padding: "18px 0",
        borderBottom: "1px solid var(--border)",
        alignItems: "baseline",
      }}
    >
      <span style={{ flex: "1 1 240px", fontWeight: 500, fontSize: 17 }}>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--link)" }}>
            {doc.title} ↗
          </a>
        ) : (
          doc.title
        )}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        {doc.category}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        {new Date(doc.createdAt).toISOString().slice(0, 10)}
      </span>
    </li>
  );
}

function PortalFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <a className="skip-link" href="#portal-main">
        Skip to content
      </a>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "18px var(--gutter)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            CLIF Foundation board portal
          </p>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            /portal · not linked from public navigation
          </span>
        </div>
        <Link
          href="/"
          style={{
            color: "var(--link)",
            fontWeight: 500,
            textUnderlineOffset: 3,
          }}
        >
          Public site →
        </Link>
      </header>
      <main
        id="portal-main"
        className="page-wrap"
        tabIndex={-1}
        style={{ paddingTop: 48, paddingBottom: 80, outline: "none" }}
      >
        {children}
      </main>
    </div>
  );
}

function StatusPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-strong)",
        borderRadius: 6,
        background: "var(--bg-figure)",
        padding: 28,
        display: "grid",
        gap: 14,
        maxWidth: 560,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, color: "var(--text-body)", lineHeight: 1.55 }}>{body}</p>
      {action}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: "0 12px",
  border: "1px solid var(--border-strong)",
  borderRadius: 3,
  background: "var(--bg-page)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
};

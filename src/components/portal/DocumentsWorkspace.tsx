"use client";

import { useMutation, useQuery } from "convex/react";
import { Cause, Effect, Exit } from "effect";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ACCEPTED_UPLOAD_TYPES } from "../../../convex/lib/uploads";
import { Button } from "@/components/core/Button";
import {
  DOCUMENT_CATEGORIES,
  RETENTION_CLASSES,
  type DocumentCategory,
} from "../../../convex/lib/vocab";
import {
  formatUploadError,
  uploadDocumentProgram,
  type UploadDocumentError,
} from "@/lib/effect/upload";
import { FormStatus } from "@/components/portal/FormStatus";
import { inputStyle, pageTitle, sectionTitle } from "@/components/portal/portal-styles";
import { useAction } from "@/components/portal/useAction";
import { useStickyQuery } from "@/components/portal/useStickyQuery";

function isCategory(v: string): v is DocumentCategory {
  return DOCUMENT_CATEGORIES.some((c) => c.value === v);
}

export function DocumentsWorkspace() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") ?? "";
  const urlFilter = isCategory(urlCategory) ? urlCategory : "";
  const [filterOverride, setFilterOverride] = useState<DocumentCategory | "" | null>(
    null,
  );
  const categoryFilter = filterOverride ?? urlFilter;
  const [search, setSearch] = useState("");
  // Query on a pause in typing, not every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);
  const [showArchived, setShowArchived] = useState(false);
  // Keep the current list on screen (dimmed) while a new filter loads.
  const { data: docs, stale } = useStickyQuery(api.documents.listDocuments, {
    category: categoryFilter || undefined,
    search: debouncedSearch || undefined,
    archived: showArchived || undefined,
  });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);
  const archiveDocument = useMutation(api.documents.archiveDocument);
  const restoreDocument = useMutation(api.documents.restoreDocument);
  const setLegalHold = useMutation(api.documents.setLegalHold);
  const role = useQuery(api.board.myRole);
  // Officers manage the library; directors read it.
  const canManageDocs = role === "admin" || role === "secretary" || role === "chair";

  const [title, setTitle] = useState("");
  const [categoryOverride, setCategoryOverride] = useState<DocumentCategory | null>(
    null,
  );
  const category = categoryOverride ?? (urlFilter || "governance");
  const [retentionClass, setRetentionClass] =
    useState<(typeof RETENTION_CLASSES)[number]["value"]>("permanent");
  const [taxYear, setTaxYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const upload = useAction("Uploaded.");
  const rowAction = useAction();
  const [busy, setBusy] = useState<string | null>(null);
  // Bumped after an upload to clear the file picker.
  const [fileKey, setFileKey] = useState(0);

  async function onRow(key: string, fn: () => Promise<unknown>, message: string) {
    setBusy(key);
    await rowAction.run(fn, message);
    setBusy(null);
  }

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    const ok = await upload.run(async () => {
      const exit = await Effect.runPromiseExit(
        uploadDocumentProgram(
          { title, category, file },
          {
            generateUploadUrl,
            saveDocument: async (args) => {
              return await saveDocument({
                storageId: args.storageId as Id<"_storage">,
                title: args.title,
                category: args.category as DocumentCategory,
                contentType: args.contentType,
                retentionClass,
                taxYear: taxYear ? Number(taxYear) : undefined,
                reportingTag: category === "tax" ? "form_990" : undefined,
              });
            },
          },
        ),
      );
      if (Exit.isSuccess(exit)) return true;
      const squashed = Cause.squash(exit.cause);
      throw new Error(
        squashed && typeof squashed === "object" && "_tag" in squashed
          ? formatUploadError(squashed as UploadDocumentError)
          : "Upload failed",
      );
    });
    if (ok) {
      setTitle("");
      setFile(null);
      setFileKey((k) => k + 1);
    }
  }

  return (
    <div style={{ display: "grid", gap: 36 }}>
      <h1 style={pageTitle}>Documents</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 220px" }}
          aria-label="Search documents"
        />
        <select
          value={categoryFilter}
          onChange={(e) =>
            setFilterOverride(e.target.value as DocumentCategory | "")
          }
          style={{ ...inputStyle, flex: "0 1 200px" }}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {canManageDocs ? (
      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={sectionTitle}>Upload</h2>
        <form
          onSubmit={onUpload}
          style={{
            display: "grid",
            gap: 14,
            maxWidth: 560,
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-panel)",
            padding: 20,
            background: "var(--bg-figure)",
          }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Title (required)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Category
            <select
              value={category}
              onChange={(e) =>
                setCategoryOverride(e.target.value as DocumentCategory)
              }
              style={inputStyle}
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Retention
            <select
              value={retentionClass}
              onChange={(e) =>
                setRetentionClass(
                  e.target.value as (typeof RETENTION_CLASSES)[number]["value"],
                )
              }
              style={inputStyle}
            >
              {RETENTION_CLASSES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            Tax year (optional)
            <input
              type="number"
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
            File (required)
            <input
              key={fileKey}
              type="file"
              required
              accept={ACCEPTED_UPLOAD_TYPES}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <FormStatus error={upload.error} status={upload.status} />
          <Button type="submit" pending={upload.pending}>
            {upload.pending ? "Uploading…" : "Upload document"}
          </Button>
        </form>
      </section>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "baseline" }}>
          <h2 style={sectionTitle}>{showArchived ? "Archived" : "Library"}</h2>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, minHeight: 44 }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show archived documents (hidden, never deleted)
          </label>
        </div>
        <FormStatus error={rowAction.error} status={rowAction.status} />
        {docs === undefined ? (
          <p style={{ color: "var(--text-muted)" }}>Loading documents…</p>
        ) : docs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No documents match.</p>
        ) : (
          <ul
            aria-busy={stale || undefined}
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              borderTop: "1px solid var(--border-strong)",
              opacity: stale ? 0.6 : 1,
            }}
          >
            {docs.map((doc) => (
              <li
                key={doc._id}
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span style={{ flex: "1 1 240px", fontWeight: 500 }}>
                  {doc.downloadUrl ? (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-row-link"
                      style={{ color: "var(--link)" }}
                    >
                      {doc.title} ↗
                    </a>
                  ) : (
                    doc.title
                  )}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                  {DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.label ?? doc.category}
                  {doc.taxYear ? ` · ${doc.taxYear}` : ""}
                  {doc.legalHold ? " · on legal hold" : ""}
                </span>
                {canManageDocs ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      pending={busy === `hold:${doc._id}`}
                      onClick={() =>
                        onRow(
                          `hold:${doc._id}`,
                          () => setLegalHold({ documentId: doc._id, legalHold: !doc.legalHold }),
                          doc.legalHold ? "Legal hold cleared." : "Legal hold set.",
                        )
                      }
                    >
                      {doc.legalHold ? "Clear hold" : "Legal hold"}
                    </Button>
                    {showArchived ? (
                      <Button
                        type="button"
                        variant="ghost"
                        pending={busy === `restore:${doc._id}`}
                        onClick={() =>
                          onRow(`restore:${doc._id}`, () => restoreDocument({ documentId: doc._id }), "Restored to the library.")
                        }
                      >
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={doc.legalHold}
                          aria-describedby={doc.legalHold ? `hold-reason-${doc._id}` : undefined}
                          pending={busy === `archive:${doc._id}`}
                          onClick={() =>
                            onRow(`archive:${doc._id}`, () => archiveDocument({ documentId: doc._id }), "Archived. Find it under Show archived.")
                          }
                        >
                          Archive
                        </Button>
                        {doc.legalHold ? (
                          <span id={`hold-reason-${doc._id}`} className="sr-only">
                            Clear the legal hold before archiving.
                          </span>
                        ) : null}
                      </>
                    )}
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

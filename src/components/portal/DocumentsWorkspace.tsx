"use client";

import { useMutation, useQuery } from "convex/react";
import { Cause, Effect, Exit } from "effect";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
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
import { inputStyle, pageTitle, sectionTitle } from "@/components/portal/portal-styles";

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
  const [showArchived, setShowArchived] = useState(false);
  const docs = useQuery(api.documents.listDocuments, {
    category: categoryFilter || undefined,
    search: search.trim() || undefined,
    archived: showArchived || undefined,
  });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);
  const archiveDocument = useMutation(api.documents.archiveDocument);
  const restoreDocument = useMutation(api.documents.restoreDocument);
  const setLegalHold = useMutation(api.documents.setLegalHold);
  const role = useQuery(api.board.myRole);
  const canManageDocs = role === "admin" || role === "secretary";

  const [title, setTitle] = useState("");
  const [categoryOverride, setCategoryOverride] = useState<DocumentCategory | null>(
    null,
  );
  const category = categoryOverride ?? (urlFilter || "governance");
  const [retentionClass, setRetentionClass] =
    useState<(typeof RETENTION_CLASSES)[number]["value"]>("permanent");
  const [taxYear, setTaxYear] = useState("");
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
          saveDocument: async (args) => {
            return await saveDocument({
              storageId: args.storageId as Id<"_storage">,
              title: args.title,
              category: args.category as DocumentCategory,
              contentType: args.contentType,
              retentionClass,
              taxYear: taxYear ? Number(taxYear) : undefined,
              reportingTag:
                category === "tax" ? "form_990" : undefined,
            });
          },
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
    if (squashed && typeof squashed === "object" && "_tag" in squashed) {
      setError(formatUploadError(squashed as UploadDocumentError));
      return;
    }
    setError("Upload failed");
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

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={sectionTitle}>Upload</h2>
        <form
          onSubmit={onUpload}
          style={{
            display: "grid",
            gap: 14,
            maxWidth: 560,
            border: "1px solid var(--border-strong)",
            borderRadius: 6,
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
              type="file"
              required
              accept={ACCEPTED_UPLOAD_TYPES}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
        {docs === undefined ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : docs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No documents match.</p>
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
                      style={{ color: "var(--link)" }}
                    >
                      {doc.title} ↗
                    </a>
                  ) : (
                    doc.title
                  )}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                  {doc.category}
                  {doc.taxYear ? ` · ${doc.taxYear}` : ""}
                  {doc.legalHold ? " · hold" : ""}
                </span>
                {canManageDocs ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setLegalHold({ documentId: doc._id, legalHold: !doc.legalHold })
                      }
                    >
                      {doc.legalHold ? "Clear hold" : "Legal hold"}
                    </Button>
                    {showArchived ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          restoreDocument({ documentId: doc._id }).catch((e: Error) =>
                            setError(e.message),
                          )
                        }
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={doc.legalHold}
                        onClick={() =>
                          archiveDocument({ documentId: doc._id }).catch((e: Error) =>
                            setError(e.message),
                          )
                        }
                      >
                        Archive
                      </Button>
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

import { Data, Effect } from "effect";
import {
  InvalidDocumentMeta,
  validateDocumentMeta,
  type DocumentMeta,
} from "@/lib/effect/documents";

export class MissingUploadFile extends Data.TaggedError("MissingUploadFile")<{
  reason: string;
}> {}

export class UploadRequestFailed extends Data.TaggedError(
  "UploadRequestFailed",
)<{
  status: number;
  reason: string;
}> {}

export class SaveDocumentFailed extends Data.TaggedError("SaveDocumentFailed")<{
  reason: string;
}> {}

export type UploadDocumentError =
  | MissingUploadFile
  | InvalidDocumentMeta
  | UploadRequestFailed
  | SaveDocumentFailed;

export type UploadDocumentDeps = {
  generateUploadUrl: () => Promise<string>;
  saveDocument: (args: {
    storageId: string;
    title: string;
    category: DocumentMeta["category"];
    contentType: string;
  }) => Promise<unknown>;
};

/**
 * Effect 4 portal upload pipeline (client-side, outside Convex UDFs):
 * validate meta → generate URL → POST file → saveDocument.
 */
export function uploadDocumentProgram(
  input: { title: string; category: string; file: File | null },
  deps: UploadDocumentDeps,
) {
  return Effect.gen(function* () {
    if (!input.file) {
      return yield* new MissingUploadFile({
        reason: "Choose a file to upload.",
      });
    }

    const file = input.file;
    const meta = yield* validateDocumentMeta({
      title: input.title,
      category: input.category,
      contentType: file.type || "application/octet-stream",
    });

    const uploadUrl = yield* Effect.tryPromise({
      try: () => deps.generateUploadUrl(),
      catch: (e) =>
        new UploadRequestFailed({
          status: 0,
          reason: e instanceof Error ? e.message : "Failed to get upload URL",
        }),
    });

    const storageId = yield* Effect.tryPromise({
      try: async () => {
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": meta.contentType },
          body: file,
        });
        if (!result.ok) {
          throw new UploadRequestFailed({
            status: result.status,
            reason: `Upload failed (${result.status})`,
          });
        }
        const json = (await result.json()) as { storageId?: string };
        if (!json.storageId) {
          throw new UploadRequestFailed({
            status: result.status,
            reason: "Upload response missing storageId",
          });
        }
        return json.storageId;
      },
      catch: (e) => {
        if (e instanceof UploadRequestFailed) return e;
        return new UploadRequestFailed({
          status: 0,
          reason: e instanceof Error ? e.message : "Upload failed",
        });
      },
    });

    yield* Effect.tryPromise({
      try: () =>
        deps.saveDocument({
          storageId,
          title: meta.title,
          category: meta.category,
          contentType: meta.contentType,
        }),
      catch: (e) =>
        new SaveDocumentFailed({
          reason: e instanceof Error ? e.message : "Failed to save document",
        }),
    });

    return { storageId, meta } as const;
  });
}

export function formatUploadError(error: UploadDocumentError): string {
  switch (error._tag) {
    case "MissingUploadFile":
      return error.reason;
    case "InvalidDocumentMeta":
      return `Invalid document metadata: ${error.reason}`;
    case "UploadRequestFailed":
      return error.reason;
    case "SaveDocumentFailed":
      return error.reason;
    default: {
      const _exhaustive: never = error;
      return String(_exhaustive);
    }
  }
}

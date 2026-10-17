import { Data, Effect, Schema } from "effect";

export class InvalidDocumentMeta extends Data.TaggedError(
  "InvalidDocumentMeta",
)<{
  reason: string;
}> {}

const DocumentMeta = Schema.Struct({
  title: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(200)),
  category: Schema.Literals([
    "governance",
    "legal",
    "meeting",
    "policy",
    "tax",
    "financial",
    "other",
  ]),
  contentType: Schema.String,
});

export type DocumentMeta = typeof DocumentMeta.Type;

/** Effect 4 Schema validation for portal document upload metadata. */
export const validateDocumentMeta = (input: unknown) =>
  Schema.decodeUnknownEffect(DocumentMeta)(input).pipe(
    Effect.mapError(
      (e) => new InvalidDocumentMeta({ reason: String(e.message ?? e) }),
    ),
  );

export async function validateDocumentMetaPromise(input: unknown) {
  return Effect.runPromise(validateDocumentMeta(input));
}

import { Data, Effect, Schema } from "effect";
import { CONTACT_EMAIL } from "@/lib/content";

export class InvalidInquiry extends Data.TaggedError("InvalidInquiry")<{
  reason: string;
}> {}

const Inquiry = Schema.Struct({
  name: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(120)),
  organization: Schema.optional(
    Schema.String.check(Schema.isMaxLength(200)),
  ),
  kind: Schema.Literals(["gift", "partnership", "program", "other"]),
  message: Schema.optional(Schema.String.check(Schema.isMaxLength(4000))),
});

export type Inquiry = typeof Inquiry.Type;

/** Validate Support-page inquiry fields before opening a mailto: link. */
export const validateInquiry = (input: unknown) =>
  Schema.decodeUnknownEffect(Inquiry)(input).pipe(
    Effect.mapError(
      (e) => new InvalidInquiry({ reason: String(e.message ?? e) }),
    ),
  );

export function inquiryMailto(inquiry: Inquiry): string {
  const subject = encodeURIComponent(
    `CLIF Foundation inquiry (${inquiry.kind}): ${inquiry.name}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${inquiry.name}`,
      inquiry.organization ? `Organization: ${inquiry.organization}` : null,
      `Kind: ${inquiry.kind}`,
      "",
      inquiry.message ?? "",
    ]
      .filter((line) => line !== null)
      .join("\n"),
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export async function runValidateInquiry(input: unknown) {
  return Effect.runPromiseExit(validateInquiry(input));
}

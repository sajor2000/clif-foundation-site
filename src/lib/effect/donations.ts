import { Data, Effect, Schema } from "effect";

export class DonationsNotConfigured extends Data.TaggedError(
  "DonationsNotConfigured",
)<{
  reason: string;
}> {}

export class InvalidDonationRequest extends Data.TaggedError(
  "InvalidDonationRequest",
)<{
  reason: string;
}> {}

const DonationRequest = Schema.Struct({
  amountCents: Schema.optional(
    Schema.Number.check(Schema.isGreaterThan(0), Schema.isLessThan(10_000_000)),
  ),
  email: Schema.optional(Schema.String),
});

export type DonationRequest = typeof DonationRequest.Type;

/**
 * Legacy Stripe Checkout entrypoint (Effect 4).
 * Public giving uses Givebutter on /support#give. This route stays as a typed
 * 503 so old clients fail clearly.
 */
export const createDonationSession = (input: unknown = {}) =>
  Effect.gen(function* () {
    const request = yield* Schema.decodeUnknownEffect(DonationRequest)(
      input,
    ).pipe(
      Effect.mapError(
        (e) =>
          new InvalidDonationRequest({
            reason: String(e.message ?? e),
          }),
      ),
    );

    void request;
    return yield* new DonationsNotConfigured({
      reason:
        "Online gifts are processed on /support via Givebutter. Card checkout via this API is not available.",
    });
  });

export async function runCreateDonationSession(input: unknown = {}) {
  return Effect.runPromiseExit(createDonationSession(input));
}

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
 * Future Stripe Checkout entrypoint (Effect 4).
 * Until STRIPE_SECRET_KEY + nonprofit bank setup exist, fails typed.
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

    if (!process.env.STRIPE_SECRET_KEY) {
      return yield* new DonationsNotConfigured({
        reason: "Online giving is not available yet",
      });
    }

    // Later: stripe.checkout.sessions.create with pay-what-you-want Price
    // using request.amountCents / request.email when present.
    void request;
    return yield* new DonationsNotConfigured({
      reason: "Online giving is not available yet",
    });
  });

export async function runCreateDonationSession(input: unknown = {}) {
  return Effect.runPromiseExit(createDonationSession(input));
}

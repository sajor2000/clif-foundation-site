import { Data, Effect } from "effect";

export class DonationsNotConfigured extends Data.TaggedError(
  "DonationsNotConfigured",
)<{}> {}

/**
 * Future Stripe Checkout entrypoint.
 * Until STRIPE_SECRET_KEY + nonprofit bank setup exist, always fails typed.
 */
export const createDonationSession = Effect.gen(function* () {
  if (!process.env.STRIPE_SECRET_KEY) {
    return yield* new DonationsNotConfigured();
  }
  // Later: stripe.checkout.sessions.create with pay-what-you-want Price
  return yield* new DonationsNotConfigured();
});

export async function runCreateDonationSession() {
  return Effect.runPromiseExit(createDonationSession);
}

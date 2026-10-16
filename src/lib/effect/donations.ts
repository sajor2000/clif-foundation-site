import { Data, Effect, Schema } from "effect";
import { CONTACT_EMAIL, ZELLE_MEMO, zelleRecipient } from "@/lib/content";

export class InvalidDonationRequest extends Data.TaggedError(
  "InvalidDonationRequest",
)<{
  reason: string;
}> {}

const DonationRequest = Schema.Struct({
  amountCents: Schema.optional(
    Schema.Number.check(Schema.isGreaterThan(0), Schema.isLessThan(100_000_000)),
  ),
});

export type ZelleInstructions = {
  method: "zelle";
  recipient: string;
  memo: string;
  amountCents?: number;
  acknowledgmentEmail: string;
};

/**
 * Giving instructions for a bank Zelle transfer.
 * Card checkout is not offered: there is no Stripe account connected.
 */
export const createDonationInstructions = (input: unknown = {}) =>
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

    if (
      request.amountCents !== undefined &&
      !Number.isInteger(request.amountCents)
    ) {
      return yield* new InvalidDonationRequest({
        reason: "Amount must be a whole number of cents",
      });
    }

    if (request.amountCents !== undefined && request.amountCents < 100) {
      return yield* new InvalidDonationRequest({
        reason: "Minimum gift is 100 cents ($1.00)",
      });
    }

    const instructions: ZelleInstructions = {
      method: "zelle",
      recipient: zelleRecipient(),
      memo: ZELLE_MEMO,
      acknowledgmentEmail: CONTACT_EMAIL,
    };

    if (request.amountCents !== undefined) {
      instructions.amountCents = request.amountCents;
    }

    return instructions;
  });

export async function runCreateDonationInstructions(input: unknown = {}) {
  return Effect.runPromiseExit(createDonationInstructions(input));
}

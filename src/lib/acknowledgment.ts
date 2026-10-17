import { CONTACT_EMAIL } from "@/lib/content";

/**
 * Fields Givebutter (and IRS gift acknowledgments) should include once
 * 501(c)(3) recognition is granted. Until then, receipts must not claim
 * deductibility.
 */
export type GiftAcknowledgmentFields = {
  donorName: string;
  amountFormatted: string;
  giftDate: string;
  method: string;
  goodsOrServices: "none";
};

export function giftAcknowledgmentLetter(
  fields: GiftAcknowledgmentFields,
): string {
  return [
    "CLIF Foundation",
    "Illinois nonprofit corporation",
    "",
    `Dear ${fields.donorName},`,
    "",
    `Thank you for your gift of ${fields.amountFormatted} on ${fields.giftDate}, received via ${fields.method}.`,
    "",
    "No goods or services were provided in exchange for this gift.",
    "",
    "CLIF Foundation is an Illinois nonprofit corporation with an EIN. Our application for 501(c)(3) recognition is pending with the IRS. Until a determination letter is issued, we cannot promise that this gift is tax-deductible. Please consult your tax adviser.",
    "",
    "If recognition is granted effective as of our formation date, some gifts made earlier may qualify under IRS rules. We will update donors when status changes.",
    "",
    "Sincerely,",
    "CLIF Foundation",
    CONTACT_EMAIL,
  ].join("\n");
}

/** Paste into Givebutter → Campaign → Thank You / receipt message. */
export const GIVEBUTTER_THANK_YOU_MESSAGE = `Thank you for supporting CLIF Foundation.

You will receive an emailed receipt from Givebutter with your gift amount and date. No goods or services were provided in exchange for this gift.

CLIF Foundation is an Illinois nonprofit corporation. Our application for 501(c)(3) recognition is pending with the IRS. Until a determination letter is issued, we cannot promise that your gift is tax-deductible. Please consult your tax adviser.

Questions or a written acknowledgment for your files: ${CONTACT_EMAIL}`;

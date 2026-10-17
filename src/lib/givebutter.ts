/** Public Givebutter account ID from the widget install snippet. */
const DEFAULT_ACCOUNT_ID = "htqR98I4GhNJ6AiT";

export function givebutterAccountId(): string | null {
  const value = process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT_ID?.trim();
  return value || DEFAULT_ACCOUNT_ID;
}

/** Campaign code from Givebutter → Campaign → Widgets / embed. */
export function givebutterCampaignCode(): string | null {
  const value = process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_CODE?.trim();
  return value ? value : null;
}

export function isGivebutterConfigured(): boolean {
  return Boolean(givebutterAccountId() && givebutterCampaignCode());
}

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

/** Widget ID from a `<givebutter-widget id="…">` embed (Givebutter's newer snippet). */
export function givebutterWidgetId(): string | null {
  const value = process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID?.trim();
  return value ? value : null;
}

export type GivebutterEmbed =
  | { kind: "widget"; id: string }
  | { kind: "form"; campaign: string };

/** The embed to render on /support: a widget ID wins over a campaign code. */
export function givebutterEmbed(): GivebutterEmbed | null {
  if (!givebutterAccountId()) return null;
  const widgetId = givebutterWidgetId();
  if (widgetId) return { kind: "widget", id: widgetId };
  const campaign = givebutterCampaignCode();
  if (campaign) return { kind: "form", campaign };
  return null;
}

export function isGivebutterConfigured(): boolean {
  return givebutterEmbed() !== null;
}

# Givebutter setup

Public online giving uses [Givebutter](https://givebutter.com) on `/support#give`. Donor records and emailed receipts live in Givebutter CRM.

## 1. Widget account (already wired)

The site loads:

```html
<script async src="https://widgets.givebutter.com/latest.umd.cjs?acct=htqR98I4GhNJ6AiT&p=other"></script>
```

Override with `NEXT_PUBLIC_GIVEBUTTER_ACCOUNT_ID` only if the account changes.

## 2. Widget ID (required for the form)

The live site uses the **CLIF Foundation** campaign's giving widget (`LPkWmy`).

1. In Givebutter, open the campaign → **Sharing / Widgets** → the giving form → **Embed**.
2. The snippet looks like `<givebutter-widget id="LPkWmy"></givebutter-widget>`. Copy the `id`.
3. Set on Vercel (Production + Preview) and in `.env.local`, then redeploy (the value is built into the page):

```bash
NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID=LPkWmy
```

Older `<givebutter-giving-form campaign="…">` snippets still work through `NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_CODE`; the widget ID wins if both are set.

Without either variable, `/support` shows a polite “form coming shortly” message and points donors to `info@clificufoundation.org`.

## 3. Thank-you / receipt copy

Paste the message from `GIVEBUTTER_THANK_YOU_MESSAGE` in `src/lib/acknowledgment.ts` into Givebutter → Campaign → Thank You (or receipt settings).

Until a 501(c)(3) determination letter is posted, receipts must **not** claim tax deductibility.

## 4. Donor records

- Givebutter stores gifts, amounts, dates, and donor contact details.
- Export from Givebutter CRM when you need a ledger for accounting or to resend acknowledgments.
- For pledges or institutional gifts outside the form, use email and keep your own note.

## 5. Optional API key

`GIVEBUTTER_API_KEY` is reserved for a future server sync. It is not required for the public embed.

## Local check

```bash
echo 'NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID=LPkWmy' >> .env.local
npm run dev
# open http://127.0.0.1:43127/support#give
```

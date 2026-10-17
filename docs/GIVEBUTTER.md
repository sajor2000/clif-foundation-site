# Givebutter setup

Public online giving uses [Givebutter](https://givebutter.com) on `/support#give`. Donor records and emailed receipts live in Givebutter CRM.

## 1. Widget account (already wired)

The site loads:

```html
<script async src="https://widgets.givebutter.com/latest.umd.cjs?acct=htqR98I4GhNJ6AiT&p=other"></script>
```

Override with `NEXT_PUBLIC_GIVEBUTTER_ACCOUNT_ID` only if the account changes.

## 2. Campaign code (required for the form)

1. In Givebutter, open the CLIF Foundation campaign.
2. Create or open a **Giving Form** widget.
3. Copy the **campaign** code from the embed snippet (for example `campaign="XXXX"`).
4. Set on Vercel (Production + Preview) and in `.env.local`:

```bash
NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_CODE=XXXX
```

Without this variable, `/support` shows a polite “form coming shortly” message and points donors to `info@clificufoundation.org`.

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
echo 'NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_CODE=your-code' >> .env.local
npm run dev
# open http://127.0.0.1:43127/support#give
```

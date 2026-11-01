# n8n: send the checked quote

The checking happens in the app. This workflow takes the checked quote as JSON, has Gemini draft the WhatsApp message for the dealer, checks that draft, and emails both to the sales lead.

**The repetitive step:** once a quote is fixed, someone still retypes it into a WhatsApp message for the dealer. That retyping is where the old 12% creeps back in. Gemini writes the message from the checked lines only, and a Code node rejects it if it contains any number that isn't on those lines (then a plain template is used).

**Trigger:** the app's Send button (webhook). No schedule.

**Alternatives we considered:** sending straight to the dealer through the WhatsApp Business API (needs Meta approval and a verified number, and we want a human to forward it); a daily digest (doesn't stop today's wrong quote).

## Nodes

1. **Webhook** (POST `/proofquote-send`)
2. **Build Gemini request** (Code). Refuses a quote with no checked lines.
3. **Gemini: draft WhatsApp message** (HTTP Request to `gemini-2.0-flash`). On error, the flow continues with the template.
4. **Check message, render email** (Code). Every number in Gemini's draft must appear in the quote lines.
5. **Gmail to sales lead**
6. **Respond** with `{ ok, via, to, note }`

## Set up

1. n8n → Workflows → Import from file → `proofquote-send.json` (regenerate with `node scripts/build-n8n.cjs`)
2. **Gemini node:** create a *Header Auth* credential, name `x-goog-api-key`, value = your Google AI Studio key
3. **Gmail node:** attach your Gmail OAuth credential
4. Activate, copy the production webhook URL into `.env` as `VITE_N8N_WEBHOOK=...`, restart `npm run dev`
5. Send a quote from the app, open the execution in n8n, screenshot it for slide 13

Without the webhook, the app's dev server does the same three things locally (Gemini or OpenAI if a key is set, the same number check, the same HTML) and writes `public/n8n-last-run.html` and `n8n/last-run.json`. Nothing is emailed in that mode.

## Payload

```json
{
  "pack": {
    "to": "ravi.sales@goyaldistributors.in",
    "quote_no": "Q-1042",
    "party": "Sharma Traders, Ambala",
    "lines": [
      { "line": "400 kg MS angle 50x50x6 at ₹62 per kg", "list": "MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216." }
    ],
    "removed": [
      { "line": "GST 12% on MS angle (Sharma special)", "list": "MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216." }
    ],
    "footer": "Every rate above appears on this week's price list. Checked by Proofquote (AI-assisted); approved by the sales lead."
  }
}
```

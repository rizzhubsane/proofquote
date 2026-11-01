# Proofquote

Checks a distributor's draft quote against this week's price list before it goes to the dealer. Every ₹ rate, GST % and HSN code in the draft has to be on the price-list line for that item. Lines that aren't stay flagged, and Send stays off until they're removed.

JGBS MBA 2026, AI Tools for Business, end-term project. Team: read [HANDOVER.md](HANDOVER.md) first.

```bash
npm install
cp .env.example .env   # optional: add your own OPENAI_API_KEY or GEMINI_API_KEY
npm run dev            # http://localhost:5173/
npm run eval           # 16-line golden set for the citation rule
npm run deck           # rebuilds endterm/Proofquote-EndTerm.pptx
node scripts/shots.mjs # re-captures app screenshots into endterm/shots (dev server must be running)
```

| Route | What |
|---|---|
| `#/` | Landing page |
| `#/app` | Checker with the sample quote (Goyal Distributors → Sharma Traders, Q-1042) |
| `#/app?mode=tester` | Checker with empty boxes, for your own list and draft |
| `#/film` | Captioned 2-minute film |
| `/n8n-last-run.html` | The last email the send step rendered |

## How it works

| Step | Code | Model? |
|---|---|---|
| Extractor: split the draft into one line per rate or term | `src/lib/pipeline.ts` | Optional. With a key, the model splits messy drafts. Without one, it's line by line. |
| Citation checker: find the list line, check every ₹ / % / HSN / number | `src/lib/cite.ts` | Never. Plain code. |
| Pack writer: quote lines next to their list lines | `src/lib/cite.ts` (`buildPack`) | Never. |
| Critic: hold Send while anything is off the list | `src/Product.tsx` | Never. |
| Send: WhatsApp draft, then email to the sales lead | `n8n/proofquote-send.json` | Gemini drafts the dealer message from the checked lines. The next node rejects it if it adds any number, and the template is used instead. |

The model's output is never trusted directly. A model line whose numbers aren't in the draft is thrown away, and every line goes through the same check as the no-model path.

Keys live in `.env` on the dev server only. Never prefix them with `VITE_`, which would ship them to the browser.

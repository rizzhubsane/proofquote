# Proofquote: team handover

JGBS MBA 2026 · AI Tools for Business · End Term Group Assessment
Presentations Mon 2 Nov and Wed 4 Nov · LMS upload Wed 4 Nov, 23:59 · 30 marks (20 team, 10 viva)

This zip has no API key in it. Use your own, keep it in `.env`, and never paste it into the deck, LMS, GitHub or WhatsApp.

## The product in one paragraph

Ravi does inside sales at a steel and hardware distributor. Sharma, a dealer, messages: "12% lagao, 18 nahi chalega." Ravi's price list says GST 18%. The draft he's about to send says 12%. Proofquote takes the price list and the draft as two separate inputs. For every line in the draft it finds the price-list line for that item and checks that every ₹ amount, GST %, HSN code and number in the draft is on it. The 12% isn't, so it's flagged with what the list actually says, and Send stays off until Ravi removes it. The checked quote goes out by email with each rate printed next to the list line behind it.

Tagline: **No list, no rate.** Positioning: other tools write the quote; Proofquote checks it.

## Run it

```bash
npm install
cp .env.example .env
npm run dev        # open http://localhost:5173/ (localhost, not 127.0.0.1)
npm run eval       # should print precision 1.00, recall 1.00 on 16 lines
```

`.env` (all optional):

```
OPENAI_API_KEY=     # or GEMINI_API_KEY=. Server-side only.
VITE_N8N_WEBHOOK=   # production webhook from n8n, once Gmail is wired
```

Without a key, the app still works: the extractor goes line by line instead of using a model, and the check is identical. Without the webhook, Send renders the email to `/n8n-last-run.html` and does not email anyone. Say so if asked.

## Viva click-through (about 90 seconds)

1. Landing: point at the hero. "The dealer asked for 12. The list says 18."
2. **Check a sample quote**. Both boxes are pre-filled. Point out they're separate: the list is the source of truth, the draft is what gets checked.
3. **Check the draft against the list**. Three lines pass. Two don't: `GST 12% on MS angle (Sharma special)` and `15% festive scheme discount`. Each shows why and what the list says.
4. Read the run log on the right: four steps, in order, once. The last line says which path ran (rules only, or model plus rules).
5. **Review quote**. Send is off. Go back, remove both lines, review again.
6. The quote now shows each line next to its list line, and the two removed lines struck through. Footer discloses the AI-assisted check.
7. **Send**. Open the email link.

Likely questions:

- *Why not one prompt?* A prompt that's asked for 12% will write 12%. Splitting the draft is a language job; deciding if a rate is on the list is not, so we keep that in code the model can't override.
- *What does the model actually do?* It turns a messy draft ("angle 400 kilo @62, gst 12 laga do") into clean lines. If it adds a number that isn't in the draft, we throw that line away.
- *What if the list line is formatted oddly?* It's flagged as not on the list. We'd rather stop a true line than pass a false one. That's the known weakness; see the risks slide.

## What's done

| Assignment part | Where |
|---|---|
| 3.1 Agentic app | Deck slides 5–6, 8 · `src/` · four steps in `src/lib/pipeline.ts`, rule in `src/lib/cite.ts` |
| 3.2 BMC | Deck slide 4 · `endterm/bmc.md` |
| 3.3 DT → MVP → test | Deck slides 2–3 and 7–10 · `endterm/test-card.md` · `npm run eval` |
| 3.4 Launch video + multimedia | Deck slides 11–12 · no-voice cut `endterm/Proofquote-launch-remotion.mp4` (clicks + original music) · voiced fallback `endterm/Proofquote-launch-2min.mp4` · logo, banner, landing · AI video prompt in `endterm/video-prompt.md` |
| 3.5 n8n | Deck slide 13 · `n8n/proofquote-send.json` · `n8n/README.md` |
| 3.6 Ethics + governance | Deck slides 14–15 · `endterm/ethics.md` |
| Proof of artifacts | `endterm/proof-of-artifacts.md` |

## What the group still has to do

1. **Names.** Slide 1 and slide 16 say "Member 1–6". Edit `TEAM` at the top of `scripts/build-deck.cjs`, run `npm run deck`.
2. **Your launch video.** A 2:00 cut with no voiceover is ready: `endterm/Proofquote-launch-remotion.mp4` (clicks and an original music bed). Rebuild it with `npm --prefix video run render`. The voiced fallback is `endterm/Proofquote-launch-2min.mp4`. Or cut your own from `endterm/video-prompt.md`. Put the one you use on slide 11.
3. **A public URL.** `npm run build` and deploy `dist/` (Netlify or Vercel). Note: `/api/extract` and `/api/send` are dev-server middleware, so the deployed build runs on rules only and needs `VITE_N8N_WEBHOOK` to send. Set `TEAM.appUrl` in `scripts/build-deck.cjs` (it appears on slides 8 and 16) and update `proof-of-artifacts.md`.
4. **Real Gmail run (recommended).** Import the n8n JSON, attach Gmail OAuth, activate, set `VITE_N8N_WEBHOOK`, restart, send once, screenshot the n8n execution. Replace the email screenshot and its local-run caption on slide 13.
5. **The classmate test**, if there's time: 6–10 people, the protocol is in `endterm/test-card.md`. If you run it, put real numbers on slide 10. If you don't, leave it marked "not run".
6. **LMS upload** by 4 Nov 23:59.

## Don't say these in the viva

- "We interviewed distributors." We didn't. The persona and quotes are built from public sources and labelled as such.
- "Users finished in X minutes." The user test hasn't run.
- "It emails the dealer." It emails the sales lead, and only once n8n is wired.
- "It checks GSTINs." It doesn't. That's on the roadmap.
- "The eval proves it works." It proves the rule does what we say on 16 lines we wrote. It is not a benchmark.

## File map

```
src/lib/cite.ts            the rule (read this before the viva)
src/lib/pipeline.ts        the four steps, and how model output is re-checked
src/lib/eval.ts            16-line golden set
src/lib/dummy.ts           sample list + draft
server/geminiPlugin.ts     /api/extract (OpenAI or Gemini) and /api/send
n8n/proofquote-send.json   import into n8n
scripts/build-deck.cjs     the deck (17 slides; npm run deck rebuilds it)
scripts/shots.mjs          screenshots used in the deck
endterm/                   deck, both films, BMC, ethics, test card, video prompt, proof list
video/                     the Remotion cut. `npm --prefix video run render`
```

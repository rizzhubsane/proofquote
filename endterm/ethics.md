# Proofquote: risks, ethics and governance

## Risks we know about

| Risk | What happens | What we do |
|---|---|---|
| False alarm | A true line is flagged because the list line is formatted differently (a PDF table, a code in another column). | Strict on purpose: a stopped true line costs Ravi a minute; a passed false line costs a reissued invoice. He can add the list line and re-check. |
| False pass | A wrong rate passes because the number shows up on the list line for another reason. | The check needs the same item and every number. The golden set includes shaved prices and borrowed rates. It's 16 lines we wrote, so this is not proven on real drafts yet. |
| Model invents a line | The extractor adds a rate the draft never had. | Lines with numbers not in the draft are thrown away before the check. |
| Stale list | Ravi pastes last week's list. | Not handled. The quote footer says "this week's price list"; the sales lead is accountable for that. Roadmap: date-stamp the list. |
| GSTIN errors | A shortened GSTIN blocks the buyer's input credit. | Not checked. Roadmap. |
| Over-trust | "Proofquote passed it" replaces judgment on discounts the list doesn't cover. | The tool never fills in a rate, and a human approves every send. |

## Data and privacy (DPDP Act, 2023)

- The demo uses made-up companies and people. No real price list ships with the app.
- Nothing is stored server-side. With a model key, the list and draft go to OpenAI or Google for the extract step; tell testers that before they paste real data.
- Get written consent before a classmate pastes a real price list. Delete test inputs, n8n executions and sent emails within 24 hours.
- The email goes to the sales lead only, never to the dealer.

## Keys

API keys and n8n credentials live in `.env` and n8n's credential store. `.env` is gitignored, the handover zip ships without one, and the LLM key is never `VITE_`-prefixed, so it never reaches the browser.

## Synthetic media and labelling

- The persona (Ravi) and the companies are fictional and composited from public sources. No interviews were run; we say so on the slide.
- The launch still and any AI-generated video shots are labelled on screen. No avatar of a real person, no cloned voice.
- The emailed quote says: "Checked by Proofquote (AI-assisted); approved by the sales lead."

## Accountability

The sales lead who presses Send is responsible for the quote. Proofquote's job is to make sure that person sees every off-list line first.

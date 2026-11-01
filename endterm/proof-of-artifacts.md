# Proof of artifacts

Every artifact the brief asks for, and where to find it. Until there's a public URL, links are `http://localhost:5173` after `npm run dev`. Replace them once deployed.

| Brief | Artifact | Where | Status |
|---|---|---|---|
| 3.1 | Working app | `#/app` (sample quote) · `#/app?mode=tester` (your own) | Runs locally. Public URL: not yet |
| 3.1 | The four steps | `src/lib/pipeline.ts` · `endterm/crew-roles.json` | Done |
| 3.1 | The rule | `src/lib/cite.ts` (`supports`) · deck slides 5–6 | Done |
| 3.2 | Business model canvas | Deck slide 4 · `endterm/bmc.md` | Done, with sources |
| 3.3 | Problem → insight → MVP | Deck slides 2–3 and 7–8 | Done. Persona is composited from public sources, labelled |
| 3.3 | Test metric, actually run | `npm run eval` → precision 1.00, recall 1.00 on 16 lines · deck slide 9 | Run 2 Nov 2026 |
| 3.3 | Test card | `endterm/test-card.md` · deck slide 10 | User test: not run |
| 3.4 | 2-minute video | Deck slide 11 · no-voice cut: `endterm/Proofquote-launch-remotion.mp4` · voiced fallback: `endterm/Proofquote-launch-2min.mp4` · prompt: `endterm/video-prompt.md` | Both cuts done; group cut can replace either |
| 3.4 | Logo, banner, landing | `public/brand/logo.svg` · `public/brand/banner-1x1.svg` · `#/` · `endterm/shots/landing.png` | Done |
| 3.4 | Competitive line | "Other tools write the quote. Proofquote checks it." Deck slide 12 | Done |
| 3.5 | n8n workflow | `n8n/proofquote-send.json` · `n8n/README.md` · deck slide 13 | Done |
| 3.5 | Execution proof | Local render: `/n8n-last-run.html` · `endterm/shots/email.png` | Local only. Gmail run pending |
| 3.6 | Risks, ethics, governance | Deck slides 14–15 · `endterm/ethics.md` · footer on every emailed quote | Done |
| 5 | Deck | `endterm/Proofquote-EndTerm.pptx` (`npm run deck`), 17 slides | Done; team names pending |

App screenshots used in the deck: `endterm/shots/` (re-capture with `node scripts/shots.mjs` while the dev server runs).

## Before uploading to LMS

- [ ] Team names in the deck (`TEAM` in `scripts/build-deck.cjs`, then `npm run deck`)
- [ ] Public URL in the deck and in this file
- [ ] Group's launch video on slide 11 (or the fallback mp4)
- [ ] n8n Gmail execution screenshot on slide 13, or keep the "local render" label
- [ ] User-test numbers on slide 10, or keep "not run"

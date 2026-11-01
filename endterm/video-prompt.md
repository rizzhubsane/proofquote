# Prompt for an AI video maker

Two versions. Use **A** with script-to-video tools that build a whole video (InVideo AI, Canva, Pictory, CapCut). Use **B** with clip generators (Veo, Sora, Runway, Kling, Luma) and edit the clips together yourself.

One rule for both: **don't let the AI draw the app or the numbers.** Generated video garbles on-screen text, and a fake UI is exactly what Proofquote exists to stop. Every shot of the product should be a real screen recording of `localhost:5173/#/app`, and every number should be added as a text overlay in the editor.

---

## A. One prompt, whole video

```
Make a 2-minute product launch video for "Proofquote", a tool that checks a distributor's draft sales quote against this week's price list before it is sent.

Audience: owners and sales heads of steel, hardware and building-material distributors in North India who quote dealers over WhatsApp.

Tone: calm, specific, a little dry. Like a good documentary short, not an ad. No hype words ("revolutionary", "seamless", "unlock", "supercharge", "AI-powered"). No upbeat stock music; use a sparse piano or low ambient bed, quiet under the voice.

Look: warm, low evening light, paper and ink. Colour palette: off-white paper #F3EFE4, near-black ink #1C1914, a single stamp red #9A1F1F for anything wrong, a dark green #1F4D3A for anything correct. Serif typography for on-screen text (Georgia or similar). No gradients, no glowing particles, no floating 3D icons, no robots, no holograms.

People: one Indian man in his late 20s, plain shirt, at a small office desk at night. Fictional. Do not resemble any real person. No talking-head avatar and no lip-synced speech; he never speaks to camera.

Story (keep this order and these exact words for on-screen text):
1. 0:00–0:15  Night, small distributor office in Ambala, steel rods and paint tins on a shelf. Phone buzzes with a chat message. On-screen text: "12% lagao, 18 nahi chalega."
2. 0:15–0:35  Close on a printed price list. On-screen text: "Price list: GST 18%". Then the draft quote on a laptop. On-screen text: "Draft: GST 12%". Voice-over says the quote becomes the invoice.
3. 0:35–1:20  [PLACEHOLDER: I will insert my own screen recording here.] Leave a 45-second gap with a plain paper-coloured background and these lower-third titles: "Paste the price list and the draft" / "Every rate must be on the list" / "12% isn't on the list"
4. 1:20–1:40  [PLACEHOLDER: my screen recording of the Send screen and the email.] Title: "Send stays shut until it's fixed"
5. 1:40–1:55  Back to the man. He presses send, closes the laptop, turns off the desk lamp.
6. 1:55–2:00  Black screen, white serif text: "Other tools write the quote. Proofquote checks it." then "No list, no rate."

Voice-over: Indian English, male or female, unhurried. Script:
"Nine forty at night. Ravi does inside sales at a steel distributor in Ambala. Sharma Traders wants four hundred kilos of angle and twenty litres of primer. Then a WhatsApp: twelve percent lagao, eighteen nahi chalega.
Ravi's price list says GST eighteen percent. The draft he's about to send says twelve. It reads like a normal quote. And whatever is on the quote becomes the invoice.
Proofquote takes two things: this week's price list, and the draft. For every line in the draft it finds the list line for that item, and checks that every rupee, every GST rate, every HSN code is on it. That check is plain code, not a chatbot, so no one can talk it into twelve percent.
Three lines pass. Two don't. Twelve percent isn't on the list. Neither is the festive scheme.
Proofquote never types the right number in for you. Ravi fixes it. Until then, send stays shut.
Then the checked quote is emailed to the sales lead, every rate next to the list line behind it.
Other tools write the quote. Proofquote checks it. No list, no rate."

Add a small permanent label in the bottom-left corner on every AI-generated shot: "AI-generated footage". Do not put it on the screen recordings.
```

---

## B. Shot list for clip generators

Paste the **style block** in front of every shot prompt so the clips match.

**Style block**

```
Cinematic, 35mm, shallow depth of field, warm tungsten desk lamp as the only light, deep shadows, muted palette of off-white paper, dark wood and near-black, one red accent. Realistic, documentary feel, slow handheld or locked-off camera. Small distributor office in a North Indian town. No text, no logos, no UI on any screen (screens show only soft blurred light). No fantasy elements.
```

| Shot | Length | Prompt (after the style block) | In the edit |
|---|---|---|---|
| 1 | 6s | Wide shot. A fictional Indian man in his late 20s in a plain dark shirt sits at a cluttered desk at night. Shelves behind him hold bundled steel angles and stacked paint tins. A laptop and a printed price list on the desk. | Label "AI-generated footage" |
| 2 | 4s | Close-up of a smartphone face-up on the desk lighting up with a new message. The screen shows only a blurred green-and-white glow, no readable text. | Overlay text: "12% lagao, 18 nahi chalega." |
| 3 | 5s | Over-the-shoulder shot of the man looking from the phone to a printed sheet of paper, running his finger down a column. The paper is out of focus. | Overlay: "Price list: GST 18%" |
| 4 | 5s | Slow push-in on his face, lit by the laptop, deciding. He exhales. | Overlay: "Draft: GST 12%" |
| 5 | 40–45s | (Real screen recording, not generated.) Paste screen → press Check → the two red "Not on the list" lines → hover the "List says" line. | Lower thirds: "Every rate must be on the list" · "12% isn't on the list" |
| 6 | 15s | (Real screen recording.) Remove both lines → Review → Send → open the email. | Lower third: "Send stays shut until it's fixed" |
| 7 | 5s | Close-up of a finger pressing a laptop trackpad, then the laptop lid closing slowly. | — |
| 8 | 4s | The man switches off the desk lamp; the room goes dark except a faint streetlight through the window. | — |
| 9 | 5s | (Title card, made in the editor.) Black, serif text. | "Other tools write the quote. Proofquote checks it." → "No list, no rate." |

**Negative prompt** (tools that accept one): `text, letters, numbers, logos, watermark, UI, hologram, robot, neon, glowing, futuristic, 3D icons, smiling at camera, talking to camera, lip sync, extra fingers`

## Before you upload

- The label "AI-generated footage" is on every generated shot.
- The person is fictional; you didn't use a classmate's face or a cloned voice without their written consent.
- Every number on screen comes from the real app or a typed overlay.
- Music is royalty-free and credited in the description.
- Length is between 1:50 and 2:10.

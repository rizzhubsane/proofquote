# Fallback launch film (2:00)

`endterm/Proofquote-launch-2min.mp4`, built by `python3 scripts/render-film.py` from real app screenshots (`endterm/shots/`) and a synthetic voice (macOS "Rishi"). The opening still is AI-generated and labelled on screen. The group's own cut can replace this; see `video-prompt.md`.

| # | Time | On screen | Voice-over |
|---|---|---|---|
| 0 | 0:00 | AI still: Ravi at a laptop, night. "9:40 pm. Sharma wants the quote tonight." | Nine forty at night. Ravi does inside sales at a steel distributor in Ambala. Sharma Traders wants four hundred kilos of MS angle and twenty litres of primer. Then a WhatsApp: twelve percent lagao, eighteen nahi chalega. |
| 1 | 0:19 | Price-list slip (18% in green) over the draft (12% and 15% in red). | Ravi's price list says GST eighteen percent. The draft he is about to send says twelve. It reads like a normal quote. Ask a chatbot to tidy it up, and the twelve comes back cleaner. And what is on the quote becomes the invoice. |
| 2 | 0:39 | App, Paste screen. | Proofquote takes two things. This week's price list, which is the only source of truth. And the draft. |
| 3 | 0:49 | App, Check screen with the run log. | Press check. For every line in the draft, Proofquote finds the price list line for that item, and checks that every rupee amount, every GST rate and every HSN code is on it. Four steps, in order, once. The lookup is plain code, not a model, so no prompt can talk it into twelve percent. |
| 4 | 1:14 | Close-up of the two flagged lines. | Three lines pass. Two don't. Twelve percent is not on the list line for MS angle. The list says eighteen. The fifteen percent festive scheme isn't there either. The list says no scheme this week. |
| 5 | 1:31 | App, Send screen after removing both lines. | Proofquote never types eighteen in for you. Ravi removes the lines, or adds the missing line to the list if it is real. Until then, send stays shut. |
| 6 | 1:44 | The rendered email. | Then n8n emails the checked quote to the sales lead. Every rate sits next to the list line behind it, and what was removed is shown, struck through. |
| 7 | 1:57 | End card: "No list, no rate." | Other tools write the quote. Proofquote checks it. No list, no rate. |

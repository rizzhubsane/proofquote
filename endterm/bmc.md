# Proofquote business model canvas

The deck uses the fields the brief asks for (problem, solution, value proposition, segments, channels, key metrics, cost, revenue) plus the remaining Osterwalder blocks. Everything about price and channels is a hypothesis. Nothing here has been sold.

| Block | Proofquote |
|---|---|
| Problem | Quotes are rebuilt by hand from a price list and a WhatsApp chat. Dealers push for lower GST slabs and schemes; chat assistants copy or invent rates. Wrong rates carry into the invoice. |
| Customer segment | Inside-sales staff at steel, hardware and building-material distributors who quote dealers on WhatsApp. Payer: the distributor's owner or sales head. The dealer receives the quote but is not a user. |
| Value proposition | Every rate on the quote is on this week's list, shown next to the list line. Off-list lines are caught before they're sent, not after the accountant finds them. |
| Solution | Paste list + draft → line-by-line check → remove or fix → email the checked quote. |
| Channels | Distributor and trade associations, Tally and Marg implementation partners, CAs who already see the bad invoices. |
| Customer relationship | Self-serve. The sales lead approves every line; the tool never fills in a rate. |
| Key activities | Keep the check strict, keep the golden set honest, parse messier price lists (PDF tables, Tally exports). |
| Key resources | The citation rule, the golden set, the n8n send flow. |
| Key partners | Tally/Marg partners (distribution), CAs (problem evidence), an LLM API (draft splitting only). |
| Key metric | Off-list lines caught per 100 quotes, and false alarms per 100 true lines. |
| Revenue (hypothesis) | ₹499 per sales seat per month. To test: would a distributor pay this to avoid one reissued invoice a month? |
| Cost | LLM tokens (small, splitting only), n8n hosting, our time maintaining the parser and test set. |

## Sources

- Kryotta, 28 Aug 2026, "I wrote 50 GST invoices with AI": Gemini used 18% when asked for 12% in 2 of 25 invoices; Claude changed the given HSN in 3 of 25; Gemini shortened the GSTIN in 4 of 25. One printing business, vendor blog. https://www.kryotta.ai/blog/claude-vs-gemini-gst-invoices-accuracy-test
- Tally Solutions, "How to write a quotation": quotation details carry into the invoice. https://tallysolutions.com/business-guides/how-to-write-quotation/
- TarkApp, "GST invoice from WhatsApp order": wholesalers retype dealer orders from WhatsApp into GST invoices. https://tarkapp.com/use-cases/b2b-wholesale/gst-invoice-from-whatsapp-order

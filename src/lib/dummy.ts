import type { QuoteFields } from "./cite";

/** Sample distributor. Made up for the demo; every rate and code here is the "truth" for Q-1042. */
export const DEMO_LIST = `Goyal Distributors — price list, week of 21 Oct
MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216.
Red oxide primer: ₹180 per litre. GST 18%. HSN 3208.
No scheme discount this week.
Freight extra at actuals. Quotes valid 7 days.`;

/** Ravi's draft after Sharma's WhatsApp ("12% lagao, 18 nahi chalega"). Two lines are not on the list. */
export const DEMO_DRAFT = `400 kg MS angle 50x50x6 at ₹62 per kg
20 L red oxide primer at ₹180 per litre
GST 12% on MS angle (Sharma special)
15% festive scheme discount on this quote
Freight extra at actuals`;

export const DEMO_FIELDS: QuoteFields = {
  to: "ravi.sales@goyaldistributors.in",
  quote_no: "Q-1042",
  party: "Sharma Traders, Ambala",
};

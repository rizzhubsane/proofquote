// Builds endterm/Proofquote-EndTerm.pptx. Run: npm run deck
// Fill TEAM before the LMS upload.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const TEAM = {
  number: "[Team no.]",
  members: [
    { name: "Member 1", owned: "" },
    { name: "Member 2", owned: "" },
    { name: "Member 3", owned: "" },
    { name: "Member 4", owned: "" },
    { name: "Member 5", owned: "" },
    { name: "Member 6", owned: "" },
  ],
  appUrl: "localhost:5173/#/app",
};

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "endterm/Proofquote-EndTerm.pptx");
const SHOT = (n) => path.join(ROOT, "endterm/shots", n);
const FRAME = (i) => path.join(ROOT, "endterm/film-frames", `scene-0${i}.png`);

const F = "Georgia";
const C = {
  ink: "1C1914",
  paper: "F3EFE4",
  card: "FFFDF8",
  band: "E9E3D5",
  muted: "6A6458",
  rule: "CFC6B4",
  stamp: "9A1F1F",
  ok: "1F4D3A",
  gold: "E9D8A6",
  dim: "B9B1A1",
  soft: "DDD6C8",
  chat: "E2ECD9",
};

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Proofquote";
pres.author = `JGBS MBA 2026, ${TEAM.number}`;
pres.subject = "AI Tools for Business, end-term group assessment";
pres.theme = { headFontFace: F, bodyFontFace: F };

pres.defineSlideMaster({
  title: "DARK",
  background: { color: C.ink },
  objects: [
    {
      placeholder: {
        options: { name: "title", type: "title", x: 0.6, y: 2.0, w: 7.2, h: 1.2, fontFace: F, fontSize: 60, bold: true, color: C.paper, margin: 0, valign: "top", align: "left" },
        text: "",
      },
    },
  ],
});

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.paper },
  objects: [
    {
      placeholder: {
        options: { name: "title", type: "title", x: 0.6, y: 0.62, w: 12.1, h: 0.75, fontFace: F, fontSize: 30, bold: true, color: C.ink, margin: 0, valign: "top", align: "left" },
        text: "",
      },
    },
    { text: { text: "Proofquote  ·  JGBS MBA 2026  ·  AI Tools for Business", options: { x: 0.6, y: 7.02, w: 8, h: 0.25, fontFace: F, fontSize: 10, color: C.muted, margin: 0 } } },
  ],
  slideNumber: { x: 12.3, y: 7.0, w: 0.45, h: 0.28, fontFace: F, fontSize: 10, color: C.muted, align: "right" },
});

// ---------- helpers ----------
function T(s, text, o) {
  s.addText(text, { isTextBox: true, margin: 0, fontFace: F, fontSize: 15, color: C.ink, valign: "top", paraSpaceAfter: 0, ...o });
}
function label(s, text, x, y, w, color = C.muted, size = 11) {
  T(s, text.toUpperCase(), { x, y, w, h: 0.28, fontSize: size, charSpacing: 2, color });
}
function box(s, x, y, w, h, fill = C.card, line = C.ink, lw = 0.75) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: lw ? { color: line, width: lw } : { type: "none" } });
}
function hr(s, x, y, w, color = C.ink, width = 1.5) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width } });
}
function arrow(s, x, y, w, color = C.muted) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 1.25, endArrowType: "triangle" } });
}
function stamp(s, text, x, y, w, h, size = 14, onDark = false) {
  s.addText(text, {
    isTextBox: true, x, y, w, h, margin: 0, fontFace: F, fontSize: size, bold: true, charSpacing: 3,
    color: onDark ? "D46A6A" : C.stamp, align: "center", valign: "middle", rotate: -6,
    line: { color: onDark ? "D46A6A" : C.stamp, width: 2 }, fill: { color: onDark ? C.ink : C.card },
  });
}
function pic(s, file, x, y, w, frame = true) {
  const { w: pw, h: ph } = pngSize(file);
  const h = (w * ph) / pw;
  s.addImage({ path: file, x, y, w, h });
  if (frame) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: "FFFFFF", transparency: 100 }, line: { color: C.ink, width: 0.75 } });
  return h;
}
function content(kicker, title) {
  const s = pres.addSlide({ masterName: "CONTENT" });
  T(s, kicker.toUpperCase(), { x: 0.6, y: 0.3, w: 9, h: 0.28, fontSize: 11, charSpacing: 2, color: C.stamp });
  s.addText(title, { placeholder: "title" });
  return s;
}
function block(s, head, body, x, y, w, h, size = 15) {
  label(s, head, x, y, w);
  T(s, body, { x, y: y + 0.32, w, h: h - 0.32, fontSize: size });
}

// ---------- 1. Title ----------
{
  const s = pres.addSlide({ masterName: "DARK" });
  label(s, `${TEAM.number}  ·  End-term group assessment  ·  AI Tools for Business  ·  JGBS MBA 2026`, 0.6, 0.6, 11, C.dim);
  s.addText("Proofquote", { placeholder: "title" });
  T(s, "No list, no rate.", { x: 0.6, y: 3.2, w: 7, h: 0.6, fontSize: 28, italic: true, color: C.gold });
  T(s, "Checks a distributor's draft quote against this week's price list before it reaches the dealer.", { x: 0.6, y: 4.05, w: 6.4, h: 1.0, fontSize: 18, color: C.soft });
  T(s, TEAM.members.map((m) => m.name).join("   ·   "), { x: 0.6, y: 6.45, w: 11.5, h: 0.4, fontSize: 13, color: C.dim });

  box(s, 7.95, 1.75, 4.8, 3.5, C.card, C.card, 0);
  label(s, "Draft Q-1042  ·  Sharma Traders", 8.25, 2.0, 4.3);
  T(s, "400 kg MS angle 50x50x6 at ₹62 per kg", { x: 8.25, y: 2.45, w: 4.3, h: 0.4, fontSize: 15 });
  T(s, "GST 12% on MS angle (Sharma special)", { x: 8.25, y: 2.95, w: 4.3, h: 0.4, fontSize: 15, color: C.stamp, strike: "sngStrike" });
  T(s, "List says: GST 18%. HSN 7216.", { x: 8.25, y: 3.45, w: 4.3, h: 0.4, fontSize: 13, color: C.ok });
  stamp(s, "NOT ON THE LIST", 9.75, 4.25, 2.7, 0.55, 14);
  s.addNotes(
    "Proofquote checks a sales quote against the price list before it goes out. The whole idea fits on this card: the dealer wanted 12%, the list says 18%, and the 12% does not leave the building.",
  );
}

// ---------- 2. Problem & user ----------
{
  const s = content("01  ·  Problem and target user", "9:40 pm, and the dealer wants 12%");
  block(s, "Who", "Ravi does inside sales at Goyal Distributors, a steel and hardware distributor in Ambala. He builds every dealer quote from a weekly price list and sends it on WhatsApp.", 0.6, 1.65, 6.2, 1.25);
  block(s, "What happens", "Sharma Traders wants 400 kg of MS angle and 20 L of primer, and adds: “12% lagao, 18 nahi chalega.” The list says GST 18%. To keep the order, the draft says 12%.", 0.6, 2.95, 6.2, 1.3);
  block(s, "What it costs", "The quote becomes the invoice. Charge 12% on an 18% item and the distributor owes the difference to the tax department, with interest. Ask a chatbot to tidy the draft and the 12% comes back looking official.", 0.6, 4.3, 6.2, 1.55);
  T(s, "Ravi, Goyal Distributors and Sharma Traders are composites built from public sources. We did not interview distributors.", { x: 0.6, y: 6.3, w: 6.2, h: 0.5, fontSize: 11, italic: true, color: C.muted });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.5, y: 1.7, w: 4.9, h: 1.35, fill: { color: C.chat }, line: { type: "none" }, rectRadius: 0.12 });
  T(s, "Sharma Traders  ·  9:40 pm", { x: 7.75, y: 1.85, w: 4.4, h: 0.3, fontSize: 11, color: C.muted });
  T(s, "12% lagao, 18 nahi chalega.", { x: 7.75, y: 2.25, w: 4.4, h: 0.6, fontSize: 22 });

  box(s, 7.9, 3.35, 4.85, 1.3);
  label(s, "Price list  ·  week of 21 Oct", 8.15, 3.55, 4.4);
  s.addText(
    [
      { text: "MS angle 50x50x6: ₹62 per kg. GST " },
      { text: "18%", options: { bold: true, color: C.ok } },
      { text: ". HSN 7216." },
    ],
    { isTextBox: true, x: 8.15, y: 3.95, w: 4.45, h: 0.5, margin: 0, fontFace: F, fontSize: 15, color: C.ink, valign: "top" },
  );

  box(s, 7.5, 4.95, 4.9, 1.3);
  label(s, "Ravi's draft", 7.75, 5.15, 4.4);
  s.addText(
    [
      { text: "GST " },
      { text: "12%", options: { bold: true } },
      { text: " on MS angle (Sharma special)" },
    ],
    { isTextBox: true, x: 7.75, y: 5.55, w: 4.45, h: 0.5, margin: 0, fontFace: F, fontSize: 15, color: C.stamp, valign: "top" },
  );
  s.addNotes(
    "Our user is inside sales at a mid-size distributor, not 'SMEs'. The moment we design for is this one: a regular dealer asks for a lower slab in the same chat where the quote is going. The price list says one thing, the draft says another, and the draft becomes the invoice. Be clear that Ravi is a composite: we built him from public sources, we did not interview distributors.",
  );
}

// ---------- 3. Evidence ----------
{
  const s = content("01  ·  Problem", "A wrong rate gets into a quote two ways");
  hr(s, 0.6, 1.7, 5.75);
  hr(s, 6.98, 1.7, 5.75);
  label(s, "The dealer asks for it", 0.6, 1.85, 5.7);
  T(s, "“Put 12%”", { x: 0.6, y: 2.25, w: 5.7, h: 0.85, fontSize: 44, bold: true });
  T(s, "Dealers bargain on the GST slab as well as the price. Orders arrive as WhatsApp messages that someone retypes into a GST invoice by hand.", { x: 0.6, y: 3.25, w: 5.6, h: 1.3, fontSize: 16 });
  T(s, "TarkApp, “GST invoice from WhatsApp order”, B2B wholesale use case.", { x: 0.6, y: 4.75, w: 5.6, h: 0.5, fontSize: 11, color: C.muted });

  label(s, "The model mis-copies it", 6.98, 1.85, 5.7);
  T(s, "2 of 25", { x: 6.98, y: 2.25, w: 2.4, h: 0.85, fontSize: 44, bold: true });
  T(s, "Gemini invoices charged 18% GST when the prompt said 12%.", { x: 9.45, y: 2.4, w: 3.28, h: 0.75, fontSize: 15 });
  T(s, "3 of 25", { x: 6.98, y: 3.3, w: 2.4, h: 0.85, fontSize: 44, bold: true });
  T(s, "Claude invoices swapped the HSN code they had been given.", { x: 9.45, y: 3.45, w: 3.28, h: 0.75, fontSize: 15 });
  T(s, "Kryotta, 28 Aug 2026: one printing business wrote 50 GST invoices with AI. A vendor blog and a small sample; we read it as a signal, not a market size.", { x: 6.98, y: 4.6, w: 5.75, h: 0.65, fontSize: 11, color: C.muted });

  box(s, 0.6, 5.55, 12.13, 1.05, C.band, C.band, 0);
  T(s, "Either way it carries forward: a quotation's details flow into the invoice (Tally Solutions). So the check has to happen before Send, against the list, whoever typed the number.", { x: 0.85, y: 5.72, w: 11.6, h: 0.75, fontSize: 16, valign: "middle" });
  s.addNotes(
    "Two sources of the same error. Human pressure, which nobody measures, and model error, which Kryotta measured on a small sample: Gemini used 18 when told 12 in 2 of 25 invoices, Claude changed the HSN in 3 of 25. We don't care which one it was. The fix is the same: check the number against the list before it leaves. Say plainly that Kryotta is a vendor blog.",
  );
}

// ---------- 4. BMC ----------
{
  const s = content("02  ·  Business model", "Business model canvas");
  const X = 0.6, W = 12.13, g = 0.06;
  const cell = (head, body, x, y, w, h, strong = false) => {
    box(s, x, y, w, h, strong ? C.card : "F8F5EE", C.ink, strong ? 1.5 : 0.5);
    label(s, head, x + 0.12, y + 0.1, w - 0.24, strong ? C.stamp : C.muted, 10);
    T(s, body, { x: x + 0.12, y: y + 0.38, w: w - 0.24, h: h - 0.45, fontSize: 11 });
  };
  const yA = 1.45, hA = 0.92;
  cell("Problem", "Quotes are retyped from a price list and a WhatsApp chat. Dealers push for lower slabs; chat assistants copy or invent rates. The wrong rate carries into the invoice.", X, yA, 7.6, hA);
  cell("Key metric", "Off-list lines caught per 100 quotes, and false alarms per 100 true lines.", X + 7.6 + g, yA, W - 7.6 - g, hA);

  const yB = yA + hA + g, hB = 3.0, cw = (W - 4 * g) / 5, half = (hB - g) / 2;
  const cx = (i) => X + i * (cw + g);
  cell("Key partners", "Tally and Marg implementation partners (distribution). CAs who see the bad invoices (evidence). An LLM API, for splitting drafts only.", cx(0), yB, cw, hB);
  cell("Key activities", "Keep the check strict. Grow the golden set. Parse PDF and Tally price lists.", cx(1), yB, cw, half);
  cell("Key resources", "The citation rule, the golden set, the n8n send flow.", cx(1), yB + half + g, cw, half);
  cell("Value proposition", "Every rate on the quote is on this week's list, printed next to it. Off-list lines are caught before Send, not after the accountant finds them.", cx(2), yB, cw, hB, true);
  cell("Relationship", "Self-serve. The sales lead approves every line; the tool never fills in a rate.", cx(3), yB, cw, half);
  cell("Channels", "Distributor and trade associations, Tally partners, CAs.", cx(3), yB + half + g, cw, half);
  cell("Customer segment", "Inside-sales staff at steel, hardware and building-material distributors who quote dealers on WhatsApp. Payer: the owner or sales head. Not “SMEs”.", cx(4), yB, cw, hB);

  const yC = yB + hB + g, hC = 0.95, hw = (W - g) / 2;
  cell("Cost structure", "LLM tokens (small: splitting only), n8n hosting, our time on the parser and the test set.", X, yC, hw, hC);
  cell("Revenue (hypothesis)", "₹499 per sales seat per month. Untested: would a distributor pay this to avoid one reissued invoice a month?", X + hw + g, yC, hw, hC);
  T(s, "Sources: Kryotta (Aug 2026), Tally Solutions, TarkApp; full links in endterm/bmc.md. Price, channels and partners are hypotheses; nothing has been sold.", { x: 0.6, y: 6.5, w: 11.5, h: 0.35, fontSize: 10, color: C.muted });
  s.addNotes(
    "Read it left to right through the value proposition. The segment is narrow on purpose: serving everyone serves no one. Revenue is a hypothesis with the test we'd run to check it. Cost follows from the other blocks; the model is a small line because it only splits drafts.",
  );
}

// ---------- 5. Architecture ----------
{
  const s = content("03  ·  Agentic architecture", "Four steps, in order, once");
  T(s, "A model may help read the draft. Every decision about a rate is made by code it can't talk its way around.", { x: 0.6, y: 1.4, w: 12, h: 0.4, fontSize: 16, color: C.muted });

  const y = 2.15, h = 2.1;
  box(s, 0.6, y, 1.35, 0.95);
  T(s, "Price list", { x: 0.65, y: y + 0.3, w: 1.25, h: 0.4, fontSize: 13, align: "center" });
  box(s, 0.6, y + 1.15, 1.35, 0.95);
  T(s, "Draft quote", { x: 0.65, y: y + 1.45, w: 1.25, h: 0.4, fontSize: 13, align: "center" });

  const steps = [
    ["01", "Extractor", "Splits the draft into one line per rate or term. Numbers unchanged.", "Model: optional", C.stamp],
    ["02", "Citation checker", "Finds the list line for each item. Every ₹, %, HSN and number must be on it.", "Model: never", C.ok],
    ["03", "Pack writer", "Lays out each quote line next to its list line.", "Model: never", C.ok],
    ["04", "Critic", "Holds Send while any line is off the list. Never fills a rate.", "Model: never", C.ok],
  ];
  const bw = 2.05, step = 2.3, x0 = 2.25;
  steps.forEach(([n, name, job, model, mc], i) => {
    const x = x0 + i * step;
    box(s, x, y, bw, h);
    T(s, n, { x: x + 0.15, y: y + 0.15, w: 1, h: 0.25, fontSize: 11, color: C.stamp, charSpacing: 2 });
    T(s, name, { x: x + 0.15, y: y + 0.42, w: bw - 0.25, h: 0.35, fontSize: 14, bold: true });
    T(s, job, { x: x + 0.15, y: y + 0.8, w: bw - 0.3, h: 0.9, fontSize: 11.5, color: C.muted });
    T(s, model, { x: x + 0.15, y: y + h - 0.35, w: bw - 0.3, h: 0.25, fontSize: 11, color: mc, bold: true });
    arrow(s, x - 0.3, y + h / 2, 0.24);
  });
  box(s, 11.5, y, 1.23, h, C.ink, C.ink, 0);
  T(s, "n8n", { x: 11.6, y: y + 0.4, w: 1.03, h: 0.35, fontSize: 15, bold: true, color: C.paper, align: "center" });
  T(s, "Email to the sales lead + WhatsApp draft", { x: 11.6, y: y + 0.85, w: 1.03, h: 1.0, fontSize: 11, color: C.soft, align: "center" });
  arrow(s, 11.2, y + h / 2, 0.24);

  const yb = 4.75, cw = 3.85, gx = 0.29;
  [
    ["Why not one prompt", "A prompt that's asked for 12% writes 12%. Splitting a messy draft is a language job; whether a rate is on the list is a lookup, so it lives in code."],
    ["Where it sits on Ng's spectrum", "L2: a fixed multi-step plan with a tool doing the check. We stopped short of L3 on purpose: no agent gets to decide whether to check."],
    ["Patterns from class", "Tool use (the list lookup). Reflection against an external signal (the critic reads the checker, not itself). Human in the loop (Ravi removes or fixes)."],
  ].forEach(([h2, b], i) => {
    const x = 0.6 + i * (cw + gx);
    hr(s, x, yb, cw, C.ink, 1);
    block(s, h2, b, x, yb + 0.12, cw, 1.75, 13);
  });
  s.addNotes(
    "Agentic is a spectrum, not a switch. We put the model where language is the problem, splitting a messy draft, and kept it away from the decision. If you ask which agent is the clever one: none of them. The value is the process wrapped around the model. Guard worth mentioning: if the model returns a line containing a number that isn't in the draft, we throw that line away before the check.",
  );
}

// ---------- 6. The rule ----------
{
  const s = content("03  ·  Agentic architecture", "The check is code, not a prompt");
  label(s, "A draft line passes only if", 0.6, 1.6, 5.2);
  const rules = [
    "One price-list line is about the same item: it shares a word like “angle” or “primer”.",
    "Every ₹ amount, GST %, HSN code and other number in the draft line is on that list line. Quantities like “400 kg” don't count.",
    "That list line appears word for word in the pasted list, at least 20 characters.",
  ];
  s.addText(
    rules.map((r, i) => ({ text: r, options: { bullet: { type: "number" }, breakLine: i < rules.length - 1, paraSpaceAfter: 8 } })),
    { isTextBox: true, x: 0.6, y: 1.95, w: 5.0, h: 2.6, margin: 0, fontFace: F, fontSize: 15, color: C.ink, valign: "top" },
  );
  T(s, "Otherwise the line is marked Not on the list, with the closest list line beside it. Nothing is filled in.", { x: 0.6, y: 4.65, w: 5.0, h: 0.8, fontSize: 15, bold: true });
  T(s, "src/lib/cite.ts  →  supports()", { x: 0.6, y: 5.6, w: 5.0, h: 0.3, fontSize: 12, fontFace: "Courier New", color: C.muted });

  const h = pic(s, SHOT("deck-check-rows.png"), 6.05, 1.65, 6.68);
  T(s, "The sample quote in the app: three lines pass. The 12% and the 15% scheme don't, and each shows what the list actually says.", { x: 6.05, y: 1.65 + h + 0.15, w: 6.68, h: 0.6, fontSize: 12, color: C.muted });
  s.addNotes(
    "This is the product. Read the three conditions. Then point at the screenshot: 12% isn't on the MS angle line, which says 18; the festive scheme isn't on the list, which says no scheme this week. If someone asks why 20 characters: it stops a two-word fragment like 'GST 18' from counting as a citation.",
  );
}

// ---------- 7. Design thinking ----------
{
  const s = content("04  ·  Design thinking to MVP", "From desk research to one flow");
  const cols = [
    ["Empathise", "We read how a small firm actually uses AI for GST invoices (Kryotta), how wholesalers turn WhatsApp orders into invoices (TarkApp), and how quotes carry into invoices (Tally)."],
    ["Insight", "Ravi needs to quote fast without breaking the list, because the quote becomes the invoice and the pressure to bend the slab arrives in the same chat."],
    ["How might we", "How might we let Ravi send a fast quote where every rate is provably on this week's list?"],
    ["Ideas", "AI quote writer: rejected, it is the problem.\nHSN-to-GST lookup: rejected, misses prices and schemes.\nDraft-against-list checker: chosen."],
    ["MVP scope", "One persona, one flow, three screens: paste, check, send. No login, no database, no payments. The riskiest assumption first: can a rule stop off-list lines with no false passes?"],
  ];
  const cw = 2.25, gx = 0.22;
  cols.forEach(([h2, b], i) => {
    const x = 0.6 + i * (cw + gx);
    hr(s, x, 1.7, cw, i === 2 ? C.stamp : C.ink, i === 2 ? 2.5 : 1.5);
    T(s, `0${i + 1}`, { x, y: 1.85, w: cw, h: 0.3, fontSize: 11, color: C.stamp, charSpacing: 2 });
    T(s, h2, { x, y: 2.15, w: cw, h: 0.4, fontSize: 17, bold: true });
    T(s, b, { x, y: 2.65, w: cw, h: 3.3, fontSize: i === 2 ? 17 : 14.5, color: i === 2 ? C.ink : C.muted, italic: i === 2 });
  });
  box(s, 0.6, 6.05, 12.13, 0.6, C.band, C.band, 0);
  T(s, "This was desk research, not interviews. The persona is a composite. Talking to real sales staff is the next test (slide 10).", { x: 0.8, y: 6.13, w: 11.8, h: 0.45, fontSize: 13, valign: "middle" });
  s.addNotes(
    "Double diamond, honestly applied. We had no access to distributors this term, so empathy came from public sources, and we label it that way. GenAI was a research partner, not a respondent. The HMW is narrow on purpose. Three ideas, two rejected, and why. The MVP tests our riskiest assumption first: can a plain rule stop the bad lines without stopping the good ones.",
  );
}

// ---------- 8. MVP demo ----------
{
  const s = content("04  ·  MVP", "The MVP: paste, check, send");
  const shots = [
    ["deck-paste.png", "1  ·  Paste", "The price list and the draft go in separately. The list is the only source of truth."],
    ["deck-check.png", "2  ·  Check", "Each line shows the list line behind it, or why it isn't on the list. The run log shows the four steps."],
    ["deck-send.png", "3  ·  Send", "Off until every line is on the list. Removed lines stay visible, struck through."],
  ];
  const w = 3.9, gx = 0.215;
  shots.forEach(([f, h2, b], i) => {
    const x = 0.6 + i * (w + gx);
    pic(s, SHOT(f), x, 1.65, w);
    label(s, h2, x, 4.4, w, C.stamp);
    T(s, b, { x, y: 4.72, w, h: 1.0, fontSize: 13 });
  });
  hr(s, 0.6, 5.95, 12.13, C.rule, 1);
  T(s, `Live: ${TEAM.appUrl}   ·   Without a model key it runs on rules only. With one, the model splits messy drafts and every line it returns is checked the same way.`, { x: 0.6, y: 6.1, w: 12.1, h: 0.6, fontSize: 12, color: C.muted });
  s.addNotes(
    "Do the live demo here if the room allows: Check a sample quote, press Check, show the two red lines, remove them, review, send, open the email. If the network or laptop fails, these three screenshots are the same flow.",
  );
}

// ---------- 9. Metric ----------
{
  const s = content("04  ·  Test metric, actually run", "The test we ran: 16 lines, no wrong calls");
  const gx = 0.6, gy = 1.95, cw = 2.6, ch = 1.55;
  T(s, "Proofquote said", { x: gx + 1.4, y: 1.6, w: cw * 2, h: 0.3, fontSize: 11, color: C.muted, align: "center" });
  T(s, "Passed", { x: gx + 1.4, y: gy - 0.05, w: cw, h: 0.3, fontSize: 12, bold: true, align: "center" });
  T(s, "Stopped", { x: gx + 1.4 + cw, y: gy - 0.05, w: cw, h: 0.3, fontSize: 12, bold: true, align: "center" });
  T(s, "On the list", { x: gx, y: gy + 0.3 + ch / 2 - 0.2, w: 1.3, h: 0.4, fontSize: 12, bold: true });
  T(s, "Not on the list", { x: gx, y: gy + 0.3 + ch + ch / 2 - 0.25, w: 1.3, h: 0.5, fontSize: 12, bold: true });
  const cells = [
    [0, 0, "7", "correct passes", C.ok, C.card],
    [1, 0, "0", "false alarms", C.ink, "F8F5EE"],
    [0, 1, "0", "false passes: the one that matters", C.stamp, "F8F5EE"],
    [1, 1, "9", "correct stops", C.ok, C.card],
  ];
  cells.forEach(([c, r, n, l, col, fill]) => {
    const x = gx + 1.4 + c * cw, y = gy + 0.3 + r * ch;
    box(s, x, y, cw, ch, fill, C.ink, 0.75);
    T(s, n, { x, y: y + 0.15, w: cw, h: 0.8, fontSize: 44, bold: true, color: col, align: "center" });
    T(s, l, { x: x + 0.15, y: y + 0.98, w: cw - 0.3, h: 0.45, fontSize: 11, color: C.muted, align: "center" });
  });
  T(s, "Precision 1.00  ·  Recall 1.00  ·  npm run eval, 2 Nov 2026", { x: gx, y: 5.45, w: 6.6, h: 0.35, fontSize: 13, bold: true });

  label(s, "The 9 lines it had to stop", 7.4, 1.6, 5.3);
  const bad = [
    "GST 12% on MS angle (Sharma special)",
    "15% festive scheme discount",
    "MS angle HSN 73089000",
    "MS angle at ₹58 per kg  ·  angle 58 per kg  ·  MS angle 58",
    "Red oxide primer at ₹62 per litre (MS angle's rate)",
    "Quote valid till 5 Nov",
    "Freight free to Ambala",
  ];
  s.addText(
    bad.map((b, i) => ({ text: b, options: { bullet: true, breakLine: i < bad.length - 1, paraSpaceAfter: 6 } })),
    { isTextBox: true, x: 7.4, y: 1.95, w: 5.33, h: 3.3, margin: 0, fontFace: F, fontSize: 13, color: C.ink, valign: "top" },
  );
  box(s, 7.4, 4.45, 5.33, 1.0, C.band, C.band, 0);
  T(s, "What this shows: the rule does what we claim, on 16 lines we wrote. What it doesn't: how it does on real drafts and messy PDF lists, or whether sales staff will use it. That's the next test.", { x: 7.6, y: 4.57, w: 4.95, h: 1.1, fontSize: 12.5 });
  s.addNotes(
    "An MVP without a success metric is just a demo, so here is the one number we actually produced. Precision matters more than recall for us: a false pass sends a wrong rate to a dealer; a false alarm costs Ravi a minute. Then be straight about the limit: we wrote the test lines. The first version of this rule had a hole: a bare 'MS angle 58' without a rupee sign passed. The golden set caught it, and the fix is in.",
  );
}

// ---------- 10. Test card ----------
{
  const s = content("04  ·  Test card", "The test we haven't run yet");
  stamp(s, "NOT RUN YET", 10.35, 0.55, 2.3, 0.55, 14);
  const rows = [
    ["We believe", "someone who has rebuilt a quote from WhatsApp will finish a checked quote faster than by hand, and agree the flagged lines were wrong."],
    ["We will", "give 6–10 classmates who didn't build it a printed price list and a messy draft with two off-list lines. No help after the first sentence."],
    ["We'll measure", "finished (sent with nothing off the list), time to send against their own estimate, and agreement with each flag."],
  ];
  rows.forEach(([h2, b], i) => {
    const y = 1.65 + i * 0.95;
    hr(s, 0.6, y, 12.13, C.rule, 1);
    T(s, h2, { x: 0.6, y: y + 0.15, w: 2.2, h: 0.4, fontSize: 15, bold: true });
    T(s, b, { x: 2.9, y: y + 0.15, w: 9.8, h: 0.75, fontSize: 15 });
  });
  hr(s, 0.6, 4.5, 12.13, C.ink, 1.5);
  T(s, "We're right if (set before testing)", { x: 0.6, y: 4.65, w: 6, h: 0.35, fontSize: 15, bold: true });
  [
    ["≥ 60%", "finish"],
    ["< ½", "of their own time estimate, median"],
    ["≥ 80%", "agree with every flag"],
  ].forEach(([n, l], i) => {
    const x = 0.6 + i * 4.1;
    T(s, n, { x, y: 5.1, w: 3.8, h: 0.8, fontSize: 40, bold: true });
    T(s, l, { x, y: 5.9, w: 3.8, h: 0.5, fontSize: 13, color: C.muted });
  });
  s.addNotes(
    "This is the test card format from session 16, with thresholds set before testing. We have not run it. If we run it before the presentation, the real numbers go here, pass or fail. If not, this slide says not run, and we don't invent a result.",
  );
}

// ---------- 11. Launch video ----------
{
  const s = content("05  ·  Launch video", "Two minutes, one quote");
  const fw = 2.8, fh = (fw * 1080) / 1920, gx = (12.13 - 4 * fw) / 3;
  for (let i = 0; i < 8; i++) {
    const x = 0.6 + (i % 4) * (fw + gx), y = 1.5 + Math.floor(i / 4) * (fh + 0.36);
    s.addImage({ path: FRAME(i), x, y, w: fw, h: fh });
    T(s, ["0:00", "0:18", "0:37", "0:46", "1:11", "1:27", "1:40", "1:52"][i], { x, y: y + fh + 0.06, w: fw, h: 0.25, fontSize: 10, color: C.muted });
  }
  const yb = 5.42;
  hr(s, 0.6, yb, 5.9, C.ink, 1);
  block(s, "Fallback cut, ready", "endterm/Proofquote-launch-2min.mp4, 2:00. Real app footage, a synthetic Indian-English voice, one AI still, labelled on screen.", 0.6, yb + 0.1, 5.9, 1.3, 13);
  hr(s, 6.83, yb, 5.9, C.ink, 1);
  block(s, "Session 17's four checks", "Accuracy: every number is from the app. Rights: our own footage and still. Disclosure: AI labels on screen. Brand truth: no shot shows the product doing anything it doesn't do.", 6.83, yb + 0.1, 5.9, 1.4, 13);
  s.addNotes(
    "Storyboard first, then generate, per session 19. The film follows one quote from the dealer's message to the email. Every product shot is a real screen capture; we never let a generator draw the app or the numbers. Swap in the group's own cut here if it's ready; the prompt and shot list are in endterm/video-prompt.md.",
  );
}

// ---------- 12. Multimedia & competition ----------
{
  const s = content("05  ·  Multimedia and competitive differentiation", "Other tools write the quote. Proofquote checks it.");
  const h = pic(s, SHOT("deck-landing.png"), 0.6, 1.6, 5.75);
  const by = 1.6 + h + 0.25;
  s.addImage({ path: SHOT("logo.png"), x: 0.6, y: by, w: 1.15, h: 1.15 });
  s.addImage({ path: SHOT("banner.png"), x: 1.9, y: by, w: 1.15, h: 1.15 });
  T(s, "Logo: the 12% struck through. 1:1 banner for WhatsApp status and LinkedIn. Landing hero: the product's moment, not a stock photo.", { x: 3.25, y: by, w: 3.1, h: 1.3, fontSize: 11, color: C.muted });

  const head = (t) => ({ text: t, options: { bold: true, fontSize: 12, color: C.ink, fill: { color: C.band } } });
  const rows = [
    [head(""), head("Chat assistant or AI quote writer"), head("Proofquote")],
    ["Starts from", "Your prompt", "This week's price list"],
    ["Dealer asks for 12%", "Writes 12%", "Flags 12%, shows the list's 18%"],
    ["Wrong HSN or price", "Can swap it (Kryotta: 3 of 25 HSNs)", "Stops it unless it's on the list line"],
    ["What you send", "A quote", "A quote with the list line beside every rate"],
    ["Who decides", "The model", "The sales lead"],
  ].map((r, i) => (i === 0 ? r : r.map((c, j) => ({ text: c, options: { bold: j === 0, color: j === 2 ? C.ok : C.ink } }))));
  s.addTable(rows, {
    x: 6.75, y: 1.6, w: 5.98, colW: [1.6, 2.09, 2.29], fontFace: F, fontSize: 12, color: C.ink,
    border: { type: "solid", pt: 0.75, color: C.rule }, fill: { color: C.card }, margin: 0.08, valign: "middle", rowH: 0.62,
  });
  T(s, "Session 18, visual whitespace: AI quote and invoice tools sell speed with glossy dashboards. We use paper, ink and one red stamp, because the product is a check, not a generator.", { x: 6.75, y: 5.75, w: 5.98, h: 0.85, fontSize: 12, color: C.muted });
  s.addNotes(
    "The competitive line is the whole positioning: everyone else generates; we verify. The table is fair to chat assistants: they're great at writing, which is exactly why they'll write the 12%. The brand follows from that: a red stamp that says not on the list.",
  );
}

// ---------- 13. n8n ----------
{
  const s = content("06  ·  Automation", "n8n sends exactly what was checked");
  const nodes = [
    ["Webhook", "Send button"],
    ["Build request", "Checked lines only"],
    ["Gemini", "Drafts the WhatsApp message"],
    ["Check message", "Rejects any number not on the quote"],
    ["Gmail", "To the sales lead"],
    ["Respond", "Back to the app"],
  ];
  const nw = 1.77, gx = 0.302;
  nodes.forEach(([n, d], i) => {
    const x = 0.6 + i * (nw + gx);
    const hot = i === 2 || i === 3;
    box(s, x, 1.6, nw, 1.0, hot ? C.ink : C.card, C.ink, 0.75);
    T(s, n, { x: x + 0.1, y: 1.68, w: nw - 0.2, h: 0.3, fontSize: 13, bold: true, color: hot ? C.paper : C.ink, align: "center" });
    T(s, d, { x: x + 0.1, y: 2.0, w: nw - 0.2, h: 0.55, fontSize: 10.5, color: hot ? C.soft : C.muted, align: "center" });
    if (i > 0) arrow(s, x - 0.27, 2.1, 0.24);
  });
  block(s, "The repetitive step", "After a quote is fixed, someone retypes it into WhatsApp for the dealer, and that's where the old 12% creeps back. Gemini drafts the message from the checked lines only; the next node rejects it if it adds any number.", 0.6, 3.0, 5.85, 1.3, 13);
  block(s, "Trigger", "The app's Send button calls the webhook. No schedule.", 0.6, 4.4, 5.85, 0.7, 13);
  block(s, "Considered, not chosen", "WhatsApp Business API straight to the dealer (needs Meta approval, and we want a human to forward). A daily digest (too late for today's quote).", 0.6, 5.25, 5.85, 1.2, 13);
  const eh = 3.25;
  const { w: pw, h: ph } = pngSize(SHOT("deck-email.png"));
  const ew = (eh * pw) / ph;
  pic(s, SHOT("deck-email.png"), 12.73 - ew, 3.0, ew);
  T(s, "Run shown: the same logic on the dev server, no webhook set, so nothing was emailed. Gmail execution screenshot: pending.", { x: 12.73 - ew, y: 6.3, w: ew, h: 0.45, fontSize: 10.5, color: C.stamp });
  s.addNotes(
    "Why this step: it's the last manual retype, and it's where errors come back. Gemini is useful here, writing a polite message, and still not trusted: the next node checks every number. Be precise about the run: the screenshot is our local execution of the same logic. Import n8n/proofquote-send.json, add the Gemini and Gmail credentials, and replace this with the n8n execution view.",
  );
}

// ---------- 14. Risks & ethics ----------
{
  const s = content("07  ·  Risks and ethics", "Where it can go wrong");
  const head = (t) => ({ text: t, options: { bold: true, fontSize: 12, fill: { color: C.band } } });
  const rows = [
    [head("Risk"), head("What happens"), head("What we do about it")],
    ["False alarm", "A true line is flagged because the list is formatted differently (a PDF table, a code in another column).", "Strict on purpose: a stopped true line costs a minute, a passed false one costs a reissued invoice. Ravi can add the line and re-check."],
    ["False pass", "A wrong rate passes because the number appears on the item's list line for another reason.", "Same item and every number must match. Tested on 16 lines we wrote; not yet on real drafts."],
    ["Model invents a line", "The extractor adds a rate the draft never had.", "Lines with numbers not in the draft are discarded before the check."],
    ["Stale list", "Ravi pastes last week's list.", "Not handled yet. The sales lead is accountable; date-stamping the list is next."],
    ["GSTIN errors", "A shortened GSTIN blocks the buyer's input credit (Kryotta: 4 of 25).", "Not checked. Roadmap."],
    ["Over-trust", "“Proofquote passed it” replaces judgment on terms the list doesn't cover.", "It never fills a rate, and a person approves every send."],
  ].map((r, i) => (i === 0 ? r : r.map((c, j) => ({ text: c, options: { bold: j === 0 } }))));
  s.addTable(rows, {
    x: 0.6, y: 1.6, w: 12.13, colW: [2.0, 4.8, 5.33], fontFace: F, fontSize: 13.5, color: C.ink,
    border: { type: "solid", pt: 0.75, color: C.rule }, fill: { color: C.card }, margin: 0.08, valign: "top",
  });
  s.addNotes(
    "Lead with the weaknesses before someone else finds them. The biggest real one is false alarms on messy price lists. We chose strictness, and we can say why in money terms. Two risks we don't handle yet, stale lists and GSTINs, are named, not hidden.",
  );
}

// ---------- 15. Governance ----------
{
  const s = content("07  ·  Governance and fair use", "Who's accountable, and what we label");
  const quads = [
    ["Accountability", "The sales lead who presses Send owns the quote. Proofquote never fills in a rate; its job is to make sure that person sees every off-list line first. Every emailed quote says: “Checked by Proofquote (AI-assisted); approved by the sales lead.”"],
    ["Data (DPDP Act, 2023)", "Sample data is made up and nothing is stored. With a key, the list and draft go to OpenAI or Google for one step; testers are told first, give written consent, and test data is deleted within 24 hours. Quotes go to the sales lead, never straight to the dealer."],
    ["Keys and code (session 14)", "API keys live in .env and n8n credentials: never in the repo, the deck or the zip, and never VITE_-prefixed, so they don't reach the browser. The decision logic is readable code, not a hidden prompt."],
    ["Synthetic media (sessions 17, 20)", "The AI still and any AI footage are labelled on screen. Fictional people only: no avatar, no cloned voice. The persona is labelled as a composite. Mindful of the IT Rules on synthetic-media labels."],
  ];
  quads.forEach(([h2, b], i) => {
    const x = 0.6 + (i % 2) * 6.215, y = 1.65 + Math.floor(i / 2) * 2.6;
    hr(s, x, y, 5.92, C.ink, 1.5);
    block(s, h2, b, x, y + 0.15, 5.92, 2.3, 16);
  });
  s.addNotes(
    "Governance is invisible until it fails. Four things we can point at: a named accountable human, a disclosure footer on every quote, keys that never leave the server, and labels on anything synthetic.",
  );
}

// ---------- 16. Team & next ----------
{
  const s = content("08  ·  Team and what's next", "Who built what, and what we'd do next");
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: C.band } } });
  s.addTable(
    [[head("Member"), head("Owned")], ...TEAM.members.map((m) => [m.name, m.owned || "—"])],
    { x: 0.6, y: 1.6, w: 5.6, colW: [2.0, 3.6], fontFace: F, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.75, color: C.rule }, fill: { color: C.card }, margin: 0.08, rowH: 0.5 },
  );
  label(s, "Next, in order", 6.75, 1.6, 6);
  const next = [
    "Run the classmate test on slide 10 and publish the numbers, whatever they are.",
    "Do a real Gmail run in n8n and replace the local-run screenshot.",
    "Put the app on a public URL.",
    "Parse PDF and Tally price lists: the biggest source of false alarms.",
    "Check GSTINs (Kryotta: 4 of 25 shortened).",
    "Date-stamp the list so a stale one gets caught.",
  ];
  s.addText(
    next.map((n, i) => ({ text: n, options: { bullet: { type: "number" }, breakLine: i < next.length - 1, paraSpaceAfter: 7 } })),
    { isTextBox: true, x: 6.75, y: 1.95, w: 5.98, h: 3.6, margin: 0, fontFace: F, fontSize: 14, color: C.ink, valign: "top" },
  );
  hr(s, 0.6, 5.85, 12.13, C.rule, 1);
  T(s, `App: ${TEAM.appUrl}   ·   Film: endterm/Proofquote-launch-2min.mp4   ·   n8n: n8n/proofquote-send.json   ·   Every artifact: endterm/proof-of-artifacts.md`, { x: 0.6, y: 6.0, w: 12.13, h: 0.6, fontSize: 12, color: C.muted });
  s.addNotes("Each member names what they owned in one sentence. Then the next steps, in the order we'd do them: the user test first, because it's the assumption we haven't tested.");
}

// ---------- 17. Close ----------
{
  const s = pres.addSlide({ masterName: "DARK" });
  s.addText("No list, no rate.", { placeholder: "title" });
  T(s, "Proofquote checks the quote before the dealer sees it.", { x: 0.6, y: 3.35, w: 7.5, h: 0.6, fontSize: 22, color: C.soft });
  stamp(s, "NOT ON THE LIST", 8.6, 2.2, 3.6, 0.75, 20, true);
  T(s, "Questions", { x: 0.6, y: 6.3, w: 4, h: 0.4, fontSize: 16, color: C.dim });
  s.addNotes("Close on the line. Then take questions; the likely ones and our answers are in HANDOVER.md.");
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  console.log("wrote", f);
  try {
    const { applyTheme } = require(process.env.PPTX_APPLY_THEME || "/Users/rishabhsain/.claude/skills/synced/abc97540-81eb-4c61-ad81-fa2dde1409fa_631c8045-f79a-4f84-975c-42c109204ba8/pptx/scripts/apply_theme.js");
    await applyTheme(OUT, {
      name: "Proofquote", headFontFace: F, bodyFontFace: F,
      colors: { dk1: C.ink, lt1: "FFFFFF", dk2: C.muted, lt2: C.paper, accent1: C.stamp, accent2: C.ok, accent3: "B08A4A", accent4: "4A5A6A", accent5: "8A6A4A", accent6: "5A4A3A", hlink: C.stamp, folHlink: C.muted },
    });
    console.log("theme applied");
  } catch {
    console.log("theme step skipped (apply_theme.js not found); colours are set directly, so the deck is unaffected");
  }
});

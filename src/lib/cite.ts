export type ClaimStatus = "sourced" | "unverified";

export type Claim = {
  id: string;
  /** One line of the draft quote, numbers exactly as the salesperson wrote them. */
  text: string;
  status: ClaimStatus;
  /** The price-list line that backs this claim (sourced only). */
  quote: string | null;
  /** Closest price-list line, shown next to an unverified claim. */
  listSays: string | null;
  reason: string | null;
};

export type QuoteFields = {
  to: string;
  quote_no: string;
  party: string;
};

export type Pack = QuoteFields & {
  lines: { line: string; list: string }[];
  removed: { line: string; list: string | null }[];
  footer: string;
};

export const MIN_QUOTE = 20;
export const MAX_INPUT = 8000;
export const EXTRACT_TIMEOUT_MS = 25000;
export const PACK_FOOTER =
  "Every rate above appears on this week's price list. Checked by Proofquote (AI-assisted); approved by the sales lead.";

const STOP = new Set([
  "gst", "hsn", "per", "the", "this", "that", "with", "from", "for", "and",
  "quote", "quoted", "rate", "rates", "list", "week", "kg", "kilo", "kgs",
  "litre", "liter", "ltr", "special", "please", "only", "our", "your",
]);

export function collapse(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function tooLong(s: string): boolean {
  return s.length > MAX_INPUT;
}

function num(raw: string): string {
  return String(parseFloat(raw.replace(/,/g, "")));
}

/** Every ₹ amount, % slab and HSN code in a line, normalised: "₹62", "18%", "hsn7216". */
export function rateTokens(s: string): Set<string> {
  const t = s.toLowerCase();
  const out = new Set<string>();
  for (const m of t.matchAll(/(?:₹|rs\.?|inr|@)\s*(\d[\d,]*(?:\.\d+)?)(?![\d.,]*\s*%)/g)) out.add(`₹${num(m[1])}`);
  for (const m of t.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(?:\/-)?\s*(?:per|\/)\s*(?:kg|litre|liter|ltr|l\b|piece|pc|nos|mt|ton)/g)) out.add(`₹${num(m[1])}`);
  for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*%/g)) out.add(`${num(m[1])}%`);
  for (const m of t.matchAll(/gst\s*(?:@|at|of)?\s*(\d+(?:\.\d+)?)/g)) out.add(`${num(m[1])}%`);
  for (const m of t.matchAll(/hsn\s*(?:code)?\s*:?\s*(\d{4,8})/g)) out.add(`hsn${m[1]}`);
  return out;
}

const QTY = /^\s*(?:kg|kgs|kilo|l|ltr|litre|liter|litres|pcs|pc|nos|bags|mt|ton|tons|units|sheets)\b/i;

/** Bare numbers that aren't quantities ("400 kg") or part of a size code ("50x50x6"). */
export function bareNumbers(s: string): Set<string> {
  const out = new Set<string>();
  for (const m of s.matchAll(/(?<![\w.])(\d[\d,]*(?:\.\d+)?)(?![\w%])/g)) {
    const after = s.slice((m.index ?? 0) + m[0].length);
    if (QTY.test(after)) continue;
    out.add(num(m[1]));
  }
  return out;
}

function allNumbers(s: string): Set<string> {
  return new Set((s.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map(num));
}

/** Item and term words (≥3 chars, at least one letter), minus filler. */
export function itemWords(s: string): Set<string> {
  const words = s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(words.filter((w) => w.length >= 3 && /[a-z]/.test(w) && !STOP.has(w)));
}

export function listLines(list: string): string[] {
  return list
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => collapse(s).length >= MIN_QUOTE);
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const x of a) if (b.has(x)) n += 1;
  return n;
}

function missing(need: Set<string>, have: Set<string>): string[] {
  return [...need].filter((x) => !have.has(x));
}

/**
 * The rule: a draft line is on the list iff one price-list line (≥20 chars, verbatim in the list)
 * is about the same item and carries every ₹ amount, GST %, HSN code and other number the draft
 * line states (quantities excepted). A line with no rates must have all of its words on that list line.
 */
export function supports(claimText: string, line: string, list: string): boolean {
  if (collapse(line).length < MIN_QUOTE) return false;
  if (!collapse(list).includes(collapse(line))) return false;
  if (missing(bareNumbers(claimText), allNumbers(line)).length > 0) return false;
  const need = rateTokens(claimText);
  const words = itemWords(claimText);
  const lineWords = itemWords(line);
  if (need.size === 0) return words.size > 0 && missing(words, lineWords).length === 0;
  if (missing(need, rateTokens(line)).length > 0) return false;
  return words.size === 0 || overlap(words, lineWords) > 0;
}

/** Closest list line by shared item words, then shared rates. Null if nothing shares a word. */
export function closestLine(claimText: string, list: string): string | null {
  const words = itemWords(claimText);
  const rates = rateTokens(claimText);
  let best: string | null = null;
  let bestScore = 0;
  for (const line of listLines(list)) {
    const w = overlap(words, itemWords(line));
    if (w === 0) continue;
    const score = w * 2 + overlap(rates, rateTokens(line));
    if (score > bestScore) {
      best = line;
      bestScore = score;
    }
  }
  return best;
}

function explain(claimText: string, near: string | null): string {
  if (!near) return "No line on the price list for this item.";
  const gone = missing(rateTokens(claimText), rateTokens(near)).map((t) =>
    t.startsWith("hsn") ? `HSN ${t.slice(3)}` : t,
  );
  if (gone.length === 0) gone.push(...missing(bareNumbers(claimText), allNumbers(near)));
  if (gone.length > 0) return `${gone.join(", ")} isn't on the list line for this item.`;
  return "The list line doesn't say this.";
}

export function verifyClaim(claim: Claim, list: string): Claim {
  const tries = [claim.quote, closestLine(claim.text, list)].filter(
    (q): q is string => typeof q === "string" && q.trim().length > 0,
  );
  for (const q of tries) {
    const line = listLines(list).find((l) => collapse(l) === collapse(q)) ?? q.trim();
    if (supports(claim.text, line, list)) {
      return { ...claim, status: "sourced", quote: line, listSays: null, reason: null };
    }
  }
  const near = closestLine(claim.text, list);
  return {
    ...claim,
    status: "unverified",
    quote: null,
    listSays: near,
    reason: explain(claim.text, near),
  };
}

export function verifyAll(claims: Claim[], list: string): Claim[] {
  return claims.map((c) => verifyClaim(c, list));
}

export function unverifiedCount(claims: Claim[]): number {
  return claims.filter((c) => c.status === "unverified" || !c.quote).length;
}

export function buildPack(
  fields: QuoteFields,
  claims: Claim[],
  removed: Claim[] = [],
): Pack {
  const gone = [...claims.filter((c) => c.status === "unverified"), ...removed];
  const seen = new Set<string>();
  return {
    to: fields.to.trim(),
    quote_no: fields.quote_no.trim(),
    party: fields.party.trim(),
    lines: claims
      .filter((c) => c.status === "sourced" && c.quote)
      .map((c) => ({ line: c.text, list: c.quote as string })),
    removed: gone
      .filter((c) => (seen.has(c.text) ? false : (seen.add(c.text), true)))
      .map((c) => ({ line: c.text, list: c.listSays })),
    footer: PACK_FOOTER,
  };
}

export function formatPackText(pack: Pack): string {
  const lines = pack.lines.map((l) => `- ${l.line}\n  list: ${l.list}`).join("\n");
  const removed =
    pack.removed.length === 0
      ? "- none"
      : pack.removed
          .map((r) => `- ${r.line}${r.list ? `\n  list says: ${r.list}` : ""}`)
          .join("\n");
  return [
    `${pack.quote_no} · ${pack.party}`,
    "",
    "Quote lines (each one is on the price list)",
    lines || "- none",
    "",
    "Removed before sending (not on the list)",
    removed,
    "",
    pack.footer,
  ].join("\n");
}

import {
  type Claim,
  type Pack,
  type QuoteFields,
  buildPack,
  rateTokens,
  unverifiedCount,
  verifyAll,
} from "./cite";

export type CrewLog = { agent: string; line: string };

export type ExtractResult = {
  claims: Claim[];
  pack: Pack;
  unverified_count: number;
  log: CrewLog[];
  source: "local" | "llm" | "fixture";
};

const TERM = /gst|hsn|₹|rs\.?\s*\d|%|per\s+(kg|litre|liter|ltr|piece|pc|nos)|discount|scheme|freight|credit|valid|delivery|payment/i;

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function claim(text: string, quote: string | null = null): Claim {
  return { id: uid(), text, status: "unverified", quote, listSays: null, reason: null };
}

/** One claim per draft line that states a rate or a commercial term. Greetings and blanks are skipped. */
export function splitDraft(draft: string): { lines: string[]; skipped: number } {
  const raw = draft
    .split(/\n+/)
    .map((s) => s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
  const lines = raw.filter((s) => TERM.test(s));
  return { lines, skipped: raw.length - lines.length };
}

function finish(
  claims: Claim[],
  list: string,
  fields: QuoteFields,
  removed: Claim[],
  log: CrewLog[],
  source: ExtractResult["source"],
): ExtractResult {
  const checked = verifyAll(claims, list);
  const ok = checked.filter((c) => c.status === "sourced").length;
  const bad = checked.length - ok;
  log.push({
    agent: "Citation checker",
    line: `${ok} of ${checked.length} lines match a price-list line, rate for rate. ${bad} don't.`,
  });
  const pack = buildPack(fields, checked, removed);
  log.push({
    agent: "Pack writer",
    line: `Quote has ${pack.lines.length} lines, each shown with the list line behind it.`,
  });
  log.push({
    agent: "Critic",
    line:
      bad === 0
        ? "Nothing off-list. Send is open."
        : `Holding send. Remove or fix: ${checked
            .filter((c) => c.status === "unverified")
            .map((c) => `“${c.text}”`)
            .join(", ")}.`,
  });
  return { claims: checked, pack, unverified_count: unverifiedCount(checked), log, source };
}

export function localExtract(
  list: string,
  draft: string,
  fields: QuoteFields,
  removed: Claim[] = [],
): ExtractResult {
  const { lines, skipped } = splitDraft(draft);
  const log: CrewLog[] = [
    {
      agent: "Extractor",
      line: `${lines.length} priced lines in the draft${skipped ? `; skipped ${skipped} with no rate or term` : ""}.`,
    },
  ];
  return finish(lines.map((t) => claim(t)), list, fields, removed, log, "local");
}

export function recheck(
  claims: Claim[],
  list: string,
  fields: QuoteFields,
  removed: Claim[],
): ExtractResult {
  const log: CrewLog[] = [
    { agent: "Extractor", line: "Draft unchanged. Re-reading the updated price list." },
  ];
  return finish(
    claims.map((c) => ({ ...c, quote: null })),
    list,
    fields,
    removed,
    log,
    "local",
  );
}

/**
 * Model output is never trusted as-is: a model line whose rates are not in the draft is thrown away,
 * and every remaining line goes through the same citation check as the local path.
 */
export function parseExtractJson(
  raw: unknown,
  list: string,
  draft: string,
  fields: QuoteFields,
  removed: Claim[] = [],
  source: ExtractResult["source"] = "llm",
): ExtractResult {
  const body = raw as { claims?: Array<{ text?: unknown; quote?: unknown }> };
  const incoming = Array.isArray(body.claims) ? body.claims : [];
  const draftRates = rateTokens(draft);
  let invented = 0;
  const claims: Claim[] = [];
  for (const c of incoming) {
    if (typeof c.text !== "string" || !c.text.trim()) continue;
    const extra = [...rateTokens(c.text)].filter((t) => !draftRates.has(t));
    if (extra.length > 0) {
      invented += 1;
      continue;
    }
    claims.push(claim(c.text.trim(), typeof c.quote === "string" ? c.quote : null));
  }
  const log: CrewLog[] = [
    {
      agent: "Extractor",
      line: `${claims.length} priced lines from the model${invented ? `; threw away ${invented} with rates that aren't in the draft` : ""}.`,
    },
  ];
  return finish(claims, list, fields, removed, log, source);
}

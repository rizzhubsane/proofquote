import { writeFileSync } from "node:fs";
import { join } from "node:path";

export type PackBody = {
  to?: string;
  quote_no?: string;
  party?: string;
  lines?: Array<{ line?: string; list?: string }>;
  removed?: Array<{ line?: string; list?: string | null }>;
  footer?: string;
};

export type Keys = { openai?: string; gemini?: string };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function numbersIn(s: string): Set<string> {
  return new Set((s.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => String(parseFloat(n.replace(/,/g, "")))));
}

const SYSTEM = `You split a salesperson's draft quote into checkable lines. Reply with one JSON object, no markdown.

LIST is this week's price list. It is the only source of truth.
DRAFT is what the salesperson wants to send. It may be messy, Hinglish, or WhatsApp-style.

For each rate, GST %, HSN code, discount, freight, credit or validity term in DRAFT:
- "text": that line in plain English, with every number exactly as DRAFT has it. Never correct a number to match LIST.
- "quote": the one LIST line that backs it, copied character for character. null if no LIST line backs it.

Do not add lines that are not in DRAFT.
Return {"claims":[{"text":"...","quote":"... or null"}]}`;

function userMessage(list: string, draft: string) {
  return `LIST:\n${list}\n\nDRAFT:\n${draft}`;
}

async function extractOpenAI(apiKey: string, list: string, draft: string) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage(list, draft) },
      ],
    }),
  });
  const data = (await r.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  if (!r.ok) return { ok: false as const, status: 502, error: data.error?.message || "openai_failed" };
  return { ok: true as const, body: JSON.parse(data.choices?.[0]?.message?.content || "{}") };
}

async function extractGemini(apiKey: string, list: string, draft: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: userMessage(list, draft) }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
  });
  const data = (await r.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };
  if (!r.ok) return { ok: false as const, status: 502, error: data.error?.message || "gemini_failed" };
  return { ok: true as const, body: JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}") };
}

function dealerPrompt(pack: PackBody): string {
  const lines = (pack.lines ?? []).map((l) => `- ${l.line} | list: ${l.list}`).join("\n");
  return [
    `Write a short WhatsApp message from a distributor salesperson to the dealer ${pack.party}, sharing quote ${pack.quote_no}.`,
    "Polite, plain, at most 6 lines. Hinglish is fine.",
    "Use ONLY the quote lines below and the GST rate on their list line.",
    "Do not add any number, discount, scheme, rate or date that is not below.",
    "",
    lines,
  ].join("\n");
}

type DealerMessage = { message: string; note: string };

function checkDealerMessage(pack: PackBody, drafted: string, by: string): DealerMessage {
  const lines = pack.lines ?? [];
  const template = `Namaste. Quote ${pack.quote_no} for ${pack.party}:\n${lines.map((l) => `• ${l.line}`).join("\n")}\nGST as per our price list. Thank you.`;
  if (!drafted) return { message: template, note: "Template (no model key on the server)" };
  const allowed = new Set([
    ...numbersIn(pack.quote_no || ""),
    ...lines.flatMap((l) => [...numbersIn(l.line || ""), ...numbersIn(l.list || "")]),
  ]);
  const extra = [...numbersIn(drafted)].filter((n) => !allowed.has(n));
  if (extra.length > 0) return { message: template, note: `${by} draft rejected: it added ${extra.join(", ")}. Template used` };
  return { message: drafted, note: `Written by ${by}; every number checked against the quote lines` };
}

export function packToHtml(pack: PackBody, dealer?: DealerMessage): string {
  const rows = (pack.lines ?? [])
    .map(
      (l) =>
        `<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #d8d0c0;vertical-align:top">${escapeHtml(l.line || "")}</td><td style="padding:10px 0;border-top:1px solid #d8d0c0;color:#6a6458;font-size:13px;vertical-align:top">${escapeHtml(l.list || "")}</td></tr>`,
    )
    .join("");
  const removed = (pack.removed ?? [])
    .map(
      (r) =>
        `<li style="margin-bottom:6px"><s>${escapeHtml(r.line || "")}</s>${r.list ? ` <span style="color:#6a6458;font-size:13px">List says: ${escapeHtml(r.list)}</span>` : ""}</li>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(pack.quote_no || "Quote")} · ${escapeHtml(pack.party || "")}</title></head>
<body style="font-family:Georgia,serif;background:#f3efe4;color:#1c1914;margin:0;padding:32px">
<article style="max-width:680px;margin:0 auto;background:#fffdf8;border:1px solid #1c1914;padding:32px">
  <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6a6458">Proofquote</div>
  <h1 style="font-size:26px;margin:6px 0 2px">${escapeHtml(pack.quote_no || "")}</h1>
  <div style="color:#6a6458;margin-bottom:20px">${escapeHtml(pack.party || "")}</div>
  <table style="width:100%;border-collapse:collapse">
    <thead><tr><th align="left" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding-bottom:6px">Quote line</th><th align="left" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding-bottom:6px">Price-list line</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="2">None on the list.</td></tr>'}</tbody>
  </table>
  ${removed ? `<h2 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin:24px 0 8px">Removed before sending</h2><ul style="padding-left:18px">${removed}</ul>` : ""}
  ${dealer ? `<h2 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin:24px 0 8px">WhatsApp draft for ${escapeHtml(pack.party || "the dealer")}</h2><pre style="white-space:pre-wrap;font-family:Georgia,serif;background:#f3efe4;padding:14px;margin:0">${escapeHtml(dealer.message)}</pre><div style="color:#6a6458;font-size:12px;margin-top:6px">${escapeHtml(dealer.note)}</div>` : ""}
  <p style="color:#6a6458;font-style:italic;margin-top:24px">${escapeHtml(pack.footer || "")}</p>
</article>
</body></html>`;
}

async function writeText(keys: Keys, prompt: string): Promise<{ text: string; by: string }> {
  const openai = keys.openai?.trim() || "";
  const gemini = keys.gemini?.trim() || "";
  try {
    if (gemini) {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(gemini)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3 } }),
        },
      );
      const data = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return { text: data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "", by: "Gemini" };
    }
    if (openai) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openai}` },
        body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.3, messages: [{ role: "user", content: prompt }] }),
      });
      const data = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return { text: data.choices?.[0]?.message?.content?.trim() || "", by: "OpenAI" };
    }
  } catch {
    return { text: "", by: "model" };
  }
  return { text: "", by: "model" };
}

export async function handleExtract(body: { list?: string; draft?: string }, keys: Keys) {
  const openai = keys.openai?.trim() || "";
  const gemini = keys.gemini?.trim() || "";
  if (!openai && !gemini) return { status: 501, json: { error: "no_llm_key" } };
  const { list, draft } = body;
  if (typeof list !== "string" || typeof draft !== "string" || !list.trim() || !draft.trim()) {
    return { status: 400, json: { error: "list_and_draft_required" } };
  }
  const result = openai ? await extractOpenAI(openai, list, draft) : await extractGemini(gemini, list, draft);
  if (!result.ok) return { status: result.status, json: { error: result.error } };
  return { status: 200, json: result.body };
}

export async function handleSend(pack: PackBody, keys: Keys) {
  if ((pack.lines ?? []).length === 0) return { status: 400, json: { error: "no_checked_lines" } };
  const drafted = await writeText(keys, dealerPrompt(pack));
  const dealer = checkDealerMessage(pack, drafted.text, drafted.by);
  const html = packToHtml(pack, dealer);
  try {
    writeFileSync(join(process.cwd(), "public/n8n-last-run.html"), html);
    writeFileSync(
      join(process.cwd(), "n8n/last-run.json"),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          via: "local-render (no webhook set, nothing emailed)",
          subject: `${pack.quote_no || "Quote"} · ${pack.party || ""}`,
          to: pack.to || "",
          dealer_message: dealer,
          pack,
        },
        null,
        2,
      ),
    );
  } catch {
    // Vercel’s filesystem is read-only. The HTML goes back in the response instead.
  }
  return {
    status: 200,
    json: { ok: true, via: "render", url: "/n8n-last-run.html", note: dealer.note, html },
  };
}

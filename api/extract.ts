import { handleExtract } from "../server/handlers.js";

type Req = { method?: string; body?: { list?: string; draft?: string } };
type Res = { status: (code: number) => { json: (body: unknown) => void } };

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  try {
    const out = await handleExtract(req.body || {}, {
      openai: process.env.OPENAI_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    });
    res.status(out.status).json(out.json);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "extract_failed" });
  }
}

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { handleExtract, handleSend, type Keys, type PackBody } from "./handlers";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function geminiExtractPlugin(keys: Keys): Plugin {
  return {
    name: "proofquote-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";
        if (url === "/api/send" && req.method === "POST") {
          try {
            const body = JSON.parse(await readBody(req)) as { pack?: PackBody };
            const out = await handleSend(body.pack || {}, keys);
            json(res, out.status, out.json);
          } catch (e) {
            json(res, 500, { error: e instanceof Error ? e.message : "send_failed" });
          }
          return;
        }
        if (url !== "/api/extract" || req.method !== "POST") {
          next();
          return;
        }
        try {
          const body = JSON.parse(await readBody(req)) as { list?: string; draft?: string };
          const out = await handleExtract(body, keys);
          json(res, out.status, out.json);
        } catch (e) {
          json(res, 500, { error: e instanceof Error ? e.message : "extract_failed" });
        }
      });
    },
  };
}

// Screenshots of the running app for the deck: node scripts/shots.mjs [outDir]
// Needs `npm run dev` on :5173 and Google Chrome installed.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:5173";
const OUT = process.argv[2] || "endterm/shots";
const PORT = 9333;

mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/pq-chrome-${Date.now()}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await target());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
function send(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((r) => pending.set(id, r));
}
async function js(expression) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return r.result?.result?.value;
}
async function go(url) {
  await send("Page.navigate", { url });
  await sleep(1500);
}
async function shot(name, { width = 1280, height = 820, full = false } = {}) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: false });
  await sleep(300);
  let h = height;
  if (full) h = Math.ceil(await js("document.documentElement.scrollHeight"));
  await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 2, mobile: false });
  await sleep(400);
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(r.result.data, "base64"));
  console.log("wrote", join(OUT, `${name}.png`));
}
const click = (text) =>
  js(`(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim().startsWith(${JSON.stringify(text)})); if (!b) return 'missing'; b.click(); return 'ok'; })()`);

try {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 820, deviceScaleFactor: 2, mobile: false });

  await go(`${BASE}/#/`);
  await sleep(800);
  await shot("landing", { full: true });
  await shot("landing-hero", { height: 760 });

  await go(`${BASE}/#/app`);
  await shot("app-paste", { height: 720 });

  console.log("check:", await click("Check the draft"));
  await sleep(2500);
  await shot("app-check", { height: 820 });
  console.log(await js("document.querySelector('.log')?.innerText"));

  await click("Review quote");
  await sleep(500);
  await shot("app-blocked", { height: 820 });

  await click("Back");
  await sleep(300);
  for (let i = 0; i < 4; i++) {
    const r = await js(`(() => { const li = document.querySelector('.checks li.bad'); if (!li) return 'none'; li.querySelector('button.link').click(); return 'removed'; })()`);
    if (r === "none") break;
    await sleep(300);
  }
  await click("Review quote");
  await sleep(500);
  await shot("app-send", { height: 820 });
  console.log("send:", await click("Send to"));
  await sleep(1500);
  console.log(await js("document.querySelector('.hint')?.innerText"));
  await go(`${BASE}/n8n-last-run.html`);
  await shot("email", { width: 900, height: 720, full: true });

  await go(`${BASE}/#/film`);
  await sleep(500);
  await shot("film", { height: 760 });
} finally {
  ws.close();
  chrome.kill();
}

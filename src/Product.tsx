import { type ChangeEvent, useMemo, useState } from "react";
import {
  EXTRACT_TIMEOUT_MS,
  MAX_INPUT,
  type Claim,
  type QuoteFields,
  buildPack,
  formatPackText,
  tooLong,
  unverifiedCount,
} from "./lib/cite";
import { DEMO_DRAFT, DEMO_FIELDS, DEMO_LIST } from "./lib/dummy";
import {
  type CrewLog,
  type ExtractResult,
  localExtract,
  parseExtractJson,
  recheck,
} from "./lib/pipeline";

type Screen = "paste" | "check" | "send";

const isDemo =
  new URLSearchParams(window.location.search).get("mode") !== "tester";

const SOURCE_LABEL: Record<ExtractResult["source"], string> = {
  local: "Rules only (no model key on the server)",
  llm: "Model extracted, rules checked",
  fixture: "Model timed out; saved demo output, rules checked",
};

export default function Product() {
  const [screen, setScreen] = useState<Screen>("paste");
  const [fields, setFields] = useState<QuoteFields>(isDemo ? { ...DEMO_FIELDS } : { to: "", quote_no: "", party: "" });
  const [list, setList] = useState(isDemo ? DEMO_LIST : "");
  const [draft, setDraft] = useState(isDemo ? DEMO_DRAFT : "");
  const [addition, setAddition] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [removed, setRemoved] = useState<Claim[]>([]);
  const [log, setLog] = useState<CrewLog[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [emailHref, setEmailHref] = useState("/n8n-last-run.html");
  const [source, setSource] = useState<ExtractResult["source"] | null>(null);

  const open = unverifiedCount(claims);
  const over = tooLong(list) || tooLong(draft);
  const missingInput = !list.trim() || !draft.trim();
  const pack = useMemo(() => buildPack(fields, claims, removed), [fields, claims, removed]);

  function apply(result: ExtractResult) {
    setClaims(result.claims);
    setLog(result.log);
    setSource(result.source);
    setError("");
    setScreen("check");
  }

  async function check() {
    if (missingInput || over || busy) return;
    setBusy(true);
    setError("");
    setSent("");
    setRemoved([]);
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), EXTRACT_TIMEOUT_MS);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list, draft }),
        signal: ctrl.signal,
      });
      const body: unknown = res.ok ? await res.json().catch(() => null) : null;
      const noModel = res.status === 501 || res.status === 404 || res.status === 405 || (res.ok && body === null);
      if (noModel) {
        apply(localExtract(list, draft, fields));
        return;
      }
      if (!res.ok) throw new Error(`extract ${res.status}`);
      apply(parseExtractJson(body, list, draft, fields));
    } catch {
      if (isDemo) {
        const fx = await fetch("/fixture.json").then((r) => r.json());
        apply(parseExtractJson(fx, list, draft, fields, [], "fixture"));
      } else {
        setError("The model didn't answer in time. Try again, or remove the server key to run on rules only.");
      }
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
    }
  }

  function remove(id: string) {
    const gone = claims.find((c) => c.id === id);
    if (!gone) return;
    setClaims(claims.filter((c) => c.id !== id));
    setRemoved([...removed, gone]);
  }

  function addToList() {
    const next = addition.trim() ? `${list.trim()}\n${addition.trim()}` : list;
    if (tooLong(next)) {
      setError(`Price list is over ${MAX_INPUT} characters.`);
      return;
    }
    setList(next);
    setAddition("");
    const result = recheck(claims, next, fields, removed);
    setClaims(result.claims);
    setLog(result.log);
    setError("");
  }

  async function send() {
    if (open > 0 || busy) return;
    setBusy(true);
    setSent("");
    setError("");
    const hook = import.meta.env.VITE_N8N_WEBHOOK;
    try {
      const res = await fetch(hook || "/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      if (!res.ok) throw new Error("send");
      const data = (await res.json().catch(() => null)) as { html?: string } | null;
      if (data?.html) {
        setEmailHref(URL.createObjectURL(new Blob([data.html], { type: "text/html" })));
      }
      setSent(
        hook
          ? `Sent to n8n. Gmail delivers it to ${pack.to}.`
          : "No n8n webhook set, so the email was rendered here instead of sent.",
      );
    } catch {
      await navigator.clipboard.writeText(formatPackText(pack)).catch(() => undefined);
      setError("Couldn't reach the send step. The quote is on your clipboard.");
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof QuoteFields) => ({
    id: key,
    value: fields[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setFields({ ...fields, [key]: e.target.value }),
  });

  return (
    <div className="product">
      <header className="prod-nav">
        <a className="brand" href="#/">
          <img src="/brand/logo.svg" width={28} height={28} alt="" />
          Proofquote
        </a>
        <div className="prod-meta">
          {isDemo ? (
            <>Sample data: a made-up distributor · <a href="?mode=tester#/app">use your own</a></>
          ) : (
            <>Your data · nothing is stored</>
          )}
        </div>
      </header>

      <div className="app">
        <nav className="steps" aria-label="Progress">
          <span className={screen === "paste" ? "on" : ""}>1 Paste</span>
          <span className={screen === "check" ? "on" : ""}>2 Check</span>
          <span className={screen === "send" ? "on" : ""}>3 Send</span>
        </nav>

        <div className="grid">
          <main>
            {screen === "paste" && (
              <section>
                <div className="row2 inputs">
                  <div>
                    <label htmlFor="list">This week's price list</label>
                    <textarea id="list" value={list} onChange={(e) => setList(e.target.value)} placeholder="One item per line: rate, GST %, HSN." />
                    <div className="hint">The only source of truth. Copy it from Tally or the PDF.</div>
                  </div>
                  <div>
                    <label htmlFor="draft">Draft quote</label>
                    <textarea id="draft" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="One line per item or term, as you'd send it." />
                    <div className="hint">What you're about to send. Every rate in it gets checked.</div>
                  </div>
                </div>
                <div className="row3">
                  <div>
                    <label htmlFor="quote_no">Quote no.</label>
                    <input {...field("quote_no")} />
                  </div>
                  <div>
                    <label htmlFor="party">Party</label>
                    <input {...field("party")} />
                  </div>
                  <div>
                    <label htmlFor="to">Send to</label>
                    <input type="email" {...field("to")} />
                  </div>
                </div>
                {over && <p className="warn">Keep each box under {MAX_INPUT} characters.</p>}
                <button className="btn" disabled={missingInput || over || busy} onClick={() => void check()}>
                  {busy ? "Checking…" : "Check the draft against the list"}
                </button>
                {error && <p className="warn">{error}</p>}
              </section>
            )}

            {screen === "check" && (
              <section>
                <p className="summary">
                  {claims.length === 0
                    ? "No priced lines found in the draft."
                    : open === 0
                      ? `All ${claims.length} lines are on the list.`
                      : `${open} of ${claims.length} lines aren't on the list. Remove them, or add the missing line to the list if it's real.`}
                </p>
                <ol className="checks">
                  {claims.map((c) => (
                    <li key={c.id} className={c.status === "sourced" ? "ok" : "bad"}>
                      <div className="mark">{c.status === "sourced" ? "On the list" : "Not on the list"}</div>
                      <div>
                        <div className="line">{c.text}</div>
                        {c.status === "sourced" ? (
                          <div className="src-line">List: {c.quote}</div>
                        ) : (
                          <>
                            <div className="why">{c.reason}</div>
                            {c.listSays && <div className="src-line">List says: {c.listSays}</div>}
                          </>
                        )}
                      </div>
                      <button className="link" type="button" onClick={() => remove(c.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ol>
                <label htmlFor="addition">Price list missing a line? Add it and re-check</label>
                <textarea id="addition" className="short" value={addition} onChange={(e) => setAddition(e.target.value)} />
                <div className="actions">
                  <button className="btn ghost" type="button" onClick={() => setScreen("paste")}>Back</button>
                  <button className="btn ghost" type="button" disabled={!addition.trim()} onClick={addToList}>Add and re-check</button>
                  <button className="btn" type="button" onClick={() => setScreen("send")}>Review quote</button>
                </div>
                {error && <p className="warn">{error}</p>}
              </section>
            )}

            {screen === "send" && (
              <section>
                <article className="pack">
                  <div className="pack-head">
                    <h2>{pack.quote_no || "Quote"}</h2>
                    <div className="meta">{pack.party}</div>
                  </div>
                  <h3>Quote lines</h3>
                  <table>
                    <tbody>
                      {pack.lines.length === 0 && (
                        <tr><td colSpan={2}>None on the list.</td></tr>
                      )}
                      {pack.lines.map((l) => (
                        <tr key={l.line}>
                          <td>{l.line}</td>
                          <td className="src-line">{l.list}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pack.removed.length > 0 && (
                    <>
                      <h3>Removed before sending</h3>
                      <ul className="removed">
                        {pack.removed.map((r) => (
                          <li key={r.line}>
                            <s>{r.line}</s>
                            {r.list && <span className="src-line"> List says: {r.list}</span>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="footer">{pack.footer}</p>
                </article>
                {open > 0 && (
                  <p className="warn">
                    {open} line{open === 1 ? " is" : "s are"} still not on the list. Go back and remove {open === 1 ? "it" : "them"} to send.
                  </p>
                )}
                <div className="actions">
                  <button className="btn ghost" type="button" onClick={() => setScreen("check")}>Back</button>
                  <button className="btn" type="button" disabled={open > 0 || busy || !pack.to} onClick={() => void send()}>
                    Send to {pack.to || "…"}
                  </button>
                </div>
                {sent && (
                  <p className="hint">
                    {sent}{" "}
                    <a href={emailHref} target="_blank" rel="noreferrer">Open the email</a>
                  </p>
                )}
                {error && <p className="warn">{error}</p>}
              </section>
            )}
          </main>

          <aside>
            <div className="log">
              <h3>Run log</h3>
              {log.length === 0 && <div>Extractor, Citation checker, Pack writer, Critic. They run in that order, once.</div>}
              {log.map((l, i) => (
                <div key={i} className="log-row">
                  <strong>{l.agent}</strong> {l.line}
                </div>
              ))}
              {source && <div className="src">{SOURCE_LABEL[source]}</div>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

const SCENES = [
  {
    kicker: "00:00",
    title: "9:40 pm. Sharma wants the quote tonight.",
    body: "WhatsApp from Sharma Traders: “12% lagao, 18 nahi chalega.” Ravi's price list says 18.",
    visual: "still",
  },
  {
    kicker: "00:15",
    title: "So the draft says 12%.",
    body: "It reads like a normal quote. Ask a chatbot to tidy it and the 12% comes back cleaner.",
    visual: "bait",
  },
  {
    kicker: "00:30",
    title: "Proofquote takes two things.",
    body: "This week's price list, and the draft. The list is the only source of truth.",
    visual: "dump",
  },
  {
    kicker: "00:45",
    title: "Every rate has to be on the list.",
    body: "For each draft line it finds the list line for that item. Every ₹, GST % and HSN in the draft must be on it.",
    visual: "crew",
  },
  {
    kicker: "01:05",
    title: "12% isn't on the list line for MS angle.",
    body: "The 15% festive scheme isn't either. The list says no scheme this week.",
    visual: "claim",
  },
  {
    kicker: "01:25",
    title: "Remove it, or fix the list.",
    body: "Proofquote never types 18% in for you. Ravi decides. Send stays shut until nothing is off the list.",
    visual: "pack",
  },
  {
    kicker: "01:45",
    title: "Other tools write the quote. Proofquote checks it.",
    body: "n8n emails the checked quote, each rate printed next to the list line behind it.",
    visual: "send",
  },
  {
    kicker: "01:55",
    title: "No list, no rate.",
    body: "Goyal Distributors and Sharma Traders are made up. Stills are AI-generated.",
    visual: "end",
  },
] as const;

const DURATION_MS = 120_000;

export default function Film() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((prev) => {
        const next = prev + 250;
        if (next >= DURATION_MS) {
          window.clearInterval(id);
          return DURATION_MS;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing]);

  const sceneIndex = Math.min(
    SCENES.length - 1,
    Math.floor((t / DURATION_MS) * SCENES.length),
  );
  const scene = SCENES[sceneIndex];
  const progress = t / DURATION_MS;

  return (
    <div className="film">
      <header className="film-bar">
        <a className="brand" href="#/">
          <img src="/brand/logo.svg" width={28} height={28} alt="" />
          Proofquote
        </a>
        <div className="film-controls">
          <button type="button" className="btn ghost" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setT(0);
              setPlaying(true);
            }}
          >
            Restart
          </button>
          <a className="btn ghost" href="#/app">
            App
          </a>
        </div>
      </header>

      <div className="film-stage" data-visual={scene.visual}>
        <img src="/brand/launch-16x9.jpg" alt="" />
        {scene.visual === "bait" && (
          <pre className="film-card">{`400 kg MS angle 50x50x6 at ₹62 per kg
20 L red oxide primer at ₹180 per litre
GST 12% on MS angle (Sharma special)
15% festive scheme discount on this quote`}</pre>
        )}
        {scene.visual === "dump" && (
          <pre className="film-card">{`Price list · week of 21 Oct
MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216.
Red oxide primer: ₹180 per litre. GST 18%. HSN 3208.
No scheme discount this week.`}</pre>
        )}
        {scene.visual === "crew" && (
          <ol className="film-crew">
            <li>Extractor</li>
            <li>Citation checker</li>
            <li>Pack writer</li>
            <li>Critic</li>
          </ol>
        )}
        {scene.visual === "claim" && (
          <article className="film-card unverified">
            <div className="film-flag">Not on the list</div>
            GST 12% on MS angle (Sharma special)
            <div className="src-line">List says: MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216.</div>
          </article>
        )}
        {scene.visual === "pack" && (
          <article className="film-card">
            <div className="film-flag">Removed before sending</div>
            <p><s>GST 12% on MS angle (Sharma special)</s></p>
            <p><s>15% festive scheme discount on this quote</s></p>
          </article>
        )}
        {scene.visual === "send" && (
          <div className="film-card">Q-1042 · Sharma Traders, Ambala<div className="src-line">3 lines, each on the list</div></div>
        )}
        <div className="film-copy">
          <p className="kicker">{scene.kicker}</p>
          <h1>{scene.title}</h1>
          <p>{scene.body}</p>
        </div>
      </div>

      <div className="film-progress" aria-hidden="true">
        <i style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="cap film-note">
        Background still is AI-generated. No avatar, no cloned voice.
      </p>
    </div>
  );
}

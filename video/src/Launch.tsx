import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import cues from "./cues.json";

const C = {
  ink: "#1C1914",
  paper: "#F3EFE4",
  card: "#FFFDF8",
  muted: "#6A6458",
  rule: "#D8D0C0",
  stamp: "#9A1F1F",
  ok: "#1F4D3A",
  gold: "#E4C56A",
  soft: "#C8C0B2",
  chat: "#E7F0DE",
};

const FONT = 'Georgia, "Iowan Old Style", Palatino, "Palatino Linotype", serif';

const ROWS = [
  {
    ok: true,
    line: "400 kg MS angle 50x50x6 at ₹62 per kg",
    note: "MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216.",
  },
  {
    ok: true,
    line: "20 L red oxide primer at ₹180 per litre",
    note: "Red oxide primer: ₹180 per litre. GST 18%. HSN 3208.",
  },
  {
    ok: false,
    line: "GST 12% on MS angle (Sharma special)",
    note: "12% isn't on the list line for this item.",
    says: "MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216.",
  },
  {
    ok: false,
    line: "15% festive scheme discount on this quote",
    note: "15% isn't on the list line for this item.",
    says: "No scheme discount this week.",
  },
  {
    ok: true,
    line: "Freight extra at actuals",
    note: "Freight extra at actuals. Quotes valid 7 days.",
  },
];

const ROW_AT = [1290, 1312, 1334, 1356, 1378];
const ROW_STEP = 108;

function clampFade(frame: number, start: number, end: number, inn = 16, out = 16) {
  const a = interpolate(frame, [start, start + inn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const b = interpolate(frame, [end - out, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(a, b);
}

function rowPos(i: number) {
  return { x: 1610, y: 218 + i * ROW_STEP };
}

function cursorAt(frame: number) {
  const pasteBtn = { x: 960, y: 714 };
  const sendBtn = { x: 960, y: 824 };
  const pts = [
    { f: 900, x: 1580, y: 860 },
    { f: 1100, x: 1580, y: 860 },
    { f: 1230, x: pasteBtn.x, y: pasteBtn.y },
    { f: 1400, x: pasteBtn.x, y: pasteBtn.y },
    { f: 1720, x: rowPos(2).x, y: rowPos(2).y },
    { f: 1860, x: rowPos(2).x, y: rowPos(2).y },
    { f: 1960, x: rowPos(3).x, y: rowPos(3).y },
    { f: 2040, x: rowPos(3).x, y: rowPos(3).y },
    { f: 2240, x: sendBtn.x, y: sendBtn.y },
    { f: 2520, x: sendBtn.x, y: sendBtn.y },
  ];
  let i = 0;
  while (i < pts.length - 2 && frame >= pts[i + 1].f) i += 1;
  const a = pts[i];
  const b = pts[i + 1];
  if (b.f <= a.f) return { x: b.x, y: b.y };
  const p = interpolate(frame, [a.f, b.f], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
}

function Slip({
  kicker,
  big,
  bigColor,
  strike,
  lines,
  x,
  y,
}: {
  kicker: string;
  big: string;
  bigColor: string;
  strike: number;
  lines: string[];
  x: number;
  y: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 700,
        background: C.card,
        border: `1px solid ${C.ink}`,
        padding: "36px 44px 48px",
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      <div style={{ fontSize: 15, letterSpacing: 3, color: C.muted }}>{kicker}</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 18 }}>
        <div style={{ fontSize: 148, lineHeight: 0.9, fontWeight: 700, color: bigColor }}>{big}</div>
        {strike > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "52%",
              height: 6,
              width: `${strike * 100}%`,
              background: C.stamp,
            }}
          />
        )}
      </div>
      {lines.map((line) => (
        <div key={line} style={{ fontSize: 26, marginTop: 14, color: C.ink }}>
          {line}
        </div>
      ))}
    </div>
  );
}

export const Launch = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sc = cues.scene;
  const checking = frame >= 1272;
  const open = (frame < 1860 ? 1 : 0) + (frame < 2040 ? 1 : 0);
  const sendOpen = checking && open === 0;
  const pressCheck = frame >= 1240 && frame < 1250;
  const pressSend = frame >= 2360 && frame < 2372;
  const cur = cursorAt(frame);
  const showCursor = frame >= sc.app && frame < sc.email;

  const chatOp = clampFade(frame, sc.chat, sc.slips, 18, 14);
  const slipOp = clampFade(frame, sc.slips, sc.title, 16, 14);
  const titleOp = clampFade(frame, sc.title, sc.app, 16, 14);
  const appOp = clampFade(frame, sc.app, sc.email + 16, 14, 14);
  const emailOp = clampFade(frame, sc.email - 8, sc.end, 16, 14);
  const endOp = clampFade(frame, sc.end, durationInFrames + 30, 18, 8);
  const rise = interpolate(frame, [sc.slips, sc.title], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strike = interpolate(frame, [470, 530], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampSpr = spring({
    frame: frame - sc.stamp,
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.8 },
  });

  const lineA = interpolate(frame, [sc.end, sc.end + 20, 3348, 3390], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineB = interpolate(frame, [3368, 3410], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT, color: C.ink }}>
      <Audio src={staticFile("score.wav")} />

      <AbsoluteFill style={{ opacity: chatOp }}>
        <div style={{ position: "absolute", left: 140, top: 250 }}>
          <div style={{ fontSize: 16, letterSpacing: 3, color: C.stamp }}>AMBALA · 9:40 PM</div>
          <div
            style={{
              marginTop: 28,
              background: C.chat,
              borderRadius: 16,
              padding: "32px 40px 36px",
              display: "inline-block",
            }}
          >
            <div style={{ fontSize: 15, letterSpacing: 2.4, color: C.muted }}>SHARMA TRADERS</div>
            <div style={{ fontSize: 72, lineHeight: 1.12, marginTop: 10 }}>
              12% lagao,
              <br />
              18 nahi chalega.
            </div>
          </div>
          <div style={{ marginTop: 28, fontSize: 22, color: C.muted }}>
            A dealer, asking for a lower GST slab in the same chat as the order.
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: slipOp }}>
        <div style={{ position: "absolute", left: 140, top: 72, fontSize: 16, letterSpacing: 3, color: C.stamp }}>
          THE SAME NUMBER, TWO PLACES
        </div>
        <Slip
          kicker="THIS WEEK'S PRICE LIST"
          big="18%"
          bigColor={C.ok}
          strike={0}
          lines={["GST on MS angle", "₹62 per kg · HSN 7216"]}
          x={140}
          y={150 + rise}
        />
        <Slip
          kicker="THE DRAFT, READY TO SEND"
          big="12%"
          bigColor={C.stamp}
          strike={strike}
          lines={["GST on MS angle", "Sharma special"]}
          x={1040}
          y={190 + rise}
        />
        {frame >= sc.stamp && (
          <div
            style={{
              position: "absolute",
              left: 1460,
              top: 500,
              transform: `rotate(${interpolate(stampSpr, [0, 1], [-16, -7])}deg) scale(${interpolate(stampSpr, [0, 1], [1.45, 1])})`,
              opacity: stampSpr,
              border: `3px solid ${C.stamp}`,
              color: C.stamp,
              background: C.card,
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: 28,
              padding: "12px 18px",
            }}
          >
            NOT ON THE LIST
          </div>
        )}
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: titleOp }}>
        <div style={{ position: "absolute", left: 140, top: 300 }}>
          <div style={{ fontSize: 18, letterSpacing: 3, color: C.stamp }}>PROOFQUOTE</div>
          <div style={{ fontSize: 108, lineHeight: 0.95, marginTop: 12, fontWeight: 700 }}>No list, no rate.</div>
          <div style={{ fontSize: 30, marginTop: 28, maxWidth: 920, color: C.muted }}>
            Every rate on the quote has to be on this week's price list. Or it does not go out.
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: appOp }}>
        <div
          style={{
            position: "absolute",
            left: 240,
            top: checking ? 80 : 230,
            width: 1440,
            height: checking ? 860 : 560,
            background: C.card,
            border: `1px solid ${C.ink}`,
            boxShadow: "0 30px 70px rgba(28,25,20,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", padding: "26px 40px 0" }}>
            <div style={{ fontSize: 15, letterSpacing: 3 }}>PROOFQUOTE</div>
            <div style={{ fontSize: 15, color: C.muted }}>Q-1042 · Sharma Traders, Ambala</div>
          </div>

          {!checking && (
            <div style={{ display: "flex", gap: 28, padding: "28px 40px 0" }}>
              <Field
                kicker="THIS WEEK'S PRICE LIST"
                lines={[
                  "MS angle 50x50x6: ₹62 per kg. GST 18%. HSN 7216.",
                  "Red oxide primer: ₹180 per litre. GST 18%. HSN 3208.",
                  "No scheme discount this week.",
                  "Freight extra at actuals.",
                ]}
              />
              <Field
                kicker="DRAFT QUOTE"
                lines={[
                  "400 kg MS angle 50x50x6 at ₹62 per kg",
                  "20 L red oxide primer at ₹180 per litre",
                  "GST 12% on MS angle (Sharma special)",
                  "15% festive scheme discount on this quote",
                  "Freight extra at actuals",
                ]}
                warn={[2, 3]}
              />
            </div>
          )}

          {checking &&
            ROWS.map((row, i) => {
              const shown = interpolate(frame, [ROW_AT[i], ROW_AT[i] + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const gone = (i === 2 && frame >= 1860) || (i === 3 && frame >= 2040);
              return (
                <div
                  key={row.line}
                  style={{
                    position: "absolute",
                    left: 40,
                    top: 88 + i * ROW_STEP,
                    width: 1360,
                    height: 100,
                    opacity: shown,
                    transform: `translateY(${(1 - shown) * 10}px)`,
                    display: "flex",
                    gap: 22,
                    borderTop: `1px solid ${C.rule}`,
                    paddingTop: 12,
                    color: gone ? C.muted : C.ink,
                  }}
                >
                  <div
                    style={{
                      width: 168,
                      fontSize: 14,
                      letterSpacing: 1.2,
                      fontWeight: 700,
                      color: gone ? C.muted : row.ok ? C.ok : C.stamp,
                      textDecoration: gone ? "line-through" : "none",
                    }}
                  >
                    {gone ? "REMOVED" : row.ok ? "ON THE LIST" : "NOT ON THE LIST"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, textDecoration: gone ? "line-through" : "none" }}>{row.line}</div>
                    <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>
                      {gone ? "Taken off before send." : row.says ? `List says: ${row.says}` : row.note}
                    </div>
                  </div>
                  {!row.ok && !gone && (
                    <div style={{ fontSize: 16, textDecoration: "underline", paddingTop: 6 }}>Remove</div>
                  )}
                </div>
              );
            })}

          {checking && (
            <div style={{ position: "absolute", left: 48, top: 660, fontSize: 18, color: C.muted }}>
              {open === 0 ? "3 on the list. Send is open." : `${open} of 5 aren't on the list.`}
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: 48,
              top: checking ? 710 : 450,
              width: 1344,
              height: 68,
              background: !checking || sendOpen ? C.ink : "transparent",
              color: !checking || sendOpen ? C.paper : C.muted,
              border: `1.5px solid ${!checking || sendOpen ? C.ink : C.rule}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              transform: `translateY(${pressCheck || (pressSend && sendOpen) ? 2 : 0}px)`,
            }}
          >
            {!checking ? "Check the draft against the list" : sendOpen ? "Send to the sales lead" : "Send stays shut"}
          </div>
        </div>
      </AbsoluteFill>

      {showCursor && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {cues.clicks.map((c) => {
            const age = frame - c.frame;
            if (c.frame < sc.app || age < 0 || age > 12) return null;
            const p = age / 12;
            return (
              <div
                key={c.frame}
                style={{
                  position: "absolute",
                  left: cur.x - 8,
                  top: cur.y - 6,
                  width: 28,
                  height: 28,
                  borderRadius: 20,
                  border: `2px solid ${C.paper}`,
                  boxShadow: `0 0 0 1.5px ${C.ink}`,
                  opacity: 1 - p,
                  transform: `scale(${0.3 + p * 1.8})`,
                }}
              />
            );
          })}
          <svg width="28" height="28" viewBox="0 0 24 24" style={{ position: "absolute", left: cur.x, top: cur.y }}>
            <path d="M5 2 L5 20 L10 15.2 L13.4 22 L16.2 20.6 L12.7 14 L19 14 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.4} />
          </svg>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ opacity: emailOp }}>
        <div
          style={{
            position: "absolute",
            left: 360,
            top: 70,
            width: 1200,
            background: C.card,
            border: `1px solid ${C.ink}`,
            padding: "42px 56px 48px",
            boxShadow: "0 30px 70px rgba(28,25,20,0.12)",
          }}
        >
          <div style={{ fontSize: 14, letterSpacing: 3, color: C.muted }}>TO THE SALES LEAD</div>
          <div style={{ fontSize: 54, fontWeight: 700, marginTop: 8 }}>Q-1042</div>
          <div style={{ fontSize: 22, color: C.muted }}>Sharma Traders, Ambala</div>
          <MailRow left="400 kg MS angle 50x50x6 at ₹62 per kg" right="₹62 per kg. GST 18%. HSN 7216." />
          <MailRow left="20 L red oxide primer at ₹180 per litre" right="₹180 per litre. GST 18%. HSN 3208." />
          <MailRow left="Freight extra at actuals" right="Freight extra at actuals." />
          <div style={{ marginTop: 26, fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>REMOVED BEFORE SENDING</div>
          <div style={{ marginTop: 8, fontSize: 20, color: C.stamp, textDecoration: "line-through" }}>
            GST 12% on MS angle (Sharma special)
          </div>
          <div style={{ fontSize: 16, color: C.muted }}>List says: GST 18%. HSN 7216.</div>
          <div style={{ marginTop: 8, fontSize: 20, color: C.stamp, textDecoration: "line-through" }}>
            15% festive scheme discount on this quote
          </div>
          <div style={{ fontSize: 16, color: C.muted }}>List says: No scheme discount this week.</div>
          <div style={{ marginTop: 28, fontSize: 20, fontStyle: "italic", color: C.muted }}>
            Every rate above appears on this week's price list. Checked by Proofquote (AI-assisted); approved by the sales lead.
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: endOp, background: C.ink }}>
        <div style={{ position: "absolute", left: 140, top: 300, opacity: lineA }}>
          <div style={{ fontSize: 64, color: C.paper, maxWidth: 1400 }}>Other tools write the quote.</div>
        </div>
        <div style={{ position: "absolute", left: 140, top: 280, opacity: lineB }}>
          <div style={{ fontSize: 64, color: C.paper }}>Proofquote checks it.</div>
          <div style={{ fontSize: 40, color: C.gold, fontStyle: "italic", marginTop: 18 }}>No list, no rate.</div>
        </div>
        <div style={{ position: "absolute", left: 140, bottom: 48, fontSize: 16, color: "#8A8478" }}>
          Goyal Distributors and Sharma Traders are fictional.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function Field({ kicker, lines, warn = [] }: { kicker: string; lines: string[]; warn?: number[] }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, letterSpacing: 2.2, color: C.muted, marginBottom: 10 }}>{kicker}</div>
      <div
        style={{
          border: `1px solid ${C.rule}`,
          minHeight: 250,
          padding: "22px 24px",
          fontSize: 22,
          lineHeight: 1.55,
          background: C.paper,
        }}
      >
        {lines.map((line, i) => (
          <div key={line} style={{ color: warn.includes(i) ? C.stamp : C.ink, marginBottom: 12 }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function MailRow({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 24,
        borderTop: `1px solid ${C.rule}`,
        padding: "14px 0",
        marginTop: 8,
      }}
    >
      <div style={{ fontSize: 22, flex: 1.1 }}>{left}</div>
      <div style={{ fontSize: 18, color: C.muted, flex: 1 }}>{right}</div>
    </div>
  );
}

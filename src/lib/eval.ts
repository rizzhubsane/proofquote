import { DEMO_LIST } from "./dummy";
import { type Claim, verifyClaim } from "./cite";

/**
 * Golden set: 16 draft lines checked against DEMO_LIST. 7 are on the list, 9 are not.
 * The off-list lines are the mistakes the research points at: a lower GST slab, an invented scheme,
 * a wrong HSN, a shaved price (with ₹, with "per kg", and as a bare number), a rate borrowed from
 * another item, a validity the list doesn't give, and a term the list never mentions.
 * Written by the team, so it tests the rule, not real-world drafts.
 */
const GOLDEN: Array<{ text: string; expect: "sourced" | "unverified" }> = [
  { text: "400 kg MS angle 50x50x6 at ₹62 per kg", expect: "sourced" },
  { text: "20 L red oxide primer at ₹180 per litre", expect: "sourced" },
  { text: "MS angle 50x50x6, GST 18%, HSN 7216", expect: "sourced" },
  { text: "Red oxide primer GST 18% HSN 3208", expect: "sourced" },
  { text: "Freight extra at actuals", expect: "sourced" },
  { text: "angle 62 per kg, gst 18", expect: "sourced" },
  { text: "Quotes valid 7 days", expect: "sourced" },
  { text: "GST 12% on MS angle (Sharma special)", expect: "unverified" },
  { text: "15% festive scheme discount on this quote", expect: "unverified" },
  { text: "MS angle HSN 73089000", expect: "unverified" },
  { text: "MS angle 50x50x6 at ₹58 per kg", expect: "unverified" },
  { text: "Red oxide primer at ₹62 per litre", expect: "unverified" },
  { text: "angle 58 per kg", expect: "unverified" },
  { text: "MS angle 58", expect: "unverified" },
  { text: "Quote valid till 5 Nov", expect: "unverified" },
  { text: "Freight free to Ambala", expect: "unverified" },
];

function run() {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  const rows: string[] = [];

  for (const g of GOLDEN) {
    const c: Claim = { id: "g", text: g.text, status: "unverified", quote: null, listSays: null, reason: null };
    const out = verifyClaim(c, DEMO_LIST);
    const got = out.status;
    if (got === "sourced" && g.expect === "sourced") tp += 1;
    if (got === "sourced" && g.expect === "unverified") fp += 1;
    if (got === "unverified" && g.expect === "unverified") tn += 1;
    if (got === "unverified" && g.expect === "sourced") fn += 1;
    const mark = got === g.expect ? "ok  " : "FAIL";
    const why = out.status === "unverified" ? `  (${out.reason})` : "";
    rows.push(`${mark}  expect=${g.expect.padEnd(10)} got=${got.padEnd(10)}  ${g.text}${why}`);
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  console.log(rows.join("\n"));
  console.log("");
  console.log(`n=${GOLDEN.length}  TP=${tp} FP=${fp} TN=${tn} FN=${fn}`);
  console.log(`precision(on the list)=${precision.toFixed(2)}  recall=${recall.toFixed(2)}`);
  if (fp > 0 || fn > 0) process.exitCode = 1;
}

run();

const KRYOTTA = "https://www.kryotta.ai/blog/claude-vs-gemini-gst-invoices-accuracy-test";

export default function Landing() {
  return (
    <div className="site">
      <header className="site-nav">
        <a className="brand" href="#/">
          <img src="/brand/logo.svg" width={34} height={34} alt="" />
          Proofquote
        </a>
        <nav>
          <a href="#/film">Film</a>
          <a href="#/app">Open the checker</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">For distributor sales teams on WhatsApp</p>
          <h1>
            No list,
            <br />
            no rate.
          </h1>
          <p className="lede">
            Paste this week's price list and your draft quote. Proofquote checks
            every rate, GST slab and HSN code in the draft against the list, and
            holds the quote until the lines that aren't on it are gone.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#/app">Check a sample quote</a>
            <a className="text-link" href="#/film">or watch the 2-minute film</a>
          </div>
        </div>

        <figure className="ledger" aria-label="A draft quote line flagged against the price list">
          <div className="slip list-slip">
            <div className="slip-head">Price list · week of 21 Oct</div>
            <p>MS angle 50x50x6: ₹62 per kg. GST <mark>18%</mark>. HSN 7216.</p>
            <p>No scheme discount this week.</p>
          </div>
          <div className="slip draft-slip">
            <div className="slip-head">Draft Q-1042 · Sharma Traders, Ambala</div>
            <p className="ok-line">400 kg MS angle 50x50x6 at ₹62 per kg</p>
            <p className="bad-line">GST <mark>12%</mark> on MS angle (Sharma special)</p>
            <p className="bad-line">15% festive scheme discount on this quote</p>
            <span className="stamp">Not on the list</span>
          </div>
          <figcaption className="cap">
            The sample quote. The dealer asked for 12%. The list says 18%.
          </figcaption>
        </figure>
      </section>

      <section className="split">
        <div>
          <h2>A wrong rate gets in two ways</h2>
          <p>
            The dealer asks for it: “put 12%, 18 won't work.” Or the model
            mis-copies it while tidying the quote. Either way it rides from the
            quote into the invoice, and the buyer's accountant finds it later.
            Proofquote doesn't care where the number came from. If it isn't on
            the list line for that item, it doesn't go out.
          </p>
          <p className="source">
            Figures from <a href={KRYOTTA} target="_blank" rel="noreferrer">Kryotta, Aug 2026</a>:
            one printing business's test of 50 AI-written GST invoices. A vendor
            blog and a small sample; we use it as a signal, not a market size.
          </p>
        </div>
        <ol className="stat-col">
          <li>
            <strong>2 of 25</strong>
            <span>Gemini invoices charged 18% GST when the prompt said 12%.</span>
          </li>
          <li>
            <strong>3 of 25</strong>
            <span>Claude invoices swapped the HSN code it had been given.</span>
          </li>
        </ol>
      </section>

      <section className="how">
        <h2>What happens when you press Check</h2>
        <ol className="flow">
          <li>
            <strong>Extractor</strong>
            Splits the draft into one line per rate or term. Numbers stay exactly as you typed them.
          </li>
          <li>
            <strong>Citation checker</strong>
            Finds the price-list line for each item. Every ₹, GST % and HSN in your line must be on it.
          </li>
          <li>
            <strong>Pack writer</strong>
            Lays out the quote with the list line printed next to each rate.
          </li>
          <li>
            <strong>Critic</strong>
            Holds Send while any line is off the list. It never fills in the right number for you.
          </li>
        </ol>
        <p className="aside">
          A model can help read a messy draft. It never decides whether a rate
          is right: that check is plain code you can read.
        </p>
      </section>

      <footer className="site-foot">
        <p>
          Proofquote is a JGBS MBA 2026 project for AI Tools for Business. Goyal
          Distributors and Sharma Traders are made up. The film uses AI-generated
          stills, labelled on screen.
        </p>
        <p>
          <a href="#/app">Checker</a> · <a href="#/film">Film</a> ·{" "}
          <a href="/brand/banner-1x1.svg">Banner</a>
        </p>
      </footer>
    </div>
  );
}

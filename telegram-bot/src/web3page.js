// /web3: the coffee bar pitched to web3 event organizers (hackathons, conferences, hacker houses), in
// English. Proof from Island DAO, how ordering works, what organizers get, the edition bag,
// and a quick inquiry that goes out as a ready WhatsApp message or is copied for an X DM.
import { WORDMARK_SVG } from "./wordmark.js";

export const WEB3_CONTACT = { whatsapp: "5548998300443", x: "BeachCoffeco", bot: "BeachCoffeeIslandBot" };

const EVENT_KINDS = ["Hackathon", "Conference", "Hacker house", "Side event"];

export function web3Html() {
  const config = JSON.stringify({ contact: WEB3_CONTACT, kinds: EVENT_KINDS });
  const wordmark = WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"');
  return PAGE.replaceAll("<!--WORDMARK-->", wordmark).replace("/*CONFIG*/null", config);
}

const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Beach Coffee Co. · Coffee bar for web3 events</title>
<meta name="description" content="A specialty coffee bar for hackathons, conferences and hacker houses. Builders order from Telegram, get pinged when it's ready, and tip in USDC on Solana.">
<meta property="og:title" content="Coffee, onchain · Beach Coffee Co.">
<meta property="og:description" content="The specialty coffee bar for builders' events. 0% to 94% of orders on Telegram in four days at Island DAO.">
<meta name="theme-color" content="#17322b">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<style>
  :root { --bg: #0c1c18; --bg2: #10241f; --card: rgba(8,20,17,.5); --line: rgba(168,230,184,.14); --text: #eef3ee; --muted: #9db3a6;
    --mint: #a8e6b8; --gold: #e8b86a; --sol: linear-gradient(90deg, #9945ff, #14f195); }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; color: var(--text); font: 400 16px/1.6 Figtree, system-ui, sans-serif; -webkit-font-smoothing: antialiased;
    background: radial-gradient(1400px 1000px at 85% -8%, #2a4a3d 0%, #1b3a31 30%, rgba(27,58,49,0) 70%),
      radial-gradient(1000px 800px at -5% 55%, rgba(38,72,60,.75), rgba(38,72,60,0) 70%),
      radial-gradient(900px 700px at 100% 100%, rgba(33,57,47,.8), rgba(33,57,47,0) 70%), var(--bg); }
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .5;
    background-image: linear-gradient(rgba(168,230,184,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(168,230,184,.045) 1px, transparent 1px);
    background-size: 56px 56px; mask-image: linear-gradient(180deg, #000 0%, transparent 70%); -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 70%); }
  a { color: inherit; }
  .wrap { position: relative; max-width: 1120px; margin: 0 auto; padding: 0 20px; }
  nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; }
  nav svg { height: 38px; width: auto; display: block; }
  nav .links { display: none; gap: 26px; font: 600 14px/1 Figtree; color: var(--muted); }
  nav .links a { text-decoration: none; }
  .pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; border: 1px solid var(--line); background: rgba(168,230,184,.06);
    font: 600 14px/1 Figtree; color: var(--mint); text-decoration: none; }
  .eyebrow { display: inline-flex; align-items: center; gap: 10px; font: 600 12px/1 "JetBrains Mono", monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); margin: 0 0 18px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 4px rgba(168,230,184,.15); animation: pulse 2s infinite; }
  @keyframes pulse { 50% { box-shadow: 0 0 0 8px rgba(168,230,184,0); } }
  h1, h2, h3 { font-family: Archivo, sans-serif; font-stretch: 125%; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -.01em; line-height: .95; }
  h1 { font-size: clamp(48px, 12vw, 120px); }
  h1 .on { background: linear-gradient(90deg, var(--mint), #d8f5e0); -webkit-background-clip: text; background-clip: text; color: transparent; }
  h2 { font-size: clamp(34px, 7vw, 60px); }
  h3 { font-size: 22px; font-weight: 800; line-height: 1.1; }
  .hero { padding: 48px 0 40px; }
  .hero p.lead { font-size: clamp(17px, 2.4vw, 21px); color: #c9d6cd; max-width: 40em; margin: 26px 0 0; }
  .ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 0 24px; border-radius: 999px; border: 0;
    font: 700 16px/1.2 Figtree; text-align: center; text-decoration: none; cursor: pointer; }
  .btn.mint { background: var(--mint); color: #062018; box-shadow: 0 10px 40px rgba(168,230,184,.25); }
  .btn.ghost { background: transparent; color: var(--text); border: 1px solid rgba(238,243,238,.25); }
  .btn.full { width: 100%; }
  .solbar { height: 3px; width: 120px; border-radius: 3px; background: var(--sol); margin: 34px 0 0; }
  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: 24px; overflow: hidden; margin-top: 44px; }
  .stats div { background: var(--bg2); padding: 22px 20px; }
  .stats b { display: block; font: 900 clamp(30px, 6vw, 46px)/1 Archivo, sans-serif; font-stretch: 125%; color: var(--text); }
  .stats b .g { color: var(--mint); }
  .stats div > span { display: block; margin-top: 10px; font-size: 14px; color: var(--muted); line-height: 1.4; }
  section { padding: 56px 0; }
  .head { max-width: 760px; margin-bottom: 30px; }
  .head p { color: var(--muted); margin: 16px 0 0; font-size: 17px; }
  .grid { display: grid; gap: 14px; }
  .card { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 24px; padding: 24px; backdrop-filter: blur(6px); }
  .card p { margin: 10px 0 0; color: var(--muted); }
  .num { font: 500 13px/1 "JetBrains Mono", monospace; color: var(--gold); letter-spacing: .1em; margin-bottom: 16px; display: block; }
  .bag { display: grid; gap: 24px; align-items: center; }
  .bagcard { justify-self: center; width: 100%; max-width: 420px; aspect-ratio: 4 / 5; border-radius: 32px; display: grid; place-items: center; padding: 36px;
    background: radial-gradient(120% 90% at 50% 12%, #f8eedc 0%, #ead8ba 55%, #d4b98f 100%); box-shadow: 0 30px 80px rgba(0,0,0,.35); }
  .bagcard img { height: 100%; width: auto; max-width: 100%; object-fit: contain; filter: drop-shadow(0 26px 30px rgba(70,45,20,.45)); }
  .story { border-left: 4px solid var(--gold); padding: 6px 0 6px 22px; font-size: clamp(18px, 2.6vw, 24px); color: #dbe6de; max-width: 46em; }
  .story b { color: var(--gold); }
  /* Inquiry */
  .form { display: grid; gap: 18px; }
  .field > label, .field > .label { display: block; font: 600 12px/1 "JetBrains Mono", monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .kinds { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .kinds button { border: 1px solid var(--line); background: rgba(255,255,255,.03); color: var(--text); border-radius: 14px; padding: 14px 10px; font: 600 15px/1.2 Figtree; cursor: pointer; }
  .kinds button.on { border-color: var(--mint); background: rgba(168,230,184,.14); color: var(--mint); }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  input[type=text], input[type=number] { width: 100%; height: 52px; border-radius: 14px; border: 1px solid var(--line); background: rgba(255,255,255,.04); padding: 0 14px;
    font: 500 16px Figtree; color: var(--text); }
  input::placeholder { color: #5f7d70; }
  .note { font-size: 13px; color: var(--muted); text-align: center; margin: 0; }
  footer { padding: 40px 0 60px; text-align: center; color: var(--muted); font-size: 14px; border-top: 1px solid var(--line); }
  footer svg { height: 30px; width: auto; display: block; margin: 0 auto 14px; }
  .toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); background: var(--mint); color: #062018; padding: 12px 16px; border-radius: 14px;
    font: 600 14px/1.3 Figtree; opacity: 0; transition: opacity .2s; pointer-events: none; z-index: 6; max-width: 90vw; text-align: center; }
  .toast.on { opacity: 1; }
  @media (min-width: 860px) {
    nav .links { display: flex; }
    .hero { padding: 80px 0 50px; }
    .stats { grid-template-columns: repeat(4, 1fr); }
    .grid.three { grid-template-columns: repeat(3, 1fr); }
    .grid.two { grid-template-columns: repeat(2, 1fr); }
    .bag { grid-template-columns: 1.1fr .9fr; }
    .contact { display: grid; grid-template-columns: .9fr 1.1fr; gap: 40px; align-items: start; }
  }
</style>
</head>
<body>
<div class="wrap">
  <nav>
    <!--WORDMARK-->
    <div class="links"><a href="#how">How it works</a><a href="#organizers">Organizers</a><a href="#edition">Edition</a></div>
    <a class="pill" href="#book">Book the bar</a>
  </nav>

  <div class="hero">
    <p class="eyebrow"><span class="dot"></span>Live at Island DAO · Floripa · Oct 2026</p>
    <h1>Coffee,<br><span class="on">onchain.</span></h1>
    <p class="lead">The specialty coffee bar for builders' events. No lines, no lost orders, no one leaving the hackathon floor.</p>
    <div class="ctas">
      <a class="btn mint" href="#book">Bring the bar to your event</a>
      <a class="btn ghost" href="https://t.me/BeachCoffeeIslandBot" target="_blank" rel="noopener">Try the bot</a>
    </div>
    <div class="solbar"></div>
    <div class="stats">
      <div><b>2k<span class="g">+</span></b><span>coffees served in one month, during Island DAO</span></div>
      <div><b>0<span class="g">→</span>94%</b><span>of orders moved to Telegram in four days</span></div>
      <div><b>5<span class="g">→</span>0</b><span>minutes in line, timed at the bar</span></div>
      <div><b>USDC</b><span>tips verified onchain with Solana Pay</span></div>
    </div>
  </div>
</div>

<section id="how">
  <div class="wrap">
    <div class="head"><p class="eyebrow">How it works</p><h2>Tap. Sip. Tip.</h2>
      <p>Built and battle-tested during a real event, with real builders, every day.</p></div>
    <div class="grid three">
      <div class="card"><span class="num">01</span><h3>Order from your seat</h3><p>A Telegram Mini App: pick the drink and the milk, confirm. The order lands on the barista's panel in real time.</p></div>
      <div class="card"><span class="num">02</span><h3>Keep building</h3><p>The barista taps Ready and the guest gets a Telegram ping. They only walk over to pick it up.</p></div>
      <div class="card"><span class="num">03</span><h3>Tip in USDC</h3><p>Optional tips in USDC on Solana, with Solflare or Phantom. Each payment is matched onchain by its Solana Pay reference.</p></div>
    </div>
  </div>
</section>

<section id="organizers">
  <div class="wrap">
    <div class="head"><p class="eyebrow">For organizers</p><h2>One less thing to run</h2>
      <p>We bring the bar, the coffee and the software. You get happy builders and the numbers to prove it.</p></div>
    <div class="grid three">
      <div class="card"><span class="num">BAR</span><h3>Full coffee bar</h3><p>Barista, espresso machine, specialty coffee, hot and iced menu, lactose-free and plant milk on request.</p></div>
      <div class="card"><span class="num">BOT</span><h3>Your event's bot</h3><p>The ordering bot set up for your event: your name, your menu, your dates, opening hours and breaks.</p></div>
      <div class="card"><span class="num">DATA</span><h3>Live panel and report</h3><p>A live order panel during the event, and a final report: cups served, unique guests, peak hours, top drinks.</p></div>
      <div class="card"><span class="num">FLOW</span><h3>Built for crowds</h3><p>Per-guest limits, stock per drink and a demo-day mode keep the bar fair when everyone breaks at once.</p></div>
      <div class="card"><span class="num">MERCH</span><h3>Limited edition bag</h3><p>A coffee bag with your event's label, sold onchain in the same app. A souvenir that funds the bar.</p></div>
      <div class="card"><span class="num">SHIP</span><h3>Content included</h3><p>Daily recap cards for X with the event's numbers, ready for you to share.</p></div>
    </div>
  </div>
</section>

<section id="edition">
  <div class="wrap bag">
    <div class="head" style="margin:0"><p class="eyebrow">Limited edition</p><h2>Island DAO Edition</h2>
      <p>20 bags of our specialty Arabica with the event's own label, 10 USDC each, sold and verified onchain inside the same Mini App. Every event can have its own edition.</p></div>
    <div class="bagcard"><img src="/web3/bag.webp" alt="Island DAO Edition coffee bag: a black 250 g pouch with the green Beach Coffee Co. label" width="600" height="960" loading="lazy"></div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Proof of brew</p>
    <p class="story">Built from zero at the bar, by the barista, between shifts, with AI. Not by a dev team.<br><b>On the island, anyone can build.</b></p>
  </div>
</section>

<section id="book">
  <div class="wrap contact">
    <div class="head" style="margin:0"><p class="eyebrow">Book the bar</p><h2>Bring Beach Coffee to your event</h2>
      <p>Tell us about your event. The message goes out ready on WhatsApp, or copy it for an X DM, and we'll come back with a proposal.</p></div>
    <form class="card form" id="form" onsubmit="return false">
      <div class="field"><span class="label">Event</span><div class="kinds" id="kinds"></div></div>
      <div class="field"><label for="name">Event name</label><input type="text" id="name" placeholder="IslandHack"></div>
      <div class="row2">
        <div class="field"><label for="city">City</label><input type="text" id="city" placeholder="Florianópolis"></div>
        <div class="field"><label for="dates">Dates</label><input type="text" id="dates" placeholder="Nov 20–24"></div>
      </div>
      <div class="field"><label for="guests">Attendees</label><input type="number" id="guests" min="10" step="10" value="150"></div>
      <a class="btn mint full" id="sendWa" href="#" target="_blank" rel="noopener">Send on WhatsApp</a>
      <button class="btn ghost full" id="sendX" type="button">Copy for an X DM</button>
      <p class="note">We reply within a day.</p>
    </form>
  </div>
</section>

<footer>
  <div class="wrap">
    <!--WORDMARK-->
    <p>The coffee bar for builders' events · Florianópolis, Brazil</p>
    <p><a href="https://x.com/BeachCoffeco" target="_blank" rel="noopener">X @BeachCoffeco</a> · <a href="https://t.me/BeachCoffeeIslandBot" target="_blank" rel="noopener">Telegram bot</a> · <a href="/eventos">Weddings and private events</a></p>
  </div>
</footer>
<div class="toast" id="toast"></div>

<script>
  const C = /*CONFIG*/null;
  const $ = id => document.getElementById(id);
  let kind = C.kinds[0];
  $("kinds").innerHTML = C.kinds.map(k => '<button type="button" data-kind="' + k + '">' + k + "</button>").join("");
  function message() {
    const v = id => $(id).value.trim();
    const lines = ["Hi Beach Coffee! We'd like the coffee bar at our event.", "",
      "Event: " + kind + (v("name") ? " · " + v("name") : ""),
      "City: " + (v("city") || "to be confirmed"),
      "Dates: " + (v("dates") || "to be confirmed"),
      "Attendees: " + (v("guests") || "to be confirmed")];
    return lines.join("\n");
  }
  function render() {
    document.querySelectorAll("[data-kind]").forEach(b => b.classList.toggle("on", b.dataset.kind === kind));
    $("sendWa").href = "https://wa.me/" + C.contact.whatsapp + "?text=" + encodeURIComponent(message());
  }
  $("kinds").addEventListener("click", e => { const b = e.target.closest("[data-kind]"); if (b) { kind = b.dataset.kind; render(); } });
  ["name", "city", "dates", "guests"].forEach(id => $(id).addEventListener("input", render));
  const toast = t => { $("toast").textContent = t; $("toast").classList.add("on"); setTimeout(() => $("toast").classList.remove("on"), 2600); };
  // X can't take a prefilled DM here: copy the message, then open the profile.
  $("sendX").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(message()); toast("Copied. Paste it in a DM to @" + C.contact.x); }
    catch (err) { toast("DM @" + C.contact.x + " with your event, dates and attendees"); }
    setTimeout(() => window.open("https://x.com/" + C.contact.x, "_blank"), 600);
  });
  render();
</script>
</body>
</html>`;

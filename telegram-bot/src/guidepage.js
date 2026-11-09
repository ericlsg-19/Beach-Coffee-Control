// /guide: everything the bar does, in English, for guests (ordering, the coffee race, tips, the bag,
// the onchain check-in, the app) and for the bar team (setup, every barista command, Âncora,
// finance). Linked from the bot's /help, the app and Âncora. Keep it in step with BARISTA_HELP.
import { WORDMARK_SVG } from "./wordmark.js";

export function guideHtml() {
  return PAGE.replace("<!--WORDMARK-->", WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"'));
}

// [command, what it does, example or variants]
const COMMANDS = [
  ["Orders", [
    ["/queue", "Drinks still waiting, oldest first.", ""],
    ["/panel", "A button that opens Âncora, already logged in.", ""],
  ]],
  ["Opening, limits and menu", [
    ["/open", "Start taking orders. On a Saturday or Sunday it opens just that day.", ""],
    ["/close", "Pause new orders until the next /open. The menu, ranking and tips stay up.", ""],
    ["/lunch", "The daily lunch break, 13:00–14:00. Guests can still order; drinks are ready after lunch.", "/lunch 12:30-13:30 · /lunch off"],
    ["/limit", "Drinks per guest per day, 3 by default.", "/limit 5 · /limit off"],
    ["/out", "Mark drinks or milks as not available: they show greyed out and can't be ordered.", "/out matcha lactosefree · /back matcha · /back all"],
    ["/demoday", "Demo day: today only Iced Coffee and Iced Latte, 1 per guest.", "/demoday max=2 · /demoday off"],
  ]],
  ["Reports", [
    ["/today", "Today: drinks by type, Telegram vs bar, busiest hour, top guest, still waiting, tips and bags.", ""],
    ["/report", "The same report for another day.", "/report 2026-11-07"],
    ["/total", "The whole event: drinks, best day, time saved in line, tap-to-ready time, tips and bags.", ""],
    ["/ranking", "The coffee race (with ⚡ boosts) and Top patrons.", ""],
  ]],
  ["Money", [
    ["/finance", "Costs, income, profit and tips of the day, and the event so far.", "/finance 2026-11-07"],
    ["/payments", "Tips, bags and boosts of the last 7 days, and where checkouts get stuck.", ""],
    ["/bags", "Coffee bags sold and left. Bags sold in cash at the bar come off the stock.", "/bags 17"],
  ]],
  ["Onchain", [
    ["/checkins", "Coffees checked in onchain and the wallet that pays their fees.", "/checkins setup · /checkins on · /checkins off"],
  ]],
];

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const commandsHtml = COMMANDS.map(([group, rows]) => `
      <div class="cmd-group">
        <h4>${esc(group)}</h4>
        ${rows.map(([cmd, what, ex]) => `<div class="cmd"><code>${cmd}</code><div><p>${esc(what)}</p>${ex ? `<small>${esc(ex)}</small>` : ""}</div></div>`).join("")}
      </div>`).join("");

const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Beach Coffee Co. · Guide</title>
<meta name="description" content="Everything the Beach Coffee bar does: ordering from Telegram, the coffee race, tips and the coffee bag in USDC, the onchain check-in, the app, and the tools for the bar team.">
<meta name="theme-color" content="#0c1c18">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<style>
  :root { --bg: #0c1c18; --bg2: #10241f; --card: rgba(8,20,17,.55); --line: rgba(168,230,184,.14); --text: #eef3ee; --muted: #9db3a6; --faint: #6f8a7c;
    --mint: #a8e6b8; --gold: #e8b86a; --danger: #f2877a; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; scroll-padding-top: 76px; }
  body { margin: 0; color: var(--text); font: 400 16px/1.6 Figtree, system-ui, sans-serif; -webkit-font-smoothing: antialiased;
    background: radial-gradient(1200px 900px at 85% -8%, #2a4a3d 0%, #1b3a31 30%, rgba(27,58,49,0) 70%),
      radial-gradient(900px 700px at -5% 60%, rgba(38,72,60,.7), rgba(38,72,60,0) 70%), var(--bg); }
  a { color: var(--mint); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 max(16px, env(safe-area-inset-left)); }
  header.top { position: sticky; top: 0; z-index: 5; background: rgba(12,28,24,.86); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
  header.top .wrap { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 64px; }
  header.top svg { height: 30px; width: auto; display: block; }
  .switch { display: flex; gap: 4px; padding: 4px; border: 1px solid var(--line); border-radius: 999px; }
  .switch a { padding: 8px 14px; border-radius: 999px; font: 600 14px/1 Figtree; color: var(--muted); text-decoration: none; white-space: nowrap; }
  .switch a.on { background: rgba(168,230,184,.12); color: var(--mint); }
  .eyebrow { font: 600 12px/1.3 "JetBrains Mono", monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); margin: 0 0 14px; }
  h1, h2, h3 { font-family: Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; margin: 0; letter-spacing: -.01em; }
  h1 { font-size: clamp(40px, 10vw, 84px); font-weight: 900; line-height: .95; }
  h1 b { color: var(--mint); font-weight: 900; }
  h2 { font-size: clamp(30px, 6vw, 48px); font-weight: 900; line-height: 1; }
  h3 { font-size: 19px; font-weight: 800; line-height: 1.15; }
  h4 { margin: 0 0 6px; font: 600 12px/1.3 "JetBrains Mono", monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
  .hero { padding: 48px 0 24px; }
  .lead { font-size: clamp(17px, 2.3vw, 20px); color: #c9d6cd; max-width: 40em; margin: 22px 0 0; }
  .ctas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 20px; border-radius: 999px; font: 700 15px/1.2 Figtree; text-decoration: none; }
  .btn.mint { background: var(--mint); color: #062018; }
  .btn.ghost { color: var(--text); border: 1px solid rgba(238,243,238,.25); }
  .toc { display: grid; gap: 10px; grid-template-columns: 1fr; margin-top: 36px; }
  @media (min-width: 720px) { .toc { grid-template-columns: 1fr 1fr; } }
  .toc a { display: block; padding: 18px 20px; border: 1px solid var(--line); border-radius: 20px; background: var(--card); text-decoration: none; color: var(--text); }
  .toc a b { display: block; font: 800 18px/1.2 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; }
  .toc a span { display: block; margin-top: 6px; color: var(--muted); font-size: 15px; }
  section.part { padding: 56px 0 8px; }
  .part-head { margin-bottom: 26px; }
  .part-head p { color: var(--muted); margin: 12px 0 0; max-width: 42em; }
  .grid { display: grid; gap: 14px; grid-template-columns: 1fr; }
  @media (min-width: 760px) { .grid { grid-template-columns: 1fr 1fr; } }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 24px; padding: 22px; min-width: 0; }
  .card.wide { grid-column: 1 / -1; }
  .card .ico { font-size: 26px; line-height: 1; margin-bottom: 12px; display: block; }
  .card p { margin: 10px 0 0; color: var(--muted); }
  .card ol, .card ul { margin: 12px 0 0; padding-left: 20px; color: var(--muted); }
  .card li { margin: 6px 0; }
  .card li b, .card p b { color: var(--text); font-weight: 600; }
  code { font: 500 .9em "JetBrains Mono", monospace; color: var(--mint); background: rgba(168,230,184,.08); padding: 1px 6px; border-radius: 6px; white-space: nowrap; }
  .cmds { display: grid; gap: 22px; margin-top: 4px; }
  @media (min-width: 760px) { .cmds { grid-template-columns: 1fr 1fr; } }
  .cmd-group { display: grid; gap: 2px; align-content: start; }
  .cmd { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 12px; padding: 12px 0; border-top: 1px solid var(--line); }
  .cmd code { justify-self: start; align-self: start; }
  .cmd p { margin: 0; color: var(--text); font-size: 15px; }
  .cmd small { display: block; margin-top: 4px; font: 500 12px/1.4 "JetBrains Mono", monospace; color: var(--faint); }
  .tag { display: inline-block; margin-left: 6px; padding: 2px 8px; border-radius: 999px; font: 600 11px/1.4 Figtree; letter-spacing: .04em; vertical-align: 2px;
    color: var(--gold); border: 1px solid rgba(232,184,106,.4); }
  .formula { margin-top: 14px; padding: 14px 16px; border-radius: 16px; background: rgba(168,230,184,.06); border: 1px solid var(--line); font-size: 15px; }
  .formula b { color: var(--mint); }
  footer { padding: 56px 0 calc(40px + env(safe-area-inset-bottom)); color: var(--faint); font-size: 14px; }
  footer a { color: var(--muted); margin-right: 16px; }
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <a href="#top" aria-label="Beach Coffee Co."><!--WORDMARK--></a>
  <nav class="switch" aria-label="Guide sections"><a href="#guests" data-part="guests">Guests</a><a href="#team" data-part="team">Bar team</a></nav>
</div></header>

<main class="wrap" id="top">
  <div class="hero">
    <p class="eyebrow">Guide · Beach Coffee Co.</p>
    <h1>Everything<br>the bar <b>does</b></h1>
    <p class="lead">Beach Coffee runs on a Telegram bot, an app and a barista panel. Guests order from their seat and get pinged when it's ready; the team runs the bar, the queue and the money from the same place. Here's every feature.</p>
    <div class="ctas">
      <a class="btn mint" href="https://t.me/BeachCoffeeIslandBot" target="_blank" rel="noopener">Open the bot</a>
      <a class="btn ghost" href="/app">Open the app</a>
      <a class="btn ghost" href="/panel">Barista panel</a>
    </div>
    <div class="toc">
      <a href="#guests"><b>For guests →</b><span>Order, milk choices, the coffee race, tips and the bag in USDC, the onchain check-in, the app.</span></a>
      <a href="#team"><b>For the bar team →</b><span>Set up in a minute, every command, the Âncora panel, reports and finance.</span></a>
    </div>
  </div>

  <section class="part" id="guests">
    <div class="part-head">
      <p class="eyebrow">Part 1</p>
      <h2>For guests</h2>
      <p>Drinks are on the house. Everything happens inside Telegram: no sign-up, no app to install.</p>
    </div>
    <div class="grid">
      <div class="card">
        <span class="ico">☕</span>
        <h3>Order from your seat</h3>
        <ol>
          <li>Open <a href="https://t.me/BeachCoffeeIslandBot" target="_blank" rel="noopener">@BeachCoffeeIslandBot</a> and tap <b>Order ☕</b> next to the message box.</li>
          <li><b>Pick your drink.</b> Each one has a short description.</li>
          <li><b>Choose your milk</b> for drinks with milk: regular, lactose-free or plant-based.</li>
          <li><b>Confirm.</b> A receipt with your order number arrives in the chat.</li>
          <li>The bot messages you <b>when it's ready</b>. Walk up and grab it.</li>
        </ol>
        <p>"Your orders today" in the menu shows what's waiting and what's ready.</p>
      </div>
      <div class="card">
        <span class="ico">🏝️</span>
        <h3>How the bar works</h3>
        <ul>
          <li><b>Up to 3 drinks per person a day.</b> The menu shows how many you've had.</li>
          <li><b>Lunch break 13:00–14:00.</b> You can still order; it's ready right after lunch.</li>
          <li><b>Weekends the barista is off touching sand.</b> The menu, ranking and tips stay open; orders open again Monday.</li>
          <li>Ran out of something? It shows <b>Not available</b> until it's back.</li>
        </ul>
      </div>
      <div class="card">
        <span class="ico">🏆</span>
        <h3>The coffee race</h3>
        <p>Every drink you order in Telegram counts. The <b>Ranking</b> tab shows the top 10 and your place (last names are hidden).</p>
        <p><b>Race boost ⚡</b>: 1 USDC adds one cup to your score, once a day, once you're in the race.</p>
        <p><b>Top patrons</b>: a separate board for the biggest tippers. Tips never move the race. Tipped by copying the wallet address? Tell the barista and it counts too.</p>
      </div>
      <div class="card">
        <span class="ico">💛</span>
        <h3>Tip the barista, take home the bag</h3>
        <p>In the <b>Tip & Bag</b> tab, or the pop-up after you order. Paid in <b>USDC on Solana</b>, straight to the bar.</p>
        <ul>
          <li><b>Solflare</b> or <b>Phantom</b>: one tap opens your wallet.</li>
          <li>Wallet blocking it? <b>Solana Pay</b> lets your wallet build the payment.</li>
          <li><b>Any exchange</b> works too: send the exact amount of USDC on the Solana network to the address shown.</li>
        </ul>
        <p>The <b>Island DAO Edition coffee bag</b> is a limited run; the app shows how many are left. Pick it up at the bar.</p>
      </div>
      <div class="card">
        <span class="ico">⛓️</span>
        <h3>Check in your coffee onchain</h3>
        <p>It's just like the event check-in: after an order, tap <b>☕ Check in</b>, your wallet signs a small memo and the bar pays the network fee. Free for you. The order then shows <b>✓ Onchain</b>.</p>
      </div>
      <div class="card">
        <span class="ico">📱</span>
        <h3>The app and the QR at the bar</h3>
        <p><b>Beach Coffee on the Solana dApp Store</b> (Seeker) and on Android, or add <a href="/app">drinkbeachcoffee.com/app</a> to your home screen: live menu, what's sold out, ordering through Telegram, and Tip & Bag with your phone's wallet.</p>
        <p>No Telegram? Scan the <b>printed QR</b> at the bar to tip or buy the bag from any phone.</p>
      </div>
    </div>
  </section>

  <section class="part" id="team">
    <div class="part-head">
      <p class="eyebrow">Part 2</p>
      <h2>For the bar team</h2>
      <p>The bot is the counter: orders, the queue, payments and reports land in one chat. Âncora is the screen behind the bar.</p>
    </div>
    <div class="grid">
      <div class="card">
        <span class="ico">🔑</span>
        <h3>Set up in a minute</h3>
        <ol>
          <li>Open the bot in the chat where orders should arrive (your private chat or a team group).</li>
          <li>Send <code>/barista YOUR_CODE</code>. The code is the bar's barista code.</li>
          <li>Done: every order arrives there. <code>/help</code> lists the commands.</li>
          <li>Open Âncora with <code>/panel</code>, or at <a href="/panel">/panel</a> with the same code.</li>
        </ol>
      </div>
      <div class="card">
        <span class="ico">🔔</span>
        <h3>What arrives in the chat</h3>
        <ul>
          <li><b>Every order</b> with the guest's name, drink and milk, and <b>Ready</b> / <b>Cancel</b> buttons. Ready messages the guest; Cancel tells them too.</li>
          <li><b>Tips, bags and boosts</b> as they're paid, with a Solscan link. Bags have a <b>Hand over</b> button.</li>
          <li><b>USDC sent outside the app</b> (an exchange, a plain transfer) is flagged so nothing gets lost. Credit it to whoever sent it in Âncora → Top patrons.</li>
          <li><b>End of day at 23:00</b>: the day's report, with the finance block when there are costs or income.</li>
        </ul>
      </div>
      <div class="card wide">
        <span class="ico">⌨️</span>
        <h3>Every command</h3>
        <p>Only the barista chat can use these. Guests who type a command just see the menu.</p>
        <div class="cmds">${commandsHtml}
        </div>
      </div>
      <div class="card">
        <span class="ico">🧾</span>
        <h3>Âncora, the barista panel</h3>
        <p>At <a href="/panel">/panel</a>, on a laptop or phone behind the bar. It updates every 5 seconds; pick any day at the top.</p>
        <ul>
          <li><b>Order</b>: tap a drink to log a walk-up order at the bar, with an optional name.</li>
          <li><b>Queue</b>: Telegram and bar orders together. Ready, Undo or remove; hide what's done.</li>
          <li><b>Ranking</b>: the coffee race for the whole event.</li>
          <li><b>Top patrons</b>: credit tips sent straight to the wallet to the person who sent them (their wallet is remembered), or add a tip the bot never saw by hand.</li>
          <li><b>Tips & bags</b>: every USDC payment of the day, Solscan links, bag hand-over.</li>
          <li><b>Finance</b>: costs, income, profit and tips (see next).</li>
          <li><b>Summary</b>: drinks per day and per drink, with a CSV download.</li>
        </ul>
      </div>
      <div class="card">
        <span class="ico">💰</span>
        <h3>Finance <span class="tag">NEW</span></h3>
        <ol>
          <li>Before the event, set <b>1 USDC = R$ …</b> at the bottom of Finance.</li>
          <li>For each receipt: <b>Cost</b> → category (beans, milk, cups, staff, transport…) → what it was → amount → <b>Add</b>. Pick the day at the top to log past days.</li>
          <li>Event fee, sponsor or bags sold in cash: switch to <b>Income</b>.</li>
          <li><b>Tips, app bags and race boosts come in by themselves</b> from USDC.</li>
        </ol>
        <div class="formula"><b>Profit</b> = income + app bags + boosts − costs<br>Tips stay apart: <b>profit + tips</b> shows both.</div>
        <p>The day cards show cost per drink; <b>Report by day</b> has the event total and a CSV for Excel. In the chat: <code>/finance</code>.</p>
      </div>
      <div class="card wide">
        <span class="ico">🩺</span>
        <h3>If something looks off</h3>
        <ul>
          <li><b>No orders arriving?</b> Send <code>/barista YOUR_CODE</code> again in the right chat, and check the bar isn't closed (<code>/open</code>).</li>
          <li><b>A guest says they paid?</b> <code>/payments</code> shows each checkout step and error; a USDC transfer without the app shows up as "arrived outside the app".</li>
          <li><b>Is everything up?</b> <a href="/health">/health</a> shows the version, the database and today's orders; <a href="/health?rpc=1">/health?rpc=1</a> also checks the Solana connection.</li>
        </ul>
      </div>
    </div>
  </section>
</main>

<footer><div class="wrap">
  <a href="/web3">Coffee for web3 events</a><a href="/eventos">Eventos (PT)</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a>
  <p>Beach Coffee Co. · Florianópolis</p>
</div></footer>
<script>
  // Highlight Guests / Bar team in the header for the part on screen.
  const links = document.querySelectorAll("[data-part]");
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.dataset.part === e.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  ["guests", "team"].forEach(id => io.observe(document.getElementById(id)));
</script>
</body>
</html>`;

// The Telegram Mini App: a drink menu in the Âncora / Island DAO look, opened from the bot.
// Drinks are free; the "Tip & Bag" tab takes tips and sells the Island DAO coffee bag in USDC.
import { WORDMARK_SVG } from "./wordmark.js";
import { TIP_PRESETS, PRODUCTS } from "./pay.js";

const ICONS = {
  espresso:   '<path d="M6 10h9v3a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4z"/><path d="M15 11h1.5a2 2 0 0 1 0 4H15M4 20h14"/>',
  double:     '<path d="M3 10h7v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M13 10h7v3a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3z"/><path d="M3 20h17"/>',
  freddo:     '<path d="M6 6h12l-1.6 14a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8z"/><path d="M15 2l-2 9"/><rect x="8.5" y="10" width="3.5" height="3.5" rx=".6"/><rect x="11.8" y="14" width="3.2" height="3.2" rx=".6"/>',
  americano:  '<path d="M6 7h11v9a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z"/><path d="M17 9h1a2.5 2.5 0 0 1 0 5h-1M9 3v2M13 3v2"/>',
  carioca:    '<path d="M5 11h11v2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 12h1.5a2 2 0 0 1 0 4H16M10.5 3.5c1.2 1.6 2 2.7 2 3.6a2 2 0 0 1-4 0c0-.9.8-2 2-3.6zM4 21h14"/>',
  cappuccino: '<path d="M4 11h13v2a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H16M7 8c0-1.5 2-1.5 2-3M11 8c0-1.5 2-1.5 2-3"/>',
  flatwhite:  '<path d="M3 10h14v1a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/><path d="M17 11h1a2 2 0 0 1 0 4h-2M10 13.5c-1.2-.9-2-1.5-2-2.3a1 1 0 0 1 2-.4 1 1 0 0 1 2 .4c0 .8-.8 1.4-2 2.3zM3 20h15"/>',
  latte:      '<path d="M7 4h10l-1.5 16h-7z"/><path d="M7.6 10h8.8"/>',
  icedlatte:  '<path d="M7 4h10l-1.5 16h-7z"/><path d="M7.5 8.5h9"/><rect x="9" y="11" width="3" height="3" rx=".5"/><rect x="12.2" y="14.4" width="2.8" height="2.8" rx=".5"/>',
  icedcoffee: '<path d="M7 5h10l-1.6 15h-6.8z"/><path d="M14.5 2l-1.5 7"/><rect x="9" y="11" width="3" height="3" rx=".5"/><rect x="12.4" y="13.8" width="2.6" height="2.6" rx=".5"/>',
  mocha:      '<path d="M7 10h10l-1.5 10h-7z"/><path d="M6.5 10c0-2 1.5-3 3-3 .4-1.6 1.4-2.5 2.5-2.5s2.1.9 2.5 2.5c1.5 0 3 1 3 3M8 14h8"/>',
  matcha:     '<path d="M12 21c-5-2-7-6-7-10 4 0 7 2 7 6 0-4 3-6 7-6 0 4-2 8-7 10z"/><path d="M12 17V5"/>',
  icedmatcha: '<path d="M7 4h10l-1.5 16h-7z"/><path d="M7.5 8.5h9"/><path d="M12 18c-2.2-.9-3.1-2.7-3.1-4.5 1.8 0 3.1.9 3.1 2.7 0-1.8 1.3-2.7 3.1-2.7 0 1.8-.9 3.6-3.1 4.5z"/><path d="M12 16.2V11.5"/>',
  chocolate:  '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12M6 15h12M12 3v18"/>',
};

// One line under each drink's name, so guests know what's in it.
export const DESCRIPTIONS = {
  espresso:   "Short, strong coffee shot",
  double:     "Two espresso shots",
  freddo:     "Espresso shaken with ice",
  americano:  "Espresso with hot water",
  carioca:    "Lighter espresso, with hot water",
  cappuccino: "Espresso, milk and thick foam",
  flatwhite:  "Double espresso, silky milk",
  latte:      "Espresso with lots of milk",
  icedlatte:  "Espresso and cold milk on ice",
  icedcoffee: "Coffee over ice",
  mocha:      "Espresso, chocolate and milk",
  matcha:     "Green tea with steamed milk",
  icedmatcha: "Green tea and cold milk on ice",
  chocolate:  "Hot chocolate, no coffee",
};

// Drinks made with milk: the guest has to pick one of these milks before ordering.
// Regular is a choice too, but isn't stored (no extras row = regular milk).
export const MILK_DRINKS = ["cappuccino", "flatwhite", "latte", "icedlatte", "mocha", "matcha", "icedmatcha", "chocolate"];
export const MILKS = { lactosefree: "Lactose-free milk", plant: "Plant-based milk" };
export const MILK_CHOICES = ["regular", ...Object.keys(MILKS)];
// Only on the menu on an event day (/demoday).
export const EVENT_ONLY = ["icedcoffee"];

// pay: { recipient, bagPrice, bagStock, bagsLeft } when tips and bags are on, null otherwise.
export function miniAppHtml(drinks, pay = null) {
  const menu = JSON.stringify(drinks.map(d => ({ ...d, icon: ICONS[d.id] || "", desc: DESCRIPTIONS[d.id] || "", milk: MILK_DRINKS.includes(d.id), eventOnly: EVENT_ONLY.includes(d.id) })));
  const payConfig = JSON.stringify(pay && { ...pay, presets: TIP_PRESETS, products: PRODUCTS });
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Beach Coffee Co.</title>
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#071110">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
  :root {
    --bg: #071110; --card: #0c1a17; --card-2: #11231f; --line: rgba(168,230,184,.14);
    --text: #eef3ee; --muted: #7f9a8c; --faint: #4f685d; --mint: #a8e6b8; --gold: #e8b86a; --gold-ink: #1d1407;
    --display: "Archivo", "Arial Black", sans-serif; --body: "Figtree", system-ui, sans-serif; --mono: "JetBrains Mono", ui-monospace, monospace;
    color-scheme: dark;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.45 var(--body); }
  .wrap { max-width: 560px; margin: 0 auto; padding: 18px 16px 120px; display: grid; gap: 22px; }
  header { display: flex; align-items: center; gap: 14px; }
  .wordmark { height: 34px; width: auto; display: block; }
  header span { font: 600 .72rem/1 var(--body); letter-spacing: .2em; color: var(--muted); padding-left: 14px; border-left: 1px solid var(--line); }
  .eyebrow { margin: 0; font: 600 .76rem/1.3 var(--body); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
  .hero { border: 1px solid var(--line); border-radius: 26px; padding: 22px 20px;
    background: radial-gradient(120% 90% at 100% 0%, rgba(160,190,170,.22), transparent 55%), radial-gradient(90% 80% at 0% 100%, rgba(30,80,90,.35), transparent 60%), var(--card);
    display: grid; gap: 12px; }
  .hero .live { margin: -6px 0 0; font: 600 .76rem/1.3 var(--body); letter-spacing: .22em; text-transform: uppercase; color: var(--mint); }
  .hero h1 { margin: 0; font: 900 clamp(2.1rem, 10vw, 3rem)/.95 var(--display); font-stretch: 125%; text-transform: uppercase; }
  .hero h1 b { display: block; color: var(--mint); }
  .card { border: 1px solid var(--line); border-radius: 22px; background: var(--card); padding: 6px 18px; }
  .order { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .order:last-child { border-bottom: 0; }
  .order .num { font: 500 .85rem/1 var(--mono); color: var(--muted); width: 34px; }
  .order .name { flex: 1; font-weight: 500; }
  .pill { font: 600 .75rem/1 var(--body); padding: 6px 10px; border-radius: 999px; }
  .ck { font: 600 .75rem/1 var(--body); padding: 6px 10px; border-radius: 999px; border: 1px solid var(--mint); background: transparent; color: var(--mint); cursor: pointer; }
  .ck.on { border-color: transparent; background: rgba(168,230,184,.16); cursor: default; }
  .checkin-card { border-color: rgba(168,230,184,.35); }
  .pill.pending { background: rgba(232,184,106,.16); color: var(--gold); }
  .pill.ready { background: rgba(168,230,184,.16); color: var(--mint); }
  .pill.cancelled { background: rgba(255,255,255,.06); color: var(--faint); }
  .drinks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .drink { border: 1px solid var(--line); border-radius: 20px; background: var(--card); color: var(--text); padding: 12px;
    display: grid; grid-template-columns: 44px minmax(0, 1fr); column-gap: 12px; align-items: center; text-align: left;
    font: inherit; cursor: pointer; transition: transform .06s, border-color .15s, background .15s; }
  .drink:active { transform: scale(.97); }
  .drink.selected { border-color: var(--mint); background: var(--card-2); box-shadow: 0 0 0 1px var(--mint) inset; }
  .drink .ico { width: 44px; height: 44px; border-radius: 14px; background: var(--card-2); display: grid; place-items: center; }
  .drink.selected .ico { background: rgba(168,230,184,.16); }
  .drink svg { width: 26px; height: 26px; stroke: var(--mint); fill: none; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .drink .name { font: 600 .95rem/1.2 var(--body); }
  .drink .desc { display: block; margin-top: 3px; font: 400 .76rem/1.3 var(--body); color: var(--muted); }
  .drink .left { display: block; margin-top: 3px; font: 500 .78rem/1 var(--mono); color: var(--gold); }
  .drink.soldout { opacity: .45; cursor: default; }
  .note { color: var(--muted); font-size: .9rem; margin: 0; }
  .note.staff { margin-top: 28px; text-align: center; font-size: .78rem; }
  .note.staff a { color: var(--faint, var(--muted)); }
  .closed-note { margin-top: 18px; padding: 16px 18px; border-color: var(--gold); }
  .closed-note p { margin: 0; color: var(--text); font-size: .95rem; line-height: 1.45; }
  .center { text-align: center; padding: 40px 10px; display: grid; gap: 10px; justify-items: center; }
  .center h2 { margin: 0; font: 800 1.4rem/1.1 var(--display); font-stretch: 125%; text-transform: uppercase; }
  .center h2 b { color: var(--mint); }
  .btn { height: 48px; padding: 0 24px; border-radius: 999px; border: 0; background: var(--gold); color: var(--gold-ink); font: 600 1rem/1 var(--body); cursor: pointer; }
  .btn:disabled { opacity: .5; cursor: default; }
  .btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
  /* Each wallet in its own colors: Solflare yellow and black, Phantom lavender and white. */
  .btn.solflare { background: #fbee64; color: #111; }
  .btn.phantom { background: #a99eec; color: #fff; }
  .fallback { position: fixed; left: 16px; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
  .fallback .btn { width: 100%; }
  .tabs { display: grid; grid-template-columns: repeat(var(--tabs, 2), 1fr); gap: 6px; padding: 5px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); }
  .tab { height: 42px; border: 0; border-radius: 999px; background: transparent; color: var(--muted); font: 600 .95rem/1 var(--body); cursor: pointer; }
  .tab.active { background: var(--card-2); color: var(--mint); box-shadow: 0 0 0 1px var(--line) inset; }
  .me-card { border: 1px solid var(--line); border-radius: 22px; padding: 18px 20px; margin-bottom: 12px;
    background: radial-gradient(120% 120% at 100% 0%, rgba(232,184,106,.16), transparent 60%), var(--card); display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .me-card b { font: 900 2.2rem/1 var(--display); font-stretch: 125%; color: var(--gold); }
  .me-card span { color: var(--muted); font-size: .95rem; text-align: right; }
  .rank { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .rank:last-child { border-bottom: 0; }
  .rank .pos { width: 34px; font: 500 .95rem/1 var(--mono); color: var(--muted); text-align: center; }
  .rank .pos.medal { font-size: 1.4rem; }
  .rank .who { flex: 1; font-weight: 500; }
  .rank .n { font: 500 .95rem/1 var(--mono); color: var(--text); }
  .rank.me .who { color: var(--mint); }
  .rank.me .who::after { content: " · you"; color: var(--muted); font-weight: 400; }
  .pay { display: grid; gap: 12px; }
  .pay-card { border: 1px solid var(--line); border-radius: 22px; background: var(--card); padding: 18px; display: grid; gap: 12px; }
  .pay-card h3 { margin: 0; font: 800 1.02rem/1.2 var(--display); font-stretch: 125%; letter-spacing: .02em; }
  .chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .chip { height: 46px; border-radius: 14px; border: 1px solid var(--line); background: var(--card-2); color: var(--text); font: 600 1rem/1 var(--body); cursor: pointer; }
  .chip.on { border-color: var(--mint); color: var(--mint); box-shadow: 0 0 0 1px var(--mint) inset; }
  .chip.off { opacity: .4; cursor: default; display: grid; place-content: center; gap: 3px; line-height: 1.1; }
  .chip.off small { font: 500 .66rem/1 var(--mono); color: var(--muted); }
  .pay input { height: 46px; border-radius: 14px; border: 1px solid var(--line); background: var(--card-2); color: var(--text); padding: 0 14px; font: 500 1rem/1 var(--body); width: 100%; }
  .bag { background: radial-gradient(120% 120% at 100% 0%, rgba(232,184,106,.18), transparent 60%), var(--card); cursor: pointer; }
  .bag.on { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold) inset; }
  .bag.soldout { opacity: .55; cursor: default; }
  .tag { justify-self: start; font: 600 .7rem/1 var(--body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-ink); background: var(--gold); padding: 6px 10px; border-radius: 999px; }
  .price { font: 500 1.05rem/1 var(--mono); color: var(--gold); }
  .amount { font: 900 2.4rem/1 var(--display); font-stretch: 125%; color: var(--gold); }
  .amount small { font: 600 1rem/1 var(--body); color: var(--muted); letter-spacing: .1em; margin-left: 6px; }
  .wide { width: 100%; }
  a.btn { display: grid; place-items: center; text-decoration: none; }
  .order-tg { display: grid; gap: 12px; padding: 16px 18px; margin-bottom: 14px; }
  .tip-after { justify-self: stretch; text-align: left; margin-top: 18px; }
  .bag-offer { width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; text-align: left; padding: 14px 16px; border-radius: 18px;
    border: 1px solid var(--gold); color: var(--text); font: 500 .95rem/1.3 var(--body); cursor: pointer;
    background: radial-gradient(120% 140% at 100% 0%, rgba(232,184,106,.22), transparent 60%), var(--card-2); }
  .bag-offer .ic { font-size: 1.6rem; } .bag-offer b { display: block; font-weight: 600; } .bag-offer small { color: var(--muted); font-size: .8rem; }
  .bag-offer .price { white-space: nowrap; }
  .sheet { position: fixed; inset: 0; z-index: 10; display: flex; align-items: flex-end; justify-content: center; background: rgba(3,8,7,.62); animation: fade .2s ease-out; }
  .sheet-card { width: 100%; max-width: 560px; border: 1px solid var(--line); border-bottom: 0; border-radius: 28px 28px 0 0; padding: 22px 18px calc(22px + env(safe-area-inset-bottom, 0px));
    background: radial-gradient(120% 120% at 100% 0%, rgba(232,184,106,.16), transparent 60%), var(--card); display: grid; gap: 14px; animation: rise .25s ease-out; }
  .sheet-card h3 { margin: 0; font: 900 1.5rem/1.1 var(--display); font-stretch: 125%; text-transform: uppercase; }
  .sheet-card h3 b { color: var(--gold); }
  .news { display: grid; gap: 10px; margin: 14px 0 16px; }
  .news div { display: flex; gap: 12px; align-items: flex-start; border: 1px solid var(--line); border-radius: 16px; padding: 10px 12px; background: var(--card-2); }
  .news span { font-size: 1.5rem; line-height: 1.2; }
  .news p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.35; }
  .news b { display: block; color: var(--text); font-size: .98rem; }
  #newsSheet .btn + .btn { margin-top: 8px; }
  @keyframes fade { from { opacity: 0; } }
  @keyframes rise { from { transform: translateY(40px); opacity: 0; } }
  .field { display: grid; gap: 6px; }
  .field label { font: 600 .72rem/1 var(--body); letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
  .copy { display: flex; gap: 8px; align-items: center; background: var(--card-2); border: 1px solid var(--line); border-radius: 14px; padding: 10px 10px 10px 14px; }
  .copy code { flex: 1; font: 500 .84rem/1.35 var(--mono); word-break: break-all; }
  .copy button { flex: none; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--mint); font: 600 .85rem/1 var(--body); cursor: pointer; }
  .waiting { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: .92rem; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); animation: pulse 1.4s infinite; }
  @keyframes pulse { 50% { opacity: .3; } }
  .seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 5px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); margin-bottom: 12px; }
  .seg button { height: 38px; border: 0; border-radius: 999px; background: transparent; color: var(--muted); font: 600 .9rem/1 var(--body); cursor: pointer; }
  .seg button.on { background: var(--card-2); color: var(--mint); box-shadow: 0 0 0 1px var(--line) inset; }
  .race-boost { border: 1px solid rgba(232,184,106,.45); border-radius: 20px; padding: 14px 16px; margin: 12px 0; display: flex; gap: 12px; align-items: center;
    background: radial-gradient(120% 120% at 100% 0%, rgba(232,184,106,.14), transparent 60%), var(--card); }
  .race-boost div { flex: 1; } .race-boost b { display: block; } .race-boost small { color: var(--muted); font-size: .82rem; }
  .race-boost button { flex: none; height: 40px; padding: 0 16px; border-radius: 999px; border: 0; background: var(--gold); color: var(--gold-ink); font: 600 .9rem/1 var(--body); cursor: pointer; }
  .race-boost button[disabled] { opacity: .5; cursor: default; }
  .zb { display: inline-block; margin-left: 6px; font: 600 .72rem/1 var(--body); color: var(--gold); background: rgba(232,184,106,.16); border: 1px solid rgba(232,184,106,.4); padding: 3px 7px; border-radius: 999px; vertical-align: 2px; }
  @keyframes pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .pop { animation: pop .45s cubic-bezier(.2,1.4,.4,1) both; }
  @media (prefers-reduced-motion: reduce) { .pop { animation: none !important; } }
  [hidden] { display: none !important; }
</style>
</head><body>
<div class="wrap">
  <header>${WORDMARK_SVG}<span>@ ISLAND DAO</span></header>
  <div class="hero">
    <p class="eyebrow" id="greet">Welcome to the bar</p>
    <p class="live" id="live">Live · Floripa</p>
    <h1>What's your<b>coffee?</b></h1>
  </div>
  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" data-tab="menu">Menu</button>
    <button class="tab" role="tab" data-tab="rank">Ranking 🏆</button>
    <button class="tab" role="tab" data-tab="pay" hidden>Tip & Bag</button>
  </div>
  <div id="tab-menu">
  <section id="mine" hidden>
    <p class="eyebrow" style="margin-bottom:10px">Your orders today</p>
    <div class="card" id="orders"></div>
  </section>
  <section id="pick">
    <p class="note" id="lunchNote" hidden style="margin-bottom:12px"></p>
    <p class="note" id="eventNote" hidden style="margin-bottom:12px"></p>
    <div class="card order-tg" id="orderTg" hidden>
      <p class="note" style="color:var(--text)"><b>Order from your seat.</b> Open the bar in Telegram, pick your drink, and get a ping when it's ready.</p>
      <a class="btn wide" href="https://t.me/BeachCoffeeIslandBot" target="_blank" rel="noopener">Order on Telegram</a>
    </div>
    <p class="eyebrow" style="margin-bottom:10px" id="pickTitle">Step 1 · Pick your drink</p>
    <div class="drinks" id="drinks"></div>
    <div id="milkPick" hidden>
      <p class="eyebrow" style="margin:18px 0 10px">Step 2 · Choose your milk</p>
      <div class="chips" id="milkChips" style="grid-template-columns:repeat(3, 1fr)"></div>
    </div>
    <div id="confirmStep" hidden>
      <p class="eyebrow" style="margin:18px 0 10px" id="confirmTitle"></p>
      <div class="card" style="padding:14px 18px"><p class="note" id="confirmText" style="color:var(--text)"></p></div>
    </div>
    <!-- When the bar is closed the menu stays up to browse; this is where ordering would be. -->
    <div class="card closed-note" id="closedNote" hidden><p id="closedText"></p></div>
  </section>
  <section id="done" class="center" hidden></section>
  <p class="note" id="msg"></p>
  </div>
  <section id="tab-rank" hidden>
    <div class="seg" id="rankSeg"><button class="on" data-board="patrons">💛 Top patrons</button><button data-board="race">☕ Coffee race</button></div>
    <div id="boardRace" hidden>
      <div class="me-card" id="meRank"></div>
      <div class="race-boost" id="raceBoost" hidden>
        <div><b>⚡ +1 cup in the race</b><small>1 USDC, one a day. It shows as ⚡ on the board.</small></div>
        <button id="raceBoostBtn">Boost</button>
      </div>
      <div class="card" id="rankList"></div>
      <p class="note" style="margin-top:12px">Every drink you order here in Telegram counts. Keep ordering to climb 🏝️</p>
    </div>
    <div id="boardPatrons">
      <div class="card" id="patronList"></div>
      <p class="note" style="margin-top:12px">USDC tips to the barista, on Solana. A board of its own: tips never move the coffee race 💛</p>
    </div>
  </section>
  <section id="tab-pay" class="pay" hidden>
    <div id="payPick" class="pay">
      <p class="eyebrow">Drinks are on the house ☕</p>
      <div class="pay-card">
        <h3>💛 Tip the barista</h3>
        <div class="chips" id="chips"></div>
        <input id="custom" inputmode="decimal" placeholder="Other amount (USDC)" hidden>
      </div>
      <div class="pay-card bag" id="bagCard" role="button" tabindex="0">
        <span class="tag">Limited edition</span>
        <h3>🛍️ Island DAO coffee bag</h3>
        <p class="note" id="bagDetail"></p>
        <span class="price" id="bagPrice"></span>
      </div>
      <button class="btn wide" id="payGo" disabled>Choose a tip or the bag</button>
      <p class="note">Paid in USDC on Solana.</p>
    </div>
    <div id="payBox" class="pay" hidden>
      <div class="pay-card">
        <p class="eyebrow" id="payItem"></p>
        <div class="amount" id="payAmount"></div>
        <p class="note">USDC on the Solana network.</p>
      </div>
      <button class="btn solflare wide" id="paySolflare">Pay with Solflare</button>
      <button class="btn phantom wide" id="payPhantom">Pay with Phantom</button>
      <button class="btn ghost wide" id="paySolanaPay">Blocked by your wallet? Use Solana Pay</button>
      <div class="pay-card">
        <h3>Other wallet or exchange</h3>
        <p class="note">Send exactly this amount of <b>USDC</b> on <b>Solana</b> to:</p>
        <div class="field"><label>Address</label><div class="copy"><code id="payAddr"></code><button data-copy="payAddr">Copy</button></div></div>
        <div class="field"><label>Amount (USDC)</label><div class="copy"><code id="payAmt"></code><button data-copy="payAmt">Copy</button></div></div>
        <p class="note">No Solana wallet? Any exchange works (Binance, Coinbase…): withdraw USDC on the <b>Solana</b> network. The barista gets a message when it arrives; it can take a few minutes.</p>
      </div>
      <div class="waiting"><span class="dot"></span><span>Waiting for the payment…</span></div>
      <button class="btn ghost wide" id="payBack">Back</button>
    </div>
    <section id="payDone" class="center" hidden></section>
    <p class="note" id="payMsg"></p>
  </section>
  <!-- Only in the installed app / browser: the team opens Âncora (orders, finance) with the barista code. -->
  <p class="note staff"><a href="/guide" target="_blank" rel="noopener">How it works</a><span id="staffLink" hidden> · <a href="/panel">Staff · Âncora panel</a></span></p>
</div>
<div class="fallback" id="fallback" hidden><button class="btn" id="fallbackBtn">Order</button></div>
<!-- What's new: shown once per NEWS_ID: Telegram guests (returning ones on open, new ones after their first
     order) and the installed app / browser, each with its own list (filled by showNews). -->
<div class="sheet" id="newsSheet" hidden role="dialog" aria-modal="true" aria-labelledby="newsTitle">
  <div class="sheet-card">
    <p class="eyebrow">What's new at the bar ☕</p>
    <h3 id="newsTitle">The coffee <b>race</b></h3>
    <div class="news" id="newsItems"></div>
    <button class="btn wide" id="newsGo">See the ranking</button>
    <button class="btn ghost wide" id="newsLater">Got it</button>
  </div>
</div>
<div class="sheet" id="tipSheet" hidden role="dialog" aria-modal="true" aria-labelledby="tipSheetTitle">
  <div class="sheet-card">
    <p class="eyebrow">Drinks are on the house ☕</p>
    <h3 id="tipSheetTitle">Tip the <b>barista?</b></h3>
    <p class="note">Optional. Paid in USDC on Solana, straight to the barista. Or take home our limited coffee bag.</p>
    <div class="chips" id="sheetChips"></div>
    <div id="sheetBag"></div>
    <button class="btn ghost wide" id="sheetLater">Maybe later</button>
  </div>
</div>
<script>
  const MENU = ${menu};
  const MILKS = ${JSON.stringify(MILKS)};
  const PAY = ${payConfig};
  const tg = window.Telegram && window.Telegram.WebApp;
  const initData = tg ? tg.initData : "";
  const $ = id => document.getElementById(id);
  let checkinOn = false; // coffee check-in onchain (the bar has a check-in wallet)
  let selected = null, busy = false, open = true, tab = "menu", tipAsked = false, milk = null, event = null, lunch = null;

  if (tg) {
    tg.ready(); tg.expand();
    try { tg.setHeaderColor("#071110"); tg.setBackgroundColor("#071110"); tg.setBottomBarColor && tg.setBottomBarColor("#071110"); } catch (e) {}
  }
  const main = tg && tg.MainButton;

  const drinkName = id => (MENU.find(d => d.id === id) || { name: id }).name;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function greeting(name) {
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return name ? g + ", " + name : g;
  }

  // On an event day only that day's drinks show, each with what's left; otherwise the full menu.
  let out = [];   // drinks and milks the bar has run out of (/out)
  const leftOf = id => { const e = event && event.drinks.find(x => x.id === id); return e ? e.left : null; };
  function visibleMenu() {
    return event ? event.drinks.map(e => MENU.find(d => d.id === e.id)).filter(Boolean) : MENU.filter(d => !d.eventOnly);
  }
  function renderDrinks() {
    $("drinks").innerHTML = visibleMenu().map(d => {
      const left = leftOf(d.id), gone = out.includes(d.id);
      const tag = gone ? "Not available" : left === null ? "" : left ? left + " left" : "Sold out";
      return '<button class="drink' + (selected === d.id ? " selected" : "") + (left === 0 || gone ? " soldout" : "") + '" data-id="' + d.id + '"' + (gone ? " disabled" : "") + '>' +
        '<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + d.icon + '</svg></span>' +
        '<span class="name">' + esc(d.name) + (d.desc ? '<span class="desc">' + esc(d.desc) + '</span>' : "") + (tag ? '<span class="left">' + tag + '</span>' : "") + '</span></button>';
    }).join("");
  }

  function renderMilk() {
    const d = MENU.find(x => x.id === selected);
    $("milkPick").hidden = !open || !(d && d.milk);
    const opts = [["regular", "Regular"], ["lactosefree", "Lactose-free"], ["plant", "Plant-based"]];
    $("milkChips").innerHTML = opts.map(([id, label]) => out.includes(id)
      ? '<button class="chip off" data-milk="' + id + '" disabled>' + label + '<small>Not available</small></button>'
      : '<button class="chip' + (milk === id ? " on" : "") + '" data-milk="' + id + '">' + label + '</button>').join("");
  }

  function renderOrders(list) {
    if (!list || !list.length) { $("mine").hidden = true; return; }
    const label = { pending: "Preparing", ready: "Ready", cancelled: "Cancelled" };
    $("orders").innerHTML = list.map(o =>
      '<div class="order"><span class="num">#' + o.num + '</span><span class="name">' + esc(drinkName(o.drink)) + '</span>' +
      '<span class="pill ' + o.status + '">' + (label[o.status] || o.status) + '</span>' +
      (checkinOn && o.status !== "cancelled" ? (o.checkin === "done" ? '<span class="ck on">✓ Onchain</span>' : '<button class="ck" data-checkin="ask" data-num="' + o.num + '">☕ Check in</button>') : '') +
      '</div>').join("");
    $("mine").hidden = false;
  }

  function renderRanking(r) {
    if (!r) return;
    const zb = n => n ? '<span class="zb">+' + n + '⚡</span>' : '';
    $("meRank").innerHTML = r.me
      ? '<b>#' + r.me.rank + '</b><span>' + r.me.drinks + ' drink' + (r.me.drinks === 1 ? '' : 's') + zb(r.me.boosts) + '<br>out of ' + r.total + ' coffee lovers</span>'
      : '<span style="text-align:left">Order your first drink to join the ranking ☕</span>';
    const medal = n => ["🥇", "🥈", "🥉"][n - 1];
    $("rankList").innerHTML = r.top.length
      ? r.top.map(x => '<div class="rank' + (x.me ? ' me' : '') + '"><span class="pos' + (medal(x.rank) ? ' medal' : '') + '">' +
          (medal(x.rank) || '#' + x.rank) + '</span><span class="who">' + esc(x.name) + '</span><span class="n">' + x.drinks + zb(x.boosts) + '</span></div>').join("")
      : '<div class="rank"><span class="who" style="color:var(--muted)">No orders yet. Be the first!</span></div>';
    // Race boost: only with tips on, for someone already in the race.
    $("raceBoost").hidden = !PAY || !r.me;
    $("raceBoostBtn").disabled = !!r.boostedToday;
    $("raceBoostBtn").textContent = r.boostedToday ? "Done today ✓" : "Boost · 1 USDC";
    const pt = r.patrons || [];
    $("patronList").innerHTML = pt.length
      ? pt.map(x => '<div class="rank' + (x.me ? ' me' : '') + '"><span class="pos' + (medal(x.rank) ? ' medal' : '') + '">' +
          (medal(x.rank) || '#' + x.rank) + '</span><span class="who">' + esc(x.name) + '</span><span class="n">' + x.usdc + ' <small style="font-size:.7rem;color:var(--muted)">USDC</small></span></div>').join("")
      : '<div class="rank"><span class="who" style="color:var(--muted)">No tips yet. Be the first patron 💛</span></div>';
  }

  function showTab(name) {
    tab = name;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    $("tab-menu").hidden = name !== "menu";
    $("tab-rank").hidden = name !== "rank";
    $("tab-pay").hidden = name !== "pay";
    tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged();
    if (name === "rank") refreshRanking();
    popIn($(name === "menu" ? "tab-menu" : "tab-" + name));
    updateButton();
  }

  // Cards and rows pop in with a little spring when a tab opens (not with "reduce motion").
  function popIn(section) {
    if (!section || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    section.querySelectorAll(".me-card, .race-boost, .rank, .drink, .pay-card, .order, .seg").forEach(n => {
      if (i >= 20 || n.offsetParent === null) return;
      n.classList.remove("pop"); void n.offsetWidth; n.style.animationDelay = (i++ * 35) + "ms"; n.classList.add("pop");
      n.addEventListener("animationend", () => { n.classList.remove("pop"); n.style.animationDelay = ""; }, { once: true });
    });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-board]"); if (!b) return;
    document.querySelectorAll("#rankSeg button").forEach(x => x.classList.toggle("on", x === b));
    $("boardRace").hidden = b.dataset.board !== "race";
    $("boardPatrons").hidden = b.dataset.board !== "patrons";
    popIn($(b.dataset.board === "race" ? "boardRace" : "boardPatrons"));
  });
  // What's new: once per update (NEWS_ID) on each device. In Telegram: guests who already ordered see it
  // when they open the app; new guests right after their first order (once the tip pop-up is closed).
  // In the installed app (Seeker) and the browser: on open, with what works there.
  const NEWS_ID = "2026-11-race";
  const NEWS_TELEGRAM = [
    ["🏆", "Ranking", "Every coffee you order counts. Climb to the top of Island DAO."],
    ["⚡", "Race boost", "+1 cup in the race for 1 USDC, once a day. It shows as ⚡ on the board."],
    ["💛", "Top patrons", "Tips to the barista get their own board."],
    ["📖", "How it works", "Everything in one guide, at the bottom of the app."],
  ];
  const NEWS_WEB = [
    ["☕", "Order from your seat", "Tap Order on Telegram, pick your drink and get a ping when it's ready."],
    ["🏆", "The coffee race", "Every coffee you order in Telegram counts. Climb the ranking, or boost +1 cup ⚡."],
    ["💛", "Tip & Bag from your phone", "Tip the barista or get the Island DAO coffee bag in USDC, with your phone's wallet."],
    ["📖", "How it works", "Everything in one guide, at the bottom of the app."],
  ];
  let newsAfterOrder = false;
  const newsSeen = () => { try { return localStorage.getItem("bc-news") === NEWS_ID; } catch (e) { return true; } };
  function openNews() {
    const web = !initData, items = web ? NEWS_WEB : NEWS_TELEGRAM;
    $("newsTitle").innerHTML = web ? "Coffee, <b>onchain</b>" : "The coffee <b>race</b>";
    $("newsItems").innerHTML = items.map(([icon, title, text]) => '<div><span>' + icon + '</span><p><b>' + title + '</b>' + esc(text) + '</p></div>').join("");
    $("newsGo").textContent = web ? "Order on Telegram" : "See the ranking";
    const done = () => { $("newsSheet").hidden = true; try { localStorage.setItem("bc-news", NEWS_ID); } catch (e) {} };
    $("newsLater").onclick = done;
    $("newsGo").onclick = () => { done(); if (web) window.open("https://t.me/BeachCoffeeIslandBot", "_blank"); else showTab("rank"); };
    $("newsSheet").onclick = e => { if (e.target === $("newsSheet")) done(); };
    $("newsSheet").hidden = false;
  }
  // returning: a Telegram guest already in the ranking. New ones wait for their first order.
  function showNews(returning) {
    if (newsSeen()) return;
    if (initData && !returning) { newsAfterOrder = true; return; }
    newsAfterOrder = false;
    setTimeout(openNews, 600);
  }
  // Right after an order: a new guest sees What's new once the tip pop-up is out of the way.
  function newsAfterFirstOrder() {
    if (!newsAfterOrder || newsSeen()) return;
    newsAfterOrder = false;
    if (!$("tipSheet").hidden || (PAY && !$("tipSheet").dataset.closed)) { $("tipSheet").dataset.newsNext = "1"; return; }
    setTimeout(openNews, 1200);
  }
  async function refreshRanking() {
    const s = await api("/api/session", {});
    if (s.ok) renderRanking(s.ranking);
  }

  // Step 1 the drink, step 2 the milk (drinks with milk only), step 3 the order.
  const needsMilk = () => { const d = MENU.find(x => x.id === selected); return !!(d && d.milk && !milk); };
  function updateButton() {
    const text = !selected ? "Pick a drink" : needsMilk() ? "Choose your milk"
      : "Order " + drinkName(selected) + (MILKS[milk] ? " · " + MILKS[milk].replace(" milk", "") : "");
    const ready = !!selected && !needsMilk();
    // The last step: what's about to be ordered, then the Order button.
    const d = MENU.find(x => x.id === selected);
    $("confirmStep").hidden = !ready || !open;
    if (ready) {
      $("confirmTitle").textContent = "Step " + (d.milk ? 3 : 2) + " · Confirm your order";
      $("confirmText").innerHTML = "<b>" + esc(d.name) + "</b>" + (d.milk ? " · " + esc(MILKS[milk] || "Regular milk") : "") + ". Tap <b>Order</b> below.";
    }
    if (main) {
      main.setParams({ text, color: "#e8b86a", text_color: "#1d1407", is_active: ready && open && !busy, is_visible: open && tab === "menu" });
      if (busy) main.showProgress(); else main.hideProgress();
    } else {
      $("fallback").hidden = !open || tab !== "menu";
      $("fallbackBtn").textContent = text;
      $("fallbackBtn").disabled = !ready || busy;
    }
  }

  async function api(path, body) {
    const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData, ...body }) });
    return res.json().catch(() => ({ ok: false, error: "Something went wrong. Try again." }));
  }

  // Outside Telegram (the installed app, a browser): the live menu to browse, ordering in Telegram,
  // and Tip & Bag, paid with the phone's wallet on the checkout page.
  let browsing = false;
  async function browse() {
    browsing = true;
    document.querySelector('[data-tab="rank"]').hidden = true; // the ranking is per Telegram customer
    document.querySelector(".tabs").style.setProperty("--tabs", PAY ? 2 : 1);
    $("orderTg").hidden = false;
    $("staffLink").hidden = false;
    $("pickTitle").textContent = "Our menu";
    const s = await fetch("/api/menu").then(r => r.json()).catch(() => null);
    if (!s || !s.ok) { $("msg").textContent = "Couldn't load the menu. Check your connection and try again."; return; }
    open = s.open; out = s.out || []; event = s.event || null;
    if (!open) $("live").textContent = "Closed for now";
    $("closedNote").hidden = open;
    $("closedText").textContent = s.closed || "The bar is closed right now 🌙 Come back soon!";
    renderDrinks();
    showNews(true);
  }

  async function load() {
    if (!initData) return browse();
    const s = await api("/api/session", {});
    if (!s.ok) { $("msg").textContent = s.error || "Couldn't load the menu."; return; }
    $("greet").textContent = greeting(s.user && s.user.first_name);
    open = s.open;
    // Closed: the menu, ranking, tips and the bag stay open; only ordering waits, with the reason under the drinks.
    if (!open) $("live").textContent = "Closed for now";
    $("pickTitle").textContent = open ? "Step 1 · Pick your drink" : "Our menu";
    $("closedNote").hidden = open;
    $("closedText").textContent = s.closed || "The bar is closed right now 🌙 Come back soon!";
    lunch = s.lunch || null;
    checkinOn = !!s.checkin;
    $("lunchNote").hidden = !lunch;
    if (lunch) $("lunchNote").innerHTML = "🍽️ <b>Lunch break</b> until " + esc(lunch.label) + ". You can still order: it'll be ready from " + esc(lunch.label) + ".";
    // The daily limit (normal days): a note once they've ordered, and no menu once they've reached it.
    const daily = !s.event && s.daily ? s.daily : null;
    if (daily && daily.used) {
      $("eventNote").hidden = false;
      $("eventNote").innerHTML = "☕ Up to " + daily.max + (daily.max === 1 ? " drink" : " drinks") + " per person a day · you've had " + daily.used + ".";
      if (daily.used >= daily.max && open) {
        $("pick").hidden = true;
        $("msg").textContent = "That's your " + (daily.max === 1 ? "drink" : daily.max + " drinks") + " for today 🙌 See you tomorrow!";
      }
    }
    out = s.out || [];
    if (out.includes(selected)) { selected = null; milk = null; }
    if (out.includes(milk)) milk = null;
    event = s.event || null;
    if (event) {
      $("eventNote").hidden = false;
      $("eventNote").innerHTML = "🎤 <b>Demo Day</b>: " + (event.max === 1 ? "one drink per person today"
        : "up to " + event.max + " drinks per person today" + (event.used ? " · you've had " + event.used : "")) + ".";
      if (event.used >= event.max && open) {
        $("pick").hidden = true;
        $("msg").textContent = "That's your " + (event.max === 1 ? "drink" : event.max + " drinks") + " for today 🙌 See you tomorrow!";
      }
    }
    renderDrinks();
    renderOrders(s.orders);
    renderRanking(s.ranking);
    updateButton();
    showNews(!!(s.ranking && s.ranking.me));
  }

  // Telegram's own pop-up when there is one, the browser's otherwise.
  // Older Telegram apps throw on showConfirm: then the browser's confirm.
  const ask = text => new Promise(ok => { try { tg.showConfirm(text, ok); } catch (e) { ok(confirm(text)); } });
  const lunchQuestion = l => "🍽️ The barista is on lunch break until " + l.label + ".\\n\\nYour " + drinkName(selected) + " will be ready from " + l.label + ". Order it?";
  async function order() {
    if (!selected || needsMilk() || busy) return;
    if (lunch && !(await ask(lunchQuestion(lunch)))) return;
    busy = true; updateButton();
    let r = await api("/api/order", { drink: selected, milk, afterLunch: !!lunch });
    // Lunch started while the menu was open: ask now, then send it again.
    if (!r.ok && r.lunch) {
      lunch = r.lunch;
      r = (await ask(lunchQuestion(lunch))) ? await api("/api/order", { drink: selected, milk, afterLunch: true }) : { ok: false, error: "" };
    }
    busy = false;
    if (!r.ok) {
      tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("error");
      $("msg").textContent = r.error || "Couldn't place the order. Try again.";
      updateButton();
      return;
    }
    tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("success");
    $("pick").hidden = true; $("msg").textContent = "";
    if (main) main.hide(); else $("fallback").hidden = true;
    $("done").innerHTML =
      '<p class="eyebrow">Order #' + r.order.num + (r.order.milk ? ' · ' + esc(MILKS[r.order.milk]) : '') + '</p>' +
      '<h2>' + esc(drinkName(r.order.drink)) + '<br><b>on the way</b></h2>' +
      '<p class="note">' + (r.order.lunch ? '🍽️ Ready from ' + esc(r.order.lunch) + ', after the barista\\'s lunch. We\\'ll message you in the chat ☕' : 'We\\'ll message you in the chat when it\\'s ready ☕') + '</p>' +
      '<div style="display:flex;gap:10px;margin-top:8px"><button class="btn" id="close">Back to chat</button><button class="btn ghost" id="again">Order another</button></div>' +
      (checkinOn ? '<div class="pay-card checkin-card"><h3>☕ Check in your coffee onchain</h3><p class="note">It’s just like the event check-in: your wallet signs, and the bar pays the network fee. Free for you.</p>' +
        '<button class="btn solflare wide" data-checkin="solflare" data-num="' + r.order.num + '">Check in with Solflare</button>' +
        '<button class="btn phantom wide" data-checkin="phantom" data-num="' + r.order.num + '">Check in with Phantom</button></div>' : '') +
      (PAY ? '<div class="pay-card tip-after"><h3>💛 Tip the barista?</h3><p class="note">Optional, in USDC on Solana. Drinks stay on the house.</p>' +
        '<div class="chips">' + PAY.presets.map(v => '<button class="chip" data-tip="' + v + '">' + v + '</button>').join("") +
        '<button class="chip" data-tip="other">Other</button></div>' + bagOffer() + '</div>' : '');
    $("done").hidden = false;
    $("close").onclick = () => tg ? tg.close() : null;
    $("again").onclick = () => { selected = null; milk = null; renderMilk(); $("done").hidden = true; $("pick").hidden = false; renderDrinks(); load(); };
    renderOrders(r.orders);
    refreshRanking();
    // Once per visit, a moment after the confirmation: the optional tip pop-up.
    if (PAY && !tipAsked) { tipAsked = true; setTimeout(() => { $("tipSheet").hidden = false; }, 700); }
    newsAfterFirstOrder();
  }

  $("drinks").addEventListener("click", e => {
    const b = e.target.closest("[data-id]");
    if (browsing && b) return $("orderTg").scrollIntoView({ behavior: "smooth", block: "center" });
    if (!b || leftOf(b.dataset.id) === 0 || out.includes(b.dataset.id)) return;
    selected = selected === b.dataset.id ? null : b.dataset.id;
    milk = null;
    tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged();
    $("msg").textContent = "";
    renderDrinks(); renderMilk(); updateButton();
    if (!open) $("closedNote").scrollIntoView({ behavior: "smooth", block: "center" });
    else if (!$("milkPick").hidden) $("milkPick").scrollIntoView({ behavior: "smooth", block: "center" });
    else if (selected) $("confirmStep").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  // Nothing is preselected: for a drink with milk the order button waits for this choice.
  $("milkChips").addEventListener("click", e => {
    const b = e.target.closest("[data-milk]"); if (!b || b.disabled) return;
    milk = b.dataset.milk;
    tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged();
    renderMilk(); updateButton();
    $("confirmStep").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
  if (main) main.onClick(order); else $("fallbackBtn").addEventListener("click", order);

  // ----- Coffee check-in onchain -----
  // Opens the check-in page in the wallet's browser (Solflare or Phantom), where the wallet signs.
  async function startCheckin(num, wallet) {
    const r = await api("/api/checkin", { num: Number(num) });
    if (!r.ok) { if (tg && tg.showAlert) tg.showAlert(r.error || "Couldn't start the check-in."); else alert(r.error || "Couldn't start the check-in."); return; }
    if (r.checkin.status === "done") { if (tg && tg.showAlert) tg.showAlert("This coffee is already checked in onchain ☕"); return; }
    openLink(wallet === "phantom" ? r.checkin.phantom : r.checkin.solflare);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-checkin]"); if (!b) return;
    const num = b.dataset.num;
    if (b.dataset.checkin !== "ask") return startCheckin(num, b.dataset.checkin);
    const pick = id => { if (id === "solflare" || id === "phantom") startCheckin(num, id); };
    try {
      tg.showPopup({ title: "Check in onchain", message: "Open your wallet to check in this coffee. Free: the bar pays the fee.",
        buttons: [{ id: "solflare", type: "default", text: "Solflare" }, { id: "phantom", type: "default", text: "Phantom" }, { type: "cancel" }] }, pick);
    } catch (err) { pick(confirm("Check in with Solflare? (Cancel for Phantom)") ? "solflare" : "phantom"); }
  });

  // ----- Tip & Bag -----
  let payPick = null, payPoll = null;
  // The limited-edition bag, offered next to the tip right after an order (card and pop-up).
  function bagOffer() {
    if (!PAY || PAY.bagsLeft === 0) return "";
    return '<button class="bag-offer" data-bag><span class="ic">🛍️</span><span><b>Island DAO Edition coffee bag</b><small>Limited edition' +
      (PAY.bagsLeft != null ? ' · only ' + PAY.bagsLeft + ' left' : '') + '</small></span><span class="price">' + PAY.bagPrice + ' USDC</span></button>';
  }
  function payAmountPicked() {
    if (!payPick) return null;
    if (payPick.kind === "bag") return PAY.bagPrice;
    return payPick.v === "other" ? $("custom").value.trim().replace(",", ".") : payPick.v;
  }
  function renderPayPick() {
    const a = payAmountPicked(), ok = payPick && a && Number(a) > 0;
    $("payGo").disabled = !ok;
    $("payGo").textContent = !payPick ? "Choose a tip or the bag" : ok ? "Continue · " + a + " USDC" : "Type an amount";
    document.querySelectorAll(".chip").forEach(b => b.classList.toggle("on", !!payPick && payPick.kind === "tip" && String(payPick.v) === b.dataset.v));
    $("bagCard").classList.toggle("on", !!payPick && payPick.kind === "bag");
    $("custom").hidden = !(payPick && payPick.v === "other");
  }
  // Race boost: the same checkout as a tip, for 1 USDC.
  $("raceBoostBtn").addEventListener("click", async () => {
    $("raceBoostBtn").disabled = true;
    const r = await api("/api/pay", { kind: "boost" });
    if (!r.ok) { $("raceBoostBtn").disabled = false; if (tg && tg.showAlert) tg.showAlert(r.error || "Try again."); else alert(r.error || "Try again."); return; }
    showTab("pay");
    $("payDone").hidden = true;
    showPayment(r.payment);
  });
  async function startPay() {
    $("payGo").disabled = true;
    const r = await api("/api/pay", { kind: payPick.kind, amount: payAmountPicked() });
    if (!r.ok) { $("payMsg").textContent = r.error || "Something went wrong. Try again."; renderPayPick(); return; }
    // Outside Telegram the checkout page pays with the phone's wallet (Mobile Wallet Adapter on Android).
    if (!initData) { location.href = r.payment.page; return; }
    showPayment(r.payment);
  }
  function openLink(url) { if (tg && tg.openLink) tg.openLink(url); else window.open(url, "_blank"); }
  let payRef = null;
  // Tells the bot which wallet button was tapped, so /payments shows where checkouts get stuck.
  function payTrack(step, detail) {
    if (!payRef) return;
    try {
      fetch("/api/pay/" + payRef + "/event", { method: "POST", keepalive: true, headers: { "content-type": "application/json" },
        body: JSON.stringify({ step, detail: detail + " tg " + (tg && tg.platform || "web") }) }).catch(() => {});
    } catch (e) {}
  }
  function showPayment(p) {
    $("payPick").hidden = true; $("payMsg").textContent = "";
    $("payItem").textContent = p.kind === "bag" ? "🛍️ " + PAY.products.bag.title : p.kind === "boost" ? "⚡ " + PAY.products.boost.title : "💛 " + PAY.products.tip.title;
    $("payAmount").innerHTML = esc(p.amount) + "<small>USDC</small>";
    $("payAddr").textContent = PAY.recipient;
    $("payAmt").textContent = p.amount;
    payRef = p.ref;
    $("payPhantom").onclick = () => { payTrack("tap", "phantom"); openLink(p.phantom); };
    $("paySolflare").onclick = () => { payTrack("tap", "solflare"); openLink(p.solflare); };
    // Opens the checkout in the phone's browser, where "Open my wallet app" hands the wallet a Solana Pay link.
    $("paySolanaPay").onclick = () => { payTrack("tap", "solanapay"); openLink(p.page); };
    $("payBox").hidden = false;
    clearInterval(payPoll);
    payPoll = setInterval(async () => {
      const r = await fetch("/api/pay/" + p.ref).then(r => r.json()).catch(() => null);
      if (r && r.ok && r.payment.status === "paid") paidView(r.payment);
    }, 3000);
  }
  function paidView(p) {
    clearInterval(payPoll);
    tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("success");
    $("payBox").hidden = true;
    $("payDone").innerHTML = p.kind === "bag"
      ? '<p class="eyebrow">Coffee bag #' + p.bagNo + '</p><h2>Paid!<br><b>It\\'s yours</b></h2><p class="note">Show the message in the chat at the bar to pick up your bag 🛍️</p>'
      : p.kind === "boost"
      ? '<p class="eyebrow">Coffee race</p><h2>+1 cup<br><b>⚡ in the race!</b></h2><p class="note">Check the ranking 🏆</p>'
      : '<p class="eyebrow">' + esc(p.amount) + ' USDC</p><h2>Thank<br><b>you!</b></h2><p class="note">Your tip went straight to the barista 💛</p>';
    $("payDone").hidden = false;
  }
  if (PAY) {
    document.querySelector('[data-tab="pay"]').hidden = false;
    document.querySelector(".tabs").style.setProperty("--tabs", 3);
    $("chips").innerHTML = PAY.presets.map(v => '<button class="chip" data-v="' + v + '">' + v + '</button>').join("") + '<button class="chip" data-v="other">Other</button>';
    $("bagDetail").textContent = PAY.products.bag.detail;
    const soldOut = PAY.bagsLeft === 0;
    $("bagPrice").textContent = soldOut ? "Sold out" : PAY.bagPrice + " USDC" + (PAY.bagsLeft != null ? " · " + PAY.bagsLeft + " of " + PAY.bagStock + " left" : "");
    $("bagCard").classList.toggle("soldout", soldOut);
    $("chips").addEventListener("click", e => {
      const b = e.target.closest("[data-v]"); if (!b) return;
      payPick = { kind: "tip", v: b.dataset.v }; renderPayPick();
      if (payPick.v === "other") $("custom").focus();
    });
    $("custom").addEventListener("input", renderPayPick);
    $("bagCard").addEventListener("click", () => { if (soldOut) return; payPick = { kind: "bag" }; renderPayPick(); });
    $("payGo").addEventListener("click", startPay);
    // Right after an order (pop-up or card): a tip chip opens Tip & Bag on that amount and goes straight to checkout.
    $("sheetChips").innerHTML = PAY.presets.map(v => '<button class="chip" data-tip="' + v + '">' + v + '</button>').join("") + '<button class="chip" data-tip="other">Other</button>';
    const closeSheet = () => {
      $("tipSheet").hidden = true; $("tipSheet").dataset.closed = "1";
      if ($("tipSheet").dataset.newsNext) { delete $("tipSheet").dataset.newsNext; if (!newsSeen()) setTimeout(openNews, 400); }
    };
    $("sheetLater").addEventListener("click", closeSheet);
    $("tipSheet").addEventListener("click", e => { if (e.target === $("tipSheet")) closeSheet(); });
    $("sheetBag").innerHTML = bagOffer();
    const tipFromChip = e => {
      const b = e.target.closest("[data-tip], [data-bag]"); if (!b) return;
      closeSheet();
      clearInterval(payPoll);
      $("payDone").hidden = true; $("payBox").hidden = true; $("payPick").hidden = false;
      showTab("pay");
      payPick = b.hasAttribute("data-bag") ? { kind: "bag" } : { kind: "tip", v: b.dataset.tip }; renderPayPick();
      if (payPick.v === "other") $("custom").focus(); else startPay();
    };
    $("done").addEventListener("click", tipFromChip);
    $("tipSheet").addEventListener("click", tipFromChip);
    $("payBack").addEventListener("click", () => { clearInterval(payPoll); $("payBox").hidden = true; $("payPick").hidden = false; renderPayPick(); });
    document.addEventListener("click", async e => {
      const b = e.target.closest("[data-copy]"); if (!b) return;
      const text = $(b.dataset.copy).textContent;
      payTrack("tap", "copy-" + b.dataset.copy);
      try { await navigator.clipboard.writeText(text); }
      catch (err) { const r = document.createRange(); r.selectNodeContents($(b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy"); }
      b.textContent = "Copied ✓"; setTimeout(() => { b.textContent = "Copy"; }, 1600);
    });
    renderPayPick();
  }

  renderDrinks();
  load();
  // Installable app: works offline enough to open, and lets Android install it (not inside Telegram).
  if (!initData && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
</script>
</body></html>`;
}

// One-pager for coffee shops, business style in the original brand colors (cream, coffee brown, gold;
// Cormorant Garamond + Figtree). A4: beach-coffee-onepager-business-en.pdf and .png
// Run: cd design/onepager && NODE_PATH=$(npm root -g) node build-business.mjs <path to qr svg>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";
import { WEB3_SHOTS } from "../../telegram-bot/src/web3shots.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const qr = readFileSync(process.argv[2], "utf8").replaceAll("#071110", "#4e3018");
const wm = WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#4e3018"');
const shot = k => `data:image/webp;base64,${WEB3_SHOTS[k]}`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Figtree:wght@400;500;600;700&display=swap">
<style>
@page { size: A4; margin: 0; }
:root { --paper: #f8eedf; --cream: #f1dfc6; --sand: #edd5b9; --ink: #3a2414; --brown: #4e3018; --mid: #7a5a42; --soft: #9a7d64; --gold: #b8935a; --line: rgba(78,48,24,.18); }
* { box-sizing: border-box; } html, body { margin: 0; }
body { width: 794px; height: 1123px; overflow: hidden; background: var(--paper); color: var(--ink); font: 400 11px/1.5 Figtree, sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { height: 100%; display: flex; flex-direction: column; }
.page > * { flex-shrink: 0; }
.band { background: var(--brown); color: var(--sand); padding: 30px 44px 26px; display: grid; grid-template-columns: 1fr 210px; gap: 24px; position: relative; overflow: hidden; }
.band .wm svg { height: 30px; width: auto; display: block; }
.band .wm svg path { fill: var(--sand); }
.kicker { margin-top: 22px; font: 600 9.5px/1 Figtree; letter-spacing: .26em; text-transform: uppercase; color: var(--gold); }
h1 { margin: 10px 0 0; font: 600 44px/1 "Cormorant Garamond", serif; color: #f8eedf; letter-spacing: -.005em; }
h1 i { color: var(--sand); font-style: italic; }
.band p { margin: 12px 0 0; font-size: 12.3px; line-height: 1.5; color: rgba(241,223,198,.86); max-width: 470px; }
.band p b { color: #f8eedf; font-weight: 600; }
.phones { position: relative; }
.phones img { position: absolute; width: 100px; border-radius: 13px; border: 3px solid #2a1a0e; box-shadow: 0 14px 30px rgba(0,0,0,.35); }
.phones .a { left: 4px; top: 22px; transform: rotate(-5deg); } .phones .b { right: 4px; top: 4px; transform: rotate(4deg); }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--cream); border-bottom: 1px solid var(--line); }
.stats div { padding: 14px 18px 13px 44px; } .stats div + div { border-left: 1px solid var(--line); padding-left: 18px; }
.stats b { display: block; font: 700 28px/1 "Cormorant Garamond", serif; color: var(--brown); font-variant-numeric: lining-nums; }
.stats span { display: block; margin-top: 4px; font-size: 10px; color: var(--mid); line-height: 1.3; }
.body { padding: 4px 44px 0; }
.case { padding: 8px 44px; font: 600 8.5px/1 Figtree; letter-spacing: .2em; color: var(--soft); text-transform: uppercase; border-bottom: 1px solid var(--line); }
h2 { margin: 18px 0 10px; display: flex; align-items: baseline; gap: 12px; font: 600 20px/1 "Cormorant Garamond", serif; color: var(--brown); }
h2 .n { font: 600 9px/1 Figtree; letter-spacing: .22em; color: var(--gold); }
h2::after { content: ""; flex: 1; height: 1px; background: var(--line); transform: translateY(-4px); }
.flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 2px solid var(--brown); }
.step { padding: 9px 12px 0 0; } .step + .step { padding-left: 12px; border-left: 1px solid var(--line); }
.step em { font: 600 8.5px/1 Figtree; font-style: normal; letter-spacing: .2em; color: var(--gold); }
.step b { display: block; margin: 5px 0 3px; font: 600 15px/1.1 "Cormorant Garamond", serif; color: var(--brown); }
.step span { font-size: 10.3px; color: var(--mid); line-height: 1.4; display: block; }
.mods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.mod { padding: 10px 14px 10px 0; border-bottom: 1px solid var(--line); }
.mod:nth-child(3n+2), .mod:nth-child(3n) { padding-left: 14px; border-left: 1px solid var(--line); }
.mod:nth-last-child(-n+3) { border-bottom: 0; }
.mod .t { font: 600 14.5px/1.1 "Cormorant Garamond", serif; color: var(--brown); margin-bottom: 4px; }
.mod p { margin: 0; color: var(--mid); font-size: 10.3px; line-height: 1.42; }
.two { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; }
.box { background: #fffaf2; border: 1px solid var(--line); border-radius: 6px; padding: 13px 16px; }
.box.dark { background: var(--brown); border-color: var(--brown); color: var(--sand); }
.box h3 { margin: 0 0 8px; font: 600 15px/1 "Cormorant Garamond", serif; color: var(--brown); }
.box.dark h3 { color: #f8eedf; }
.box ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.box li { display: grid; grid-template-columns: 12px 1fr; gap: 7px; font-size: 10.6px; line-height: 1.38; color: var(--mid); }
.box.dark li { color: rgba(241,223,198,.85); }
.box li::before { content: ""; width: 6px; height: 6px; margin-top: 5px; border-radius: 50%; background: var(--gold); }
.box li b { color: var(--ink); font-weight: 600; } .box.dark li b { color: #f8eedf; }
.tag { display: inline-block; font: 700 7.5px/1 Figtree; letter-spacing: .14em; padding: 3px 6px; border-radius: 3px; margin-left: 5px; vertical-align: 1px; }
.tag.live { background: var(--brown); color: var(--sand); } .tag.pilot { background: transparent; color: var(--mid); border: 1px solid var(--soft); }
.foot { margin-top: auto; background: var(--cream); border-top: 2px solid var(--brown); padding: 16px 44px 14px; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; }
.foot h3 { margin: 0; font: 600 23px/1.05 "Cormorant Garamond", serif; color: var(--brown); } .foot h3 i { color: var(--gold); }
.foot p { margin: 5px 0 0; color: var(--mid); font-size: 10.8px; }
.contacts { margin-top: 9px; display: flex; gap: 18px; font: 600 10.3px/1 Figtree; color: var(--ink); }
.contacts span { font-size: 8px; letter-spacing: .18em; color: var(--gold); margin-right: 5px; }
.qr { display: flex; gap: 10px; align-items: center; } .qr .q { width: 78px; height: 78px; background: #fffaf2; padding: 6px; border: 1px solid var(--line); border-radius: 6px; }
.qr .q svg { width: 100%; height: 100%; display: block; }
.qr small { width: 82px; font: 500 9px/1.35 Figtree; color: var(--mid); }
.sign { padding: 7px 44px 12px; background: var(--cream); font: 500 8.5px/1 Figtree; color: var(--soft); letter-spacing: .04em; display: flex; justify-content: space-between; }
</style></head><body><div class="page">

<div class="band">
  <div>
    <div class="wm">${wm}</div>
    <div class="kicker">For coffee shops · Ordering, payments & loyalty</div>
    <h1>Your coffee shop, <i>onchain.</i></h1>
    <p>Guests order from their phone and get a ping when it's ready. The barista runs everything from one panel. Tips and merch in <b>USDC on Solana</b> land straight in your wallet, and <b>tokenized loyalty</b> brings people back. Proven for a full month at a live event.</p>
  </div>
  <div class="phones"><img class="a" src="${shot("app")}" alt=""><img class="b" src="${shot("race")}" alt=""></div>
</div>

<div class="stats">
  <div><b>1,500+</b><span>coffees served with the system</span></div>
  <div><b>0 → 94%</b><span>of orders moved to the app in 4 days</span></div>
  <div><b>5 → 0 min</b><span>waiting in line at the bar</span></div>
  <div><b>115</b><span>guests in the coffee race</span></div>
</div>
<div class="case">Case study · Island DAO · Florianópolis, Brazil · Oct–Nov 2026 · drinkbeachcoffee.com/web3</div>

<div class="body">
  <h2><span class="n">01</span>How it works</h2>
  <div class="flow">
    <div class="step"><em>ORDER</em><b>From their seat</b><span>A Telegram Mini App or the installable app. No line, no lost orders.</span></div>
    <div class="step"><em>MAKE</em><b>One barista panel</b><span>App and walk-up orders in a single live queue.</span></div>
    <div class="step"><em>PING</em><b>"Your coffee is ready"</b><span>The guest gets a notification and just picks it up.</span></div>
    <div class="step"><em>PAY</em><b>USDC in seconds</b><span>Tips or merch, from the guest's wallet straight to yours.</span></div>
  </div>

  <h2><span class="n">02</span>The system</h2>
  <div class="mods">
    <div class="mod"><div class="t">Guest app</div><p>Live menu, drink descriptions, milk options, sold-out items, opening hours and the "ready!" ping. Telegram, browser and Seeker.</p></div>
    <div class="mod"><div class="t">Barista panel</div><p>Queue, walk-up orders, stock, per-guest limits, breaks, open and close with one tap.</p></div>
    <div class="mod"><div class="t">Reports & finance</div><p>Cups per day, peak hours, top drinks, costs, income and profit. Recap cards ready for social media.</p></div>
    <div class="mod"><div class="t">USDC on Solana</div><p>Solana Pay: every payment confirmed onchain. Fees in cents, no custody: the money is yours instantly.</p></div>
    <div class="mod"><div class="t">Limited edition</div><p>Sell your coffee in a bag with your own label, in USDC, in the same app. Stock and hand-over in the panel.</p></div>
    <div class="mod"><div class="t">Coffee race</div><p>A live leaderboard of your guests, a 1 USDC daily boost and a Top patrons board. It went viral on X.</p></div>
  </div>

  <h2><span class="n">03</span>Tokenized loyalty</h2>
  <div class="two">
    <div class="box"><h3>Guests who come back</h3><ul>
      <li><span><b>USDC boost</b>: +1 cup in the race, once a day <span class="tag live">LIVE</span></span></li>
      <li><span><b>Top patrons</b>: your biggest supporters get their own board <span class="tag live">LIVE</span></span></li>
      <li><span><b>NFT medals</b> for the top 3 of every season <span class="tag pilot">PILOT</span></span></li>
      <li><span><b>Token points</b>: spend USDC, earn your community's points, with Giants <span class="tag pilot">PILOT</span></span></li>
    </ul></div>
    <div class="box dark"><h3>Why USDC on Solana</h3><ul>
      <li><span><b>Digital dollar</b>: 1 USDC = US$1, no volatility</span></li>
      <li><span><b>Seconds and cents</b> per transaction</span></li>
      <li><span><b>No middleman</b>: straight to your wallet</span></li>
      <li><span><b>Phantom, Solflare</b> and the Seeker phone</span></li>
    </ul></div>
  </div>
</div>

<div class="foot">
  <div><h3>Bring it to <i>your coffee shop.</i></h3>
    <p>We set up your menu, your bot and your wallet, and stay with you through the first weeks.</p>
    <div class="contacts"><div><span>WHATSAPP</span>+55 48 99830-0443</div><div><span>X</span>@BeachCoffeco</div><div><span>WEB</span>drinkbeachcoffee.com/web3</div></div>
  </div>
  <div class="qr"><div class="q">${qr}</div><small>Scan for the full Island DAO case</small></div>
</div>
<div class="sign"><span>Beach Coffee Co. · Florianópolis, Brazil · Built at the counter, by the barista, with AI</span><span>Thanks Island DAO, Giants, Superteam Brasil & Superteam Argentina</span></div>
</div></body></html>`;
writeFileSync(here + "onepager-business-en.html", html);
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
console.log("overflow px:", await p.evaluate(() => { const pg = document.querySelector(".page"); return [...pg.children].reduce((h, c) => h + c.getBoundingClientRect().height, 0) - pg.clientHeight; }));
await p.screenshot({ path: here + "beach-coffee-onepager-business-en.png" });
await p.pdf({ path: here + "beach-coffee-onepager-business-en.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
await b.close();

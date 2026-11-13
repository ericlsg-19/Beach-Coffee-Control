// One-pager for cafés (A4, English): design/onepager/beach-coffee-onepager-en.pdf and .png
// Run: cd design/onepager && NODE_PATH=$(npm root -g) node build-en.mjs <path to qr svg>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";
import { WEB3_SHOTS } from "../../telegram-bot/src/web3shots.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const qr = readFileSync(process.argv[2], "utf8");
const wm = WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"');
const shot = k => `data:image/webp;base64,${WEB3_SHOTS[k]}`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap">
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; } html, body { margin: 0; }
body { width: 794px; height: 1123px; overflow: hidden; color: #eef3ee; font: 400 11.5px/1.45 Figtree, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  background: radial-gradient(700px 520px at 95% -5%, rgba(60,110,85,.35), transparent 60%), radial-gradient(600px 500px at -10% 105%, rgba(30,90,100,.28), transparent 60%), #081210; }
.page { padding: 34px 40px 28px; height: 100%; display: flex; flex-direction: column; }
.page > * { flex-shrink: 0; }
.top { display: flex; justify-content: space-between; align-items: center; }
.top svg { height: 34px; width: auto; display: block; }
.lab { font: 600 10px/1 "JetBrains Mono", monospace; letter-spacing: .2em; color: #a8e6b8; text-transform: uppercase; }
.hero { display: grid; grid-template-columns: 1fr 236px; gap: 22px; margin-top: 22px; }
h1 { margin: 0; font: 900 39px/.95 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; letter-spacing: -.01em; }
h1 b { color: #a8e6b8; font-weight: 900; display: block; }
.lead { margin: 14px 0 0; font-size: 13.5px; line-height: 1.45; color: #c9d6cd; }
.lead b { color: #eef3ee; }
.phones { position: relative; height: 210px; }
.phones img { position: absolute; width: 104px; border-radius: 14px; border: 1px solid rgba(168,230,184,.25); box-shadow: 0 14px 30px rgba(0,0,0,.5); }
.phones .a { left: 8px; top: 8px; transform: rotate(-4deg); }
.phones .b { right: 8px; top: 0; transform: rotate(4deg); }
.stats { margin-top: 18px; display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid rgba(168,230,184,.16); border-radius: 16px; overflow: hidden; }
.stats div { padding: 12px 14px; background: rgba(14,28,24,.75); }
.stats div + div { border-left: 1px solid rgba(168,230,184,.12); }
.stats b { display: block; font: 900 24px/1 Archivo, sans-serif; font-stretch: 125%; color: #e8b86a; }
.stats span { display: block; margin-top: 6px; font-size: 10.5px; color: #9db3a6; line-height: 1.3; }
.case { margin-top: 7px; font: 500 9.5px/1.3 "JetBrains Mono", monospace; color: #7f9a8c; letter-spacing: .03em; }
h2 { margin: 16px 0 9px; font: 800 15px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; letter-spacing: .02em; display: flex; align-items: center; gap: 10px; }
h2 i { font-style: normal; font: 600 9.5px/1 "JetBrains Mono", monospace; letter-spacing: .16em; color: #e8b86a; }
.flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.step { background: rgba(14,28,24,.75); border: 1px solid rgba(168,230,184,.14); border-radius: 12px; padding: 10px 11px; }
.step b { display: block; font-size: 12px; margin-bottom: 3px; }
.step span { color: #9db3a6; font-size: 10.5px; line-height: 1.35; display: block; }
.step em { font-style: normal; font: 600 9px/1 "JetBrains Mono", monospace; color: #a8e6b8; letter-spacing: .1em; display: block; margin-bottom: 6px; }
.mods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.mod { background: rgba(14,28,24,.75); border: 1px solid rgba(168,230,184,.14); border-radius: 12px; padding: 11px 12px; }
.mod .t { font: 800 11.5px/1.15 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; margin-bottom: 5px; display: flex; gap: 7px; align-items: center; }
.mod p { margin: 0; color: #9db3a6; font-size: 10.5px; line-height: 1.38; }
.onchain { display: grid; grid-template-columns: 1.15fr 1fr; gap: 10px; }
.box { border-radius: 14px; padding: 13px 15px; border: 1px solid rgba(232,184,106,.35); background: linear-gradient(135deg, rgba(232,184,106,.10), rgba(14,28,24,.75) 60%); }
.box.mint { border-color: rgba(168,230,184,.3); background: linear-gradient(135deg, rgba(168,230,184,.08), rgba(14,28,24,.75) 60%); }
.box h3 { margin: 0 0 8px; font: 800 12.5px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; }
.box ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.box li { display: grid; grid-template-columns: 14px 1fr; gap: 6px; font-size: 10.8px; line-height: 1.35; color: #c9d6cd; }
.box li b { color: #eef3ee; }
.tag { display: inline-block; font: 600 8.5px/1 "JetBrains Mono", monospace; letter-spacing: .08em; padding: 3px 6px; border-radius: 99px; margin-left: 4px; vertical-align: 1px; }
.tag.live { background: rgba(168,230,184,.16); color: #a8e6b8; } .tag.soon { background: rgba(232,184,106,.16); color: #e8b86a; }
.foot { margin-top: auto; display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; border-top: 1px solid rgba(168,230,184,.14); padding-top: 14px; }
.cta h3 { margin: 0; font: 900 20px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; } .cta h3 b { color: #a8e6b8; }
.cta p { margin: 7px 0 0; color: #c9d6cd; font-size: 11px; }
.contacts { margin-top: 9px; display: flex; flex-wrap: wrap; gap: 6px 16px; font: 500 10.5px/1 "JetBrains Mono", monospace; color: #eef3ee; }
.contacts span { color: #e8b86a; }
.qr { display: flex; gap: 10px; align-items: center; }
.qr div.q { width: 82px; height: 82px; background: #fff; padding: 6px; border-radius: 10px; } .qr div.q svg { width: 100%; height: 100%; display: block; }
.qr small { font: 500 9px/1.35 "JetBrains Mono", monospace; color: #9db3a6; width: 92px; }
.thanks { margin-top: 8px; font-size: 9px; color: #5f7d70; text-align: center; }
</style></head><body><div class="page">
<div class="top">${wm}<div class="lab">For coffee shops · The full system</div></div>

<div class="hero">
  <div>
    <h1>Your coffee shop,<b>onchain.</b></h1>
    <p class="lead">Guests order from their phone and get a ping when it's ready. The barista runs everything from one panel. Tips and merch in <b>USDC on Solana</b> land straight in your wallet, and <b>tokenized loyalty</b> brings people back. All of it has <b>already run for real</b>, for a full month at an event.</p>
  </div>
  <div class="phones"><img class="a" src="${shot("app")}" alt=""><img class="b" src="${shot("race")}" alt=""></div>
</div>

<div class="stats">
  <div><b>1.5k+</b><span>coffees served with the system</span></div>
  <div><b>0→94%</b><span>of orders moved to the app in 4 days</span></div>
  <div><b>5→0 min</b><span>waiting in line at the bar</span></div>
  <div><b>115</b><span>guests in the coffee race</span></div>
</div>
<div class="case">CASE: ISLAND DAO · FLORIANÓPOLIS, BRAZIL · OCT–NOV 2026 · drinkbeachcoffee.com/web3</div>

<h2>How it works <i>4 STEPS</i></h2>
<div class="flow">
  <div class="step"><em>01 · ORDER</em><b>From their seat</b><span>A Telegram Mini App or the installable app. No line, no lost orders.</span></div>
  <div class="step"><em>02 · MAKE</em><b>Barista panel</b><span>App and walk-up orders in one live queue.</span></div>
  <div class="step"><em>03 · PING</em><b>"Your coffee is ready"</b><span>The guest gets a notification and just picks it up.</span></div>
  <div class="step"><em>04 · PAY</em><b>USDC in seconds</b><span>Tips or merch, from the guest's wallet straight to yours.</span></div>
</div>

<h2>The system <i>ALL INCLUDED</i></h2>
<div class="mods">
  <div class="mod"><div class="t">📱 Guest app</div><p>Live menu, drink descriptions, milk options, sold-out items, opening hours and the "ready!" ping. Telegram, browser and Seeker.</p></div>
  <div class="mod"><div class="t">☕ Barista panel</div><p>Queue, walk-up orders, stock, per-guest limits, lunch break, open and close with one tap.</p></div>
  <div class="mod"><div class="t">📊 Reports and finance</div><p>Cups per day, peak hours, top drinks, costs, income and profit. Recap cards ready for social media.</p></div>
  <div class="mod"><div class="t">💸 USDC on Solana</div><p>Solana Pay: every payment confirmed onchain. Fees in cents, no custody: the money is yours instantly.</p></div>
  <div class="mod"><div class="t">🛍️ Limited edition</div><p>Sell your coffee in a bag with your own label, in USDC, in the same app. Stock and hand-over in the panel.</p></div>
  <div class="mod"><div class="t">🏆 Coffee race</div><p>A live leaderboard of your guests, a 1 USDC daily boost and a Top patrons board. It went viral on X.</p></div>
</div>

<h2>Tokenized loyalty <i>ONCHAIN</i></h2>
<div class="onchain">
  <div class="box"><h3>Guests who come back</h3><ul>
    <li>⚡<span><b>USDC boost</b>: +1 cup in the race, once a day <span class="tag live">LIVE</span></span></li>
    <li>💛<span><b>Top patrons</b>: your biggest supporters get their own board <span class="tag live">LIVE</span></span></li>
    <li>🏅<span><b>NFT medals</b> for the top 3 of every season <span class="tag soon">PILOT</span></span></li>
    <li>🪙<span><b>Token points</b>: spend USDC, earn your community's points, with Giants <span class="tag soon">PILOT</span></span></li>
  </ul></div>
  <div class="box mint"><h3>Why USDC on Solana</h3><ul>
    <li>✓<span><b>Digital dollar</b>: 1 USDC = US$1, no volatility</span></li>
    <li>✓<span><b>Seconds and cents</b> per transaction</span></li>
    <li>✓<span><b>No middleman</b>: straight to your wallet</span></li>
    <li>✓<span><b>Phantom, Solflare</b> and the Seeker phone</span></li>
  </ul></div>
</div>

<div class="foot">
  <div class="cta"><h3>Bring it to <b>your coffee shop?</b></h3>
    <p>We set up your menu, your bot and your wallet, and stay with you through the first weeks.</p>
    <div class="contacts"><div><span>WhatsApp</span> +55 48 99830-0443</div><div><span>X</span> @BeachCoffeco</div><div><span>Web</span> drinkbeachcoffee.com/web3</div></div>
  </div>
  <div class="qr"><div class="q">${qr}</div><small>See the full Island DAO case</small></div>
</div>
<div class="thanks">Beach Coffee Co. · Florianópolis, Brazil · Built at the counter, by the barista, with AI · Thanks Island DAO, Giants, Superteam Brasil and Superteam Argentina</div>
</div></body></html>`;
writeFileSync(here + "onepager-en.html", html);
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
const over = await p.evaluate(() => { const pg = document.querySelector(".page"); return pg.scrollHeight - pg.clientHeight; });
console.log("overflow px:", over);
await p.screenshot({ path: here + "beach-coffee-onepager-en.png" });
await p.pdf({ path: here + "beach-coffee-onepager-en.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
await b.close();

// One-pager for coffee shops, business style in the original brand colors (cream, coffee brown, gold;
// Cormorant Garamond + Figtree). A4: beach-coffee-onepager-business-en.pdf and .png
// Run: cd design/onepager && NODE_PATH=$(npm root -g) node build-business.mjs <path to qr svg>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";
import { WEB3_SHOTS } from "../../telegram-bot/src/web3shots.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const qr = readFileSync(process.argv[2], "utf8").replaceAll("#071110", "#173a30");
const wm = WORDMARK_SVG;
const shot = k => `data:image/webp;base64,${WEB3_SHOTS[k]}`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Figtree:wght@400;500;600;700&display=swap">
<style>
@page { size: A4; margin: 0; }
:root { --paper: #f4f6f1; --cream: #e6efe6; --sand: #d9eedd; --ink: #0f241e; --brown: #173a30; --mid: #4d6a5d; --soft: #7d978a; --gold: #b98d45; --mint: #9fdcb0; --line: rgba(23,58,48,.16); }
* { box-sizing: border-box; } html, body { margin: 0; }
body { width: 794px; height: 1123px; overflow: hidden; background: var(--paper); color: var(--ink); font: 400 11px/1.5 Figtree, sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { height: 100%; display: flex; flex-direction: column; }
.page > * { flex-shrink: 0; }
.band { background: radial-gradient(420px 300px at 92% 0%, #2a5546 0%, transparent 70%), var(--brown); color: var(--sand); padding: 26px 44px 20px; display: grid; grid-template-columns: 1fr 200px; gap: 24px; position: relative; overflow: hidden; }
.band .wm svg { height: 30px; width: auto; display: block; }
.band .wm svg path { fill: var(--sand); }
.kicker { margin-top: 18px; font: 600 9.5px/1 Figtree; letter-spacing: .26em; text-transform: uppercase; color: var(--gold); }
h1 { margin: 10px 0 0; font: 600 37px/1.02 "Cormorant Garamond", serif; color: #f4f6f1; letter-spacing: -.005em; }
h1 i { color: var(--mint); font-style: italic; }
.band p { margin: 12px 0 0; font-size: 12.2px; line-height: 1.5; color: rgba(230,239,230,.85); max-width: 470px; }
.band p b { color: #f4f6f1; font-weight: 600; }
.phones { position: relative; }
.phones img { position: absolute; width: 100px; border-radius: 13px; border: 3px solid #0b1f19; box-shadow: 0 14px 30px rgba(0,0,0,.35); }
.phones .a { left: 4px; top: 22px; transform: rotate(-5deg); } .phones .b { right: 4px; top: 4px; transform: rotate(4deg); }
.results { background: var(--cream); padding: 12px 44px 0; font: 700 9px/1.3 Figtree; letter-spacing: .2em; text-transform: uppercase; color: var(--brown); }
.results span { font-weight: 500; letter-spacing: .04em; text-transform: none; font-size: 10.5px; color: var(--mid); margin-left: 6px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--cream); border-bottom: 1px solid var(--line); }
.stats div { padding: 8px 16px 14px 44px; } .stats div:last-child { padding-right: 40px; } .stats div + div { border-left: 1px solid var(--line); padding-left: 18px; }
.stats b { display: block; font: 700 28px/1 "Cormorant Garamond", serif; color: var(--brown); font-variant-numeric: lining-nums; }
.stats span { display: block; margin-top: 4px; font-size: 10.4px; color: var(--ink); line-height: 1.35; }
.stats small { display: block; margin-top: 2px; font-size: 9.4px; color: var(--mid); line-height: 1.3; }
.body { padding: 4px 44px 0; }
.case { padding: 7px 44px; font: 600 8.5px/1 Figtree; letter-spacing: .2em; color: var(--soft); text-transform: uppercase; border-bottom: 1px solid var(--line); }
h2 { margin: 13px 0 8px; display: flex; align-items: baseline; gap: 12px; font: 600 20px/1 "Cormorant Garamond", serif; color: var(--brown); }
h2 .n { font: 600 9px/1 Figtree; letter-spacing: .22em; color: var(--gold); }
h2::after { content: ""; flex: 1; height: 1px; background: var(--line); transform: translateY(-4px); }
.flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 2px solid var(--brown); }
.step { padding: 9px 12px 0 0; } .step + .step { padding-left: 12px; border-left: 1px solid var(--line); }
.step em { font: 600 8.5px/1 Figtree; font-style: normal; letter-spacing: .2em; color: var(--gold); }
.step b { display: block; margin: 5px 0 3px; font: 600 15px/1.1 "Cormorant Garamond", serif; color: var(--brown); }
.step span { font-size: 10.3px; color: var(--mid); line-height: 1.4; display: block; }
.mods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.mod { padding: 8px 14px 8px 0; border-bottom: 1px solid var(--line); }
.mod:nth-child(3n+2), .mod:nth-child(3n) { padding-left: 14px; border-left: 1px solid var(--line); }
.mod:nth-last-child(-n+3) { border-bottom: 0; }
.mod .t { font: 600 14.5px/1.1 "Cormorant Garamond", serif; color: var(--brown); margin-bottom: 4px; }
.mod p { margin: 0; color: var(--mid); font-size: 10.2px; line-height: 1.38; }
.two { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; }
.box { background: #fbfcf9; border: 1px solid var(--line); border-radius: 6px; padding: 13px 16px; }
.box.dark { background: var(--brown); border-color: var(--brown); color: var(--sand); }
.box h3 { margin: 0 0 8px; font: 600 15px/1 "Cormorant Garamond", serif; color: var(--brown); }
.box.dark h3 { color: #f4f6f1; }
.box ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; }
.box li { display: grid; grid-template-columns: 12px 1fr; gap: 7px; font-size: 10.4px; line-height: 1.34; color: var(--mid); }
.box.dark li { color: rgba(230,239,230,.85); }
.box li::before { content: ""; width: 6px; height: 6px; margin-top: 5px; border-radius: 50%; background: var(--gold); }
.box li b { color: var(--ink); font-weight: 600; } .box.dark li b { color: #f4f6f1; }
.tag { display: inline-block; font: 700 7.5px/1 Figtree; letter-spacing: .14em; padding: 3px 6px; border-radius: 3px; margin-left: 5px; vertical-align: 1px; }
.tag.live { background: var(--brown); color: var(--sand); } .tag.pilot { background: transparent; color: var(--mid); border: 1px solid var(--soft); }
.foot { margin-top: auto; background: var(--cream); border-top: 2px solid var(--brown); padding: 13px 44px 11px; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; }
.foot h3 { margin: 0; font: 600 23px/1.05 "Cormorant Garamond", serif; color: var(--brown); } .foot h3 i { color: var(--gold); }
.foot p { margin: 5px 0 0; color: var(--mid); font-size: 10.8px; }
.contacts { margin-top: 9px; display: flex; gap: 18px; font: 600 10.3px/1 Figtree; color: var(--ink); }
.contacts span { font-size: 8px; letter-spacing: .18em; color: var(--gold); margin-right: 5px; }
.qr { display: flex; gap: 10px; align-items: center; } .qr .q { width: 78px; height: 78px; background: #fbfcf9; padding: 6px; border: 1px solid var(--line); border-radius: 6px; }
.qr .q svg { width: 100%; height: 100%; display: block; }
.qr small { width: 82px; font: 500 9px/1.35 Figtree; color: var(--mid); }
.sign { padding: 5px 44px 10px; background: var(--cream); font: 500 8.5px/1 Figtree; color: var(--soft); letter-spacing: .04em; display: flex; justify-content: space-between; }
</style></head><body><div class="page">

<div class="band">
  <div>
    <div class="wm">${wm}</div>
    <div class="kicker">For coffee shops · Orders, payments & loyalty</div>
    <h1>Your coffee shop, <i>without the line.</i></h1>
    <p>Customers order from their table on their phone and get a message when the coffee is ready. Your barista sees every order on one screen. Tips and products can be paid in <b>USDC, a digital dollar</b>, straight to you, and a <b>loyalty game with digital rewards</b> keeps customers coming back.</p>
  </div>
  <div class="phones"><img class="a" src="${shot("app")}" alt=""><img class="b" src="${shot("race")}" alt=""></div>
</div>

<div class="results">Real results<span>One month running the coffee bar at Island DAO, a tech event in Florianópolis, Brazil (Oct–Nov 2026)</span></div>
<div class="stats">
  <div><b>1,500+</b><span>coffees served in one month</span></div>
  <div><b>94%</b><span>of customers ordered from their phone</span><small>after only 4 days (it started at 0%)</small></div>
  <div><b>0 min</b><span>waiting in line</span><small>it used to be about 5 minutes</small></div>
  <div><b>115</b><span>customers joined the loyalty game</span></div>
</div>
<div class="case">See the full case: drinkbeachcoffee.com/web3</div>

<div class="body">
  <h2><span class="n">01</span>How it works</h2>
  <div class="flow">
    <div class="step"><em>ORDER</em><b>From the table</b><span>On their phone, inside Telegram, a free messaging app like WhatsApp. Nothing to install.</span></div>
    <div class="step"><em>MAKE</em><b>One screen for the barista</b><span>Phone orders and counter orders in one list, in real time.</span></div>
    <div class="step"><em>NOTIFY</em><b>"Your coffee is ready"</b><span>The customer gets a message and comes to pick it up.</span></div>
    <div class="step"><em>PAY</em><b>Tips in digital dollars</b><span>Customers tip or buy products in USDC. It reaches you in seconds.</span></div>
  </div>

  <h2><span class="n">02</span>What you get</h2>
  <div class="mods">
    <div class="mod"><div class="t">Customer app</div><p>Your live menu with descriptions, milk options, sold-out items and opening hours. In Telegram, any browser, or as a phone app.</p></div>
    <div class="mod"><div class="t">Barista screen</div><p>Order list, counter orders, stock, limits per customer and breaks. Open or close the shop with one tap.</p></div>
    <div class="mod"><div class="t">Reports & finance</div><p>Cups per day, busiest hours, best-selling drinks, costs, income and profit. Ready-made posts for social media.</p></div>
    <div class="mod"><div class="t">Digital-dollar payments</div><p>Payments arrive in seconds and cost cents. No bank or card machine in the middle: the money goes straight to you.</p></div>
    <div class="mod"><div class="t">Your own coffee bag</div><p>Sell your coffee with your shop's label inside the same app, with stock and pick-up control.</p></div>
    <div class="mod"><div class="t">Loyalty game</div><p>A live ranking of your most loyal customers. It made people come back every day, and they shared it on social media.</p></div>
  </div>

  <h2><span class="n">03</span>Loyalty with digital rewards</h2>
  <div class="two">
    <div class="box"><h3>Customers who come back</h3><ul>
      <li><span><b>Extra point</b>: customers pay 1 USDC to move up the ranking, once a day <span class="tag live">LIVE</span></span></li>
      <li><span><b>Top supporters</b>: the biggest tippers get their own board <span class="tag live">LIVE</span></span></li>
      <li><span><b>Collectible digital medals</b> (NFTs) for the top 3 of each season <span class="tag pilot">PILOT</span></span></li>
      <li><span><b>Reward points</b> customers earn when they pay, with our partner Giants <span class="tag pilot">PILOT</span></span></li>
    </ul></div>
    <div class="box dark"><h3>What is USDC?</h3><ul>
      <li><span><b>A digital dollar</b>: 1 USDC is always worth US$1</span></li>
      <li><span><b>Fast and cheap</b>: arrives in seconds, costs cents</span></li>
      <li><span><b>Direct</b>: from the customer's wallet app to yours</span></li>
      <li><span>Runs on <b>Solana</b>, a fast, low-cost payment network</span></li>
    </ul></div>
  </div>
</div>

<div class="foot">
  <div><h3>Bring it to <i>your coffee shop.</i></h3>
    <p>We set up your menu, your ordering app and your payments, and stay with you through the first weeks.</p>
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

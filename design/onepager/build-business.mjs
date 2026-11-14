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
.results { background: var(--cream); border-top: 1px solid var(--line); padding: 12px 44px 0; font: 700 9px/1.3 Figtree; letter-spacing: .2em; text-transform: uppercase; color: var(--brown); }
.results span { font-weight: 500; letter-spacing: .04em; text-transform: none; font-size: 10.5px; color: var(--mid); margin-left: 6px; }
.needs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.needs div { background: var(--cream); border-radius: 6px; padding: 10px 12px; }
.needs b { display: block; font: 600 14px/1.1 "Cormorant Garamond", serif; color: var(--brown); margin-bottom: 3px; }
.needs span { font-size: 10.1px; line-height: 1.38; color: var(--mid); display: block; }
.ps { display: grid; grid-template-columns: 1fr 1fr; background: var(--paper); }
.ps > div { padding: 14px 44px 14px; } .ps > div + div { border-left: 1px solid var(--line); padding-left: 22px; background: #fbfcf9; }
.ps > div:first-child { padding-right: 22px; }
.lbl { font: 700 9px/1 Figtree; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
.ps ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 5px; }
.ps li { position: relative; padding-left: 14px; font-size: 10.6px; line-height: 1.38; color: var(--mid); }
.ps li::before { content: ""; position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
.ps > div + div li::before { background: var(--brown); }
.ps li b { color: var(--ink); font-weight: 600; }
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
.mod p { margin: 0; color: var(--mid); font-size: 10.2px; line-height: 1.4; }
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
    <div class="kicker">Proposal for coffee shops · Ordering, payments & loyalty</div>
    <h1>Your coffee shop, <i>without the line.</i></h1>
    <p>A complete ordering, payment and loyalty system for your shop. Customers order from their table, your team works from one screen, and every visit becomes data you can use to bring customers back. Proven in a month of real, high-volume service.</p>
  </div>
  <div class="phones"><img class="a" src="${shot("app")}" alt=""><img class="b" src="${shot("race")}" alt=""></div>
</div>

<div class="ps">
  <div><div class="lbl">The challenge</div><ul>
    <li><b>Peak-hour lines</b> that make customers wait, or walk away.</li>
    <li><b>Orders lost or mixed up</b> when everyone arrives at once.</li>
    <li><b>No customer data</b>: you don't know who your regulars are, or how to bring them back.</li>
  </ul></div>
  <div><div class="lbl">Our solution</div><ul>
    <li><b>Order from the table</b>: customers order on their phone and get a message when it's ready.</li>
    <li><b>One screen for your team</b>: phone and counter orders in a single, live list.</li>
    <li><b>Loyalty and payments built in</b>: rankings, rewards and payments in digital dollars.</li>
  </ul></div>
</div>

<div class="results">Proven results<span>Case study: one month running the coffee bar at Island DAO, a tech event in Florianópolis, Brazil</span></div>
<div class="stats">
  <div><b>1,500+</b><span>coffees served in one month</span></div>
  <div><b>100%</b><span>of orders placed through the app by the end of the month</span></div>
  <div><b>5 → 0 min</b><span>waiting time in line at peak hours</span></div>
  <div><b>115</b><span>customers active in the loyalty program</span></div>
</div>

<div class="body">
  <h2><span class="n">01</span>What we implement in your shop</h2>
  <div class="mods">
    <div class="mod"><div class="t">Customer ordering app</div><p>Your menu, with your brand, on the customer's phone: drinks, options, sold-out items and opening hours. Inside Telegram, a free messaging app like WhatsApp: nothing to install.</p></div>
    <div class="mod"><div class="t">Staff order screen</div><p>Every order in one live list, from phones and from the counter. Stock, limits per customer and opening hours, managed with one tap.</p></div>
    <div class="mod"><div class="t">Reports & finance</div><p>Sales per day, busiest hours, best-selling drinks, costs, income and profit, plus ready-made posts for your social media.</p></div>
    <div class="mod"><div class="t">Loyalty program</div><p>A live ranking of your best customers, a board for your top supporters, collectible digital medals and reward points that bring customers back.</p></div>
    <div class="mod"><div class="t">Digital-dollar payments</div><p>Tips and products paid in USDC, a digital dollar (1 USDC = US$1). It arrives in seconds, costs cents and goes straight to your account.</p></div>
    <div class="mod"><div class="t">Your own product line</div><p>Sell your coffee beans with your shop's label inside the same app, with stock and pick-up control at the counter.</p></div>
  </div>

  <h2><span class="n">02</span>How we roll it out</h2>
  <div class="flow">
    <div class="step"><em>STEP 1</em><b>Setup</b><span>We configure your menu, brand, opening hours and payments.</span></div>
    <div class="step"><em>STEP 2</em><b>In-store launch</b><span>QR codes on tables and at the counter, and a walkthrough for your team.</span></div>
    <div class="step"><em>STEP 3</em><b>First weeks</b><span>We follow every day of service with you and adjust what's needed.</span></div>
    <div class="step"><em>STEP 4</em><b>Grow</b><span>Monthly reports and loyalty campaigns to bring customers back.</span></div>
  </div>

  <h2><span class="n">03</span>What you need</h2>
  <div class="needs">
    <div><b>A phone or tablet</b><span>at the counter, for the staff order screen. It runs in the browser.</span></div>
    <div><b>Your menu</b><span>drinks, options and opening hours. We set it up for you.</span></div>
    <div><b>A digital wallet</b><span>to receive payments in digital dollars. We help you create it.</span></div>
    <div><b>Nothing for customers</b><span>they use the phone they already have. No app to download.</span></div>
  </div>
</div>

<div class="foot">
  <div><h3>Let's bring it to <i>your shop.</i></h3>
    <p>Book a 20-minute demo and see the system running with your own menu.</p>
    <div class="contacts"><div><span>WHATSAPP</span>+55 48 99830-0443</div><div><span>X</span>@BeachCoffeco</div><div><span>WEB</span>drinkbeachcoffee.com/web3</div></div>
  </div>
  <div class="qr"><div class="q">${qr}</div><small>Scan to see the full case study</small></div>
</div>
<div class="sign"><span>Beach Coffee Co. · Florianópolis, Brazil</span><span>drinkbeachcoffee.com</span></div>
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

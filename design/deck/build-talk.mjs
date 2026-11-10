import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(process.env.NODE_PATH + "/");
const { chromium } = require("playwright");
const R = "/home/user/Beach-Coffee-Control/", SP = process.argv[2], IMG = process.argv[3];
const b64 = (p, t = "image/png") => `data:${t};base64,${readFileSync(p).toString("base64")}`;
const wm = readFileSync(R + "design/instagram/wordmark-cream.svg", "utf8").replace("<svg", '<svg style="width:100%;height:auto;display:block"');
const font = b64(SP + "/node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2", "font/woff2");
const img = { menu: b64(R + "design/screenshots/miniapp-menu.png"), panel: b64(R + "design/screenshots/panel-main.png"), tip: b64(R + "design/screenshots/miniapp-tip-and-bag.png"),
  flow: b64(R + "design/screenshots/tip-and-bag-flow.png"), race: b64(R + "design/screenshots/race-1-board.png"), banner: b64(R + "design/app/banner-1200x600.png"),
  medal: b64(R + "design/medals/medal-1-gold.png"), qr: b64(R + "design/banner/bot-qr.png"), rank: b64(IMG + "/27.png"), xpost: b64(IMG + "/28.png") };
const head = (label) => `<div class="top"><div class="wm">${wm}</div><div class="lab">${label}</div></div>`;
const phone = (src, h = 760, pos = "top") => `<div class="phone" style="height:${h}px"><img src="${src}" style="object-position:${pos}"></div>`;
const slides = [
`<section>${head("THE PROBLEM · WEEK ONE")}
  <h1>EVERYONE WANTS COFFEE<br><b>AT THE SAME TIME.</b></h1>
  <div class="row3">
    <div class="card"><div class="big">5 min</div><p>standing in line every break, instead of building</p></div>
    <div class="card"><div class="big">📢</div><p>orders shouted across the bar, and lost</p></div>
    <div class="card"><div class="big">💸</div><p>nobody carries cash, and our first Solana QR didn't even open in a phone camera</p></div>
  </div></section>`,
`<section>${head("PROOF OF BREW")}
  <h1>BUILT BY THE BARISTA,<br><b>BETWEEN SHIFTS.</b></h1>
  <div class="split"><div class="list">
    <div class="li"><span>🧑‍🍳</span><p><b>No dev team.</b> Built from zero with AI, at the bar.</p></div>
    <div class="li"><span>🚀</span><p><b>Live the same week.</b> Real guests, every day of the event.</p></div>
    <div class="li"><span>🧩</span><p><b>One system.</b> Telegram bot + Mini App, the Âncora barista panel, payments on Solana.</p></div>
  </div><div class="quote">"On the island,<br><b>anyone can build."</b></div></div></section>`,
`<section>${head("TAP. SIP. TIP.")}
  <h1>ORDER FROM YOUR SEAT.<br><b>GET PINGED WHEN READY.</b></h1>
  <div class="phones">
    <div class="pcol">${phone(img.menu, 470)}<p><b>1 · Order</b>drink and milk in the Telegram Mini App</p></div>
    <div class="pcol">${phone(img.panel, 470)}<p><b>2 · Keep building</b>the barista taps Ready, you get a ping</p></div>
    <div class="pcol">${phone(img.tip, 470)}<p><b>3 · Tip, if you like</b>USDC on Solana, straight to the barista</p></div>
  </div></section>`,
`<section>${head("THE ISLAND SAID YES")}
  <h1>0% → 94%<br><b>IN 4 DAYS.</b></h1>
  <div class="split">
    <div class="bars">${[["Mon", 0], ["Tue", 18], ["Wed", 87], ["Fri", 94]].map(([d, v]) => `<div class="bar"><span>${d}</span><div class="track"><div class="fill" style="width:${Math.max(v, 1.5)}%"></div></div><b>${v}%</b></div>`).join("")}<p class="note">share of orders through Telegram</p></div>
    <div class="col2">
      <div class="card"><div class="big">2,000+</div><p>coffees in one month</p></div>
      <div class="card"><div class="big">115</div><p>islanders in the coffee race</p></div>
      <div class="card"><div class="big">5 → 0</div><p>minutes waiting at the bar</p></div>
    </div></div></section>`,
`<section>${head("PAYMENTS ON SOLANA")}
  <h1>USDC IN SECONDS.<br><b>NO CUSTODY.</b></h1>
  <div class="split"><div class="list">
    <div class="li"><span>🔎</span><p><b>Verified onchain.</b> Every checkout carries a Solana Pay reference; the bot finds that exact transaction and checks the full amount arrived.</p></div>
    <div class="li"><span>👛</span><p><b>Any wallet.</b> Solflare, Phantom, or the Seeker's own wallet (Mobile Wallet Adapter).</p></div>
    <div class="li"><span>🪙</span><p><b>Fees in cents.</b> Even a 1 USDC tip makes sense, straight to the bar's wallet.</p></div>
    <div class="li"><span>🛍️</span><p><b>Edition drops.</b> The limited Island DAO coffee bag, sold in the same app.</p></div>
  </div><div class="shot"><img src="${img.flow}"></div></div></section>`,
`<section>${head("THE SURPRISE")}
  <h1>ZERO REWARDS.<br><b>WENT VIRAL.</b></h1>
  <div class="split"><div class="list">
    <div class="li"><span>🏆</span><p><b>Just for fun.</b> A leaderboard with no prize: a "Top coffee lovers" board in the app.</p></div>
    <div class="li"><span>🔥</span><p><b>Then the race started.</b> Islanders tagging each other on X, fighting for #1.</p></div>
    <div class="li"><span>☕</span><p><b>1 cup between the top 4.</b> Nobody wanted to lose.</p></div>
  </div><div class="duo">${phone(img.rank, 540)}${phone(img.xpost, 540)}</div></div></section>`,
`<section>${head("LIVE · THE COFFEE RACE")}
  <h1>CLIMB THE RACE<br><b>FOR 1 USDC.</b></h1>
  <div class="split"><div class="list">
    <div class="li"><span>⚡</span><p><b>Race boost.</b> +1 cup on the board for 1 USDC, once a day, shown as ⚡ next to your name.</p></div>
    <div class="li"><span>💛</span><p><b>Top patrons.</b> Tips get their own board and never move the race.</p></div>
    <div class="li"><span>🏅</span><p><b>Onchain medals.</b> The top 3 get a soulbound medal on Solana.</p></div>
  </div><div class="duo">${phone(img.race, 540)}<div class="medal"><img src="${img.medal}"></div></div></div></section>`,
`<section>${head("SEEKER-READY")}
  <h1>IN THE<br><b>SOLANA dAPP STORE.</b></h1>
  <div class="split"><div class="list">
    <div class="li"><span>📱</span><p><b>Installable app.</b> drinkbeachcoffee.com/app, submitted to the Solana dApp Store.</p></div>
    <div class="li"><span>⚡</span><p><b>One-tap payments.</b> On a Seeker, the phone's own wallet pays through Mobile Wallet Adapter.</p></div>
  </div><div class="shot"><img src="${img.banner}"></div></div></section>`,
"CLOSE",
];
const close = `<section class="close">${head("THANK YOU")}
  <h1 class="huge">COFFEE,<br><b>ONCHAIN.</b></h1>
  <p class="tag">On the island, anyone can build.</p>
  <div class="closerow"><div class="qr"><img src="${img.qr}"></div><div class="links"><p>t.me/BeachCoffeeIslandBot</p><p>drinkbeachcoffee.com/web3</p><p class="thanks">Thanks Island DAO · Giants · Superteam Brasil</p></div></div></section>`;
const css = `@font-face{font-family:Archivo;src:url(${font}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@page{size:20in 11.25in;margin:0}
*{box-sizing:border-box}html,body{margin:0;background:#071110}
section{width:1920px;height:1080px;position:relative;overflow:hidden;page-break-after:always;padding:96px 96px 80px;color:#eef3ee;font-family:'Inter Display',Inter,sans-serif;
  background:radial-gradient(120% 90% at 100% 0%, rgba(60,90,60,.25), transparent 55%),radial-gradient(90% 70% at 0% 100%, rgba(20,60,50,.35), transparent 60%),#081210}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:64px}.wm{width:130px}
.lab{font:600 26px/1 'JetBrains Mono',monospace;letter-spacing:6px;color:#a8e6b8}
h1{margin:0 0 56px;font-family:Archivo;font-stretch:125%;font-weight:900;font-size:92px;line-height:.98;text-transform:uppercase;color:#eef3ee}
h1 b{color:#a8e6b8;font-weight:900}
.card{background:#0c1a17;border:1.5px solid rgba(168,230,184,.16);border-radius:28px;padding:36px 34px}
.card .big{font-family:Archivo;font-stretch:125%;font-weight:900;font-size:76px;color:#e8b86a;line-height:1}
.card p{margin:18px 0 0;font-size:36px;line-height:1.3;color:#eef3ee}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.row3 .card{min-height:420px;padding:48px 40px}.row3 .big{font-size:96px}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:start}
.list{display:grid;gap:22px}.li{display:flex;gap:22px;align-items:flex-start;background:#0c1a17;border:1.5px solid rgba(168,230,184,.16);border-radius:24px;padding:22px 26px}
.li span{font-size:40px;line-height:1}.li p{margin:0;font-size:28px;line-height:1.35;color:#c9d6cd}.li b{color:#eef3ee}
.quote{font-family:Archivo;font-stretch:125%;font-weight:900;font-size:64px;line-height:1.05;text-transform:uppercase;color:#eef3ee;padding:40px;border-left:8px solid #e8b86a}.quote b{color:#e8b86a}
.phones{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}.pcol p{margin:20px 0 0;font-size:28px;color:#c9d6cd;text-align:center}.pcol b{display:block;color:#e8b86a;font-size:32px;margin-bottom:6px}
.phone{border-radius:34px;overflow:hidden;border:2px solid rgba(168,230,184,.2);background:#0c1a17;box-shadow:0 30px 60px rgba(0,0,0,.45)}
.phone img{width:100%;height:auto;display:block}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
.medal{border-radius:34px;overflow:hidden;border:2px solid rgba(232,184,106,.4)}.medal img{width:100%;display:block}
.shot{border-radius:28px;overflow:hidden;border:2px solid rgba(168,230,184,.2);box-shadow:0 30px 60px rgba(0,0,0,.45)}.shot img{width:100%;display:block}
.bars{display:grid;gap:26px}.bar{display:grid;grid-template-columns:90px 1fr 120px;gap:24px;align-items:center;font-size:34px;color:#c9d6cd}
.bar b{font-family:Archivo;font-stretch:125%;font-weight:900;color:#e8b86a;font-size:44px;text-align:right}
.track{height:44px;border-radius:999px;background:#0c1a17;border:1.5px solid rgba(168,230,184,.16);overflow:hidden}.fill{height:100%;background:linear-gradient(90deg,#4fa37a,#a8e6b8);border-radius:999px}
.note{font:500 24px 'JetBrains Mono',monospace;letter-spacing:3px;color:#7f9a8c;margin:6px 0 0}
.col2{display:grid;gap:22px}.col2 .card{padding:26px 30px}.col2 .big{font-size:64px}.col2 p{margin-top:10px;font-size:28px}
.close h1.huge{font-size:150px;margin-bottom:24px}.tag{font-size:44px;color:#e8b86a;margin:0 0 60px;font-weight:600}
.closerow{display:flex;gap:48px;align-items:center}.qr{width:260px;border-radius:24px;overflow:hidden;background:#fff;padding:14px}.qr img{width:100%;display:block}
.links p{margin:0 0 14px;font:600 40px/1.2 'JetBrains Mono',monospace;color:#eef3ee}.links .thanks{font:500 30px Inter,sans-serif;color:#a8e6b8;margin-top:26px}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.filter(s => s !== "CLOSE").join("")}${close}</body></html>`;
writeFileSync(SP + "/talk.html", html);
const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
await p.setContent(html, { waitUntil: "load" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
await p.pdf({ path: SP + "/mine.pdf", width: "20in", height: "11.25in", printBackground: true, preferCSSPageSize: true });
await br.close(); console.log("ok");

// Builds the laptop "scan to order" banner: ../banner/order-banner.html and a 16:9 PNG.
// Run: cd design/templates && NODE_PATH=$(npm root -g) node order-banner.mjs
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import qrcode from "../../telegram-bot/src/vendor/qrcode.mjs";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";

const BOT_URL = "https://t.me/BeachCoffeeIslandBot";
const out = fileURLToPath(new URL("../banner/", import.meta.url));

function qrSvg(text) {
  const qr = qrcode(0, "H");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<svg role="img" aria-label="QR code for ${text}" xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${n + 8} ${n + 8}" shape-rendering="crispEdges"><rect x="-4" y="-4" width="${n + 8}" height="${n + 8}" fill="#f7f3ea"/><path d="${d}" fill="#071110"/></svg>`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scan to order · Beach Coffee Co.</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
:root { --bg:#071110; --card:#0c1a17; --line:rgba(168,230,184,.16); --text:#eef3ee; --muted:#9db3a6; --mint:#a8e6b8; --gold:#e8b86a; --gold-ink:#1d1407; }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: var(--bg); color: var(--text); font-family: Figtree, system-ui, sans-serif; overflow: hidden; }
/* One 16:9 stage scaled to fit any screen. */
.stage { position: absolute; left: 50%; top: 50%; width: 1600px; height: 900px; transform: translate(-50%, -50%) scale(var(--s, 1));
  background: radial-gradient(circle at 88% 12%, #17322b 0%, rgba(7,17,16,0) 55%), radial-gradient(circle at 8% 100%, #10251f 0%, rgba(7,17,16,0) 45%), var(--bg);
  padding: 72px 88px; display: grid; grid-template-columns: 1fr 560px; gap: 80px; align-items: center; }
.brand { display: flex; align-items: center; gap: 22px; }
.brand svg { height: 54px; width: auto; }
.brand span { font-size: 18px; letter-spacing: .32em; color: var(--muted); padding-left: 22px; border-left: 1px solid var(--line); }
.eyebrow { margin: 56px 0 0; font-size: 22px; font-weight: 600; letter-spacing: .32em; text-transform: uppercase; color: var(--gold); }
h1 { margin: 18px 0 0; font: 900 104px/0.96 Archivo, "Arial Black", sans-serif; font-stretch: 125%; text-transform: uppercase; letter-spacing: -.01em; }
h1 em { font-style: normal; color: var(--mint); }
ol { list-style: none; margin: 48px 0 0; padding: 0; display: grid; gap: 22px; }
li { display: flex; align-items: center; gap: 22px; font-size: 30px; line-height: 1.25; color: #c9d6cd; }
li b { color: var(--text); font-weight: 600; }
.n { flex: none; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: var(--card); border: 1px solid var(--line); font: 500 22px/1 "JetBrains Mono", monospace; color: var(--gold); }
.pill { display: inline-block; padding: 4px 16px; border-radius: 999px; background: var(--gold); color: var(--gold-ink); font-weight: 600; }
.qr { background: var(--card); border: 1px solid var(--line); border-radius: 40px; padding: 36px; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,.45); }
.qr svg { display: block; width: 100%; height: auto; border-radius: 22px; }
.qr .scan { margin: 26px 0 0; font: 900 40px/1 Archivo, "Arial Black", sans-serif; font-stretch: 125%; text-transform: uppercase; color: var(--gold); }
.qr .handle { margin: 14px 0 0; font: 500 24px/1 "JetBrains Mono", monospace; color: var(--muted); }
.free { margin: 44px 0 0; font-size: 24px; letter-spacing: .28em; text-transform: uppercase; color: var(--mint); font-weight: 600; }
</style></head>
<body><main class="stage" id="stage">
<section>
  <div class="brand">${WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"')}<span>@ ISLAND DAO</span></div>
  <p class="eyebrow">Live · Floripa</p>
  <h1>What’s your<br><em>coffee?</em></h1>
  <ol>
    <li><span class="n">1</span><span><b>Scan the QR</b> with your phone camera.</span></li>
    <li><span class="n">2</span><span>Tap <b>Start</b>, then <span class="pill">Order ☕</span></span></li>
    <li><span class="n">3</span><span><b>Pick your drink.</b> We’ll ping you when it’s ready.</span></li>
  </ol>
  <p class="free">Drinks are on the house ☕</p>
</section>
<aside class="qr">
  ${qrSvg(BOT_URL)}
  <p class="scan">Scan to order</p>
  <p class="handle">@BeachCoffeeIslandBot</p>
</aside>
</main>
<script>
const fit = () => document.getElementById("stage").style.setProperty("--s", Math.min(innerWidth / 1600, innerHeight / 900));
addEventListener("resize", fit); fit();
</script>
</body></html>
`;

writeFileSync(out + "order-banner.html", html);

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await page.goto("file://" + out + "order-banner.html", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out + "order-banner.png" });
await browser.close();
console.log("wrote", out + "order-banner.html", "and order-banner.png");

// Builds the 16:9 banner and square logo for the Island DAO V5 projects directory:
// ../hackathon/project-banner.png and ../hackathon/project-logo.png.
// Run: cd design/templates && NODE_PATH=$(npm root -g) node project-banner.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = fileURLToPath(new URL("../hackathon/", import.meta.url));
const shot = name => "data:image/png;base64," + readFileSync(here + "../screenshots/" + name).toString("base64");

const banner = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
* { box-sizing: border-box; }
html, body { margin: 0; }
.stage { width: 1600px; height: 900px; overflow: hidden; position: relative; color: #eef3ee; font-family: Figtree, sans-serif;
  background: radial-gradient(circle at 85% 15%, #17322b 0%, rgba(7,17,16,0) 55%), radial-gradient(circle at 5% 100%, #10251f 0%, rgba(7,17,16,0) 45%), #071110;
  padding: 80px 88px; }
.brand { display: flex; align-items: center; gap: 22px; }
.brand svg { height: 54px; width: auto; }
.brand span { font-size: 18px; letter-spacing: .32em; color: #9db3a6; padding-left: 22px; border-left: 1px solid rgba(168,230,184,.16); }
.copy { position: absolute; left: 88px; top: 230px; width: 800px; }
.eyebrow { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: .3em; text-transform: uppercase; color: #e8b86a; }
h1 { margin: 22px 0 0; font: 900 92px/0.98 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; }
h1 em { font-style: normal; color: #a8e6b8; }
.sub { margin: 30px 0 0; font-size: 30px; line-height: 1.35; color: #c9d6cd; }
.tags { margin-top: 40px; display: flex; gap: 12px; flex-wrap: wrap; }
.tags span { padding: 10px 18px; border-radius: 999px; border: 1px solid rgba(168,230,184,.22); background: #0c1a17; font: 500 20px/1 "JetBrains Mono", monospace; color: #a8e6b8; }
.tags span.gold { color: #e8b86a; border-color: rgba(232,184,106,.35); }
.phone { position: absolute; width: 330px; border-radius: 40px; border: 2px solid rgba(168,230,184,.18); overflow: hidden; box-shadow: 0 40px 90px rgba(0,0,0,.55); background: #071110; }
.phone img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
.p1 { left: 930px; top: 130px; height: 700px; transform: rotate(-5deg); }
.p2 { left: 1200px; top: 175px; height: 700px; transform: rotate(4deg); }
</style></head><body><div class="stage">
<div class="brand">${WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"')}<span>@ ISLAND DAO</span></div>
<div class="copy">
  <p class="eyebrow">Live at the Vila · Floripa</p>
  <h1>Coffee on<br>Telegram,<br><em>tips on Solana</em></h1>
  <p class="sub">Order free drinks from a Telegram Mini App. Tip the barista and buy the limited bag in USDC.</p>
  <div class="tags"><span>Telegram Mini App</span><span class="gold">USDC · Solana Pay</span><span>Payments + Commerce</span></div>
</div>
<div class="phone p1"><img src="${shot("miniapp-menu.png")}" alt=""></div>
<div class="phone p2"><img src="${shot("miniapp-tip-and-bag.png")}" alt=""></div>
</div></body></html>`;

const logo = `<!doctype html><html><head><meta charset="utf-8"><style>
html, body { margin: 0; }
.stage { width: 800px; height: 800px; display: grid; place-items: center;
  background: radial-gradient(circle at 75% 20%, #17322b 0%, rgba(7,17,16,0) 60%), #071110; }
.stage svg { width: 620px; height: auto; }
</style></head><body><div class="stage">${WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"')}</div></body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.2 });
await page.setContent(banner, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out + "project-banner.png" });
await page.setViewportSize({ width: 800, height: 800 });
await page.setContent(logo, { waitUntil: "networkidle" });
await page.screenshot({ path: out + "project-logo.png" });
await browser.close();
console.log("wrote", out + "project-banner.png", "and project-logo.png");

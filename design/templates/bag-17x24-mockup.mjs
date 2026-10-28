// Mockup of the 105 × 145 mm sticker on the 17 × 24 cm stand-up pouch (4 cm base): ../sticker/mockup-pacote-17x24.png.
// Run: cd design/templates && NODE_PATH=$(npm root -g) node bag-17x24-mockup.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sticker = "data:image/png;base64," + readFileSync(new URL("../sticker/beach-coffee-sticker-island-80x110.png", import.meta.url)).toString("base64");

// 30 px per cm. Bag 17 × 24 cm; zip at 3.1 cm; the stand-up fold starts around 20 cm.
const cm = 30, W = 17 * cm, H = 24 * cm;
const label = { w: 10.5 * cm, h: 14.5 * cm, top: 4.5 * cm };
const bagX = 140, bagY = 90;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="matte" x1="0" x2="1">
      <stop offset="0" stop-color="#0e0e0e"/><stop offset=".22" stop-color="#1c1c1c"/><stop offset=".5" stop-color="#232323"/>
      <stop offset=".78" stop-color="#191919"/><stop offset="1" stop-color="#0c0c0c"/>
    </linearGradient>
    <linearGradient id="seal" x1="0" x2="1"><stop offset="0" stop-color="#151515"/><stop offset=".5" stop-color="#262626"/><stop offset="1" stop-color="#141414"/></linearGradient>
  </defs>
  <path d="M0 6 Q0 0 6 0 H${W - 6} Q${W} 0 ${W} 6 V${H} H0 Z" fill="url(#matte)"/>
  <rect x="0" y="0" width="${W}" height="${2 * cm}" fill="url(#seal)"/>
  <circle cx="0" cy="${1.5 * cm}" r="7" fill="#efe7dc"/><circle cx="${W}" cy="${1.5 * cm}" r="7" fill="#efe7dc"/>
  <rect x="${0.8 * cm}" y="${3.0 * cm}" width="${W - 1.6 * cm}" height="5" rx="2.5" fill="#080808"/>
  <rect x="${0.8 * cm}" y="${3.0 * cm + 7}" width="${W - 1.6 * cm}" height="3" rx="1.5" fill="#2c2c2c"/>
  <rect x="${0.8 * cm}" y="${2.0 * cm}" width="2" height="${H - 2.0 * cm}" fill="#0a0a0a" opacity=".7"/>
  <rect x="${W - 0.8 * cm - 2}" y="${2.0 * cm}" width="2" height="${H - 2.0 * cm}" fill="#0a0a0a" opacity=".7"/>
  <path d="M${0.8 * cm} ${20 * cm} Q${W / 2} ${23.2 * cm} ${W - 0.8 * cm} ${20 * cm}" fill="none" stroke="#070707" stroke-width="3"/>
  <path d="M${0.8 * cm} ${20 * cm} Q${W / 2} ${23.2 * cm} ${W - 0.8 * cm} ${20 * cm}" fill="none" stroke="#2a2a2a" stroke-width="1" transform="translate(0 3)"/>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;600&display=swap">
<style>
html,body{margin:0}
.stage{width:1080px;height:900px;position:relative;background:#efe7dc;font-family:Figtree,Arial,sans-serif;color:#5a3d12}
.bag{position:absolute;left:${bagX}px;top:${bagY}px;width:${W}px;height:${H}px;filter:drop-shadow(0 30px 40px rgba(60,40,20,.28))}
.label{position:absolute;left:${bagX + (W - label.w) / 2}px;top:${bagY + label.top}px;width:${label.w}px;height:${label.h}px;border-radius:9px;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.dim{position:absolute;font-size:22px;font-weight:600;letter-spacing:.04em;white-space:nowrap}
.line{position:absolute;background:#5a3d12}
.tick{position:absolute;background:#5a3d12}
.note{position:absolute;left:730px;top:300px;width:320px;font-size:21px;line-height:1.45;font-weight:500}
.note b{font-weight:600;display:block;font-size:24px;margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase}
</style></head><body><div class="stage">
<div class="bag">${svg}</div>
<img class="label" src="${sticker}" alt="">

<div class="line" style="left:${bagX}px;top:${bagY + H + 34}px;width:${W}px;height:2px"></div>
<div class="tick" style="left:${bagX}px;top:${bagY + H + 26}px;width:2px;height:18px"></div>
<div class="tick" style="left:${bagX + W - 2}px;top:${bagY + H + 26}px;width:2px;height:18px"></div>
<div class="dim" style="left:${bagX + W / 2 - 34}px;top:${bagY + H + 44}px">17 cm</div>

<div class="line" style="left:${bagX - 40}px;top:${bagY}px;width:2px;height:${H}px"></div>
<div class="tick" style="left:${bagX - 48}px;top:${bagY}px;width:18px;height:2px"></div>
<div class="tick" style="left:${bagX - 48}px;top:${bagY + H - 2}px;width:18px;height:2px"></div>
<div class="dim" style="left:${bagX - 118}px;top:${bagY + H / 2 - 14}px">24 cm</div>

<div class="line" style="left:${bagX + W + 30}px;top:${bagY + label.top}px;width:2px;height:${label.h}px"></div>
<div class="tick" style="left:${bagX + W + 22}px;top:${bagY + label.top}px;width:18px;height:2px"></div>
<div class="tick" style="left:${bagX + W + 22}px;top:${bagY + label.top + label.h - 2}px;width:18px;height:2px"></div>
<div class="line" style="left:${bagX + W + 30}px;top:${bagY}px;width:2px;height:${label.top}px;opacity:.35"></div>

<div class="note"><b>Etiqueta 105 × 145 mm</b>Centralizada, com o topo a 4,5 cm do topo do pacote, logo abaixo do zíper.<br><br>Sobra 1,5 cm embaixo antes da dobra do fundo.<br><br>Arquivo para a gráfica: 111 × 151 mm (3 mm de sangria), cantos arredondados de 3 mm.</div>
</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 900 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: new URL("../sticker/mockup-pacote-17x24.png", import.meta.url).pathname });
await b.close();

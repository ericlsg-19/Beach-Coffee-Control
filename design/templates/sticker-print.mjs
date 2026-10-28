// Print files for the 105 × 145 mm sticker (17 × 24 cm stand-up pouch): PDF with 3 mm bleed (111 × 151 mm) and a 300 dpi PNG.
// Run: cd design/templates && NODE_PATH=$(npm root -g) node sticker-print.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const page = "file://" + fileURLToPath(new URL("sticker-island-105x145.html", import.meta.url));
const out = name => fileURLToPath(new URL("../sticker/" + name, import.meta.url));
const mm = 96 / 25.4, dpi = 300 / 96;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Math.round(111 * mm), height: Math.round(151 * mm) }, deviceScaleFactor: dpi });
await p.goto(page, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: out("beach-coffee-sticker-island-105x145-bleed.pdf"), width: "111mm", height: "151mm", printBackground: true, pageRanges: "1" });
await p.screenshot({ path: out("beach-coffee-sticker-island-105x145-bleed.png"), clip: { x: 0, y: 0, width: 111 * mm, height: 151 * mm } });
await b.close();

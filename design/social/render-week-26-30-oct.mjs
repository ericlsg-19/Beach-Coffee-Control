// Renders week-26-30-oct.html to beach-coffee-week-26-30-oct.png (1600 × 900 at 1.5×, for X).
// Run: cd design/social && NODE_PATH=$(npm root -g) node render-week-26-30-oct.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const here = fileURLToPath(new URL(".", import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto("file://" + here + "week-26-30-oct.html", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: here + "beach-coffee-week-26-30-oct.png" });
await b.close();

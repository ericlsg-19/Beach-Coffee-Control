// Renders last-day-11-nov.html to beach-coffee-last-day-11-nov.png (1600 × 900 at 1.5×, for X).
// Run: cd design/social && NODE_PATH=$(npm root -g) node render-last-day-11-nov.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const here = fileURLToPath(new URL(".", import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto("file://" + here + "last-day-11-nov.html", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: here + "beach-coffee-last-day-11-nov.png" });
await b.close();

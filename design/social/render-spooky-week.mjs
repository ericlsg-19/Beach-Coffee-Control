// Renders spooky-week.html (with spooky-bg.png next to it) to beach-coffee-spooky-week.png, 1350 × 1350 at 2×.
// Run: cd design/social && NODE_PATH=$(npm root -g) node render-spooky-week.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const here = fileURLToPath(new URL(".", import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1350, height: 1350 }, deviceScaleFactor: 2 });
await p.goto("file://" + here + "spooky-week.html", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: here + "beach-coffee-spooky-week.png" });
await b.close();

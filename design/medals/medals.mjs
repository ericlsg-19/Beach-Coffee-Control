// Renders the coffee race medals (1080 × 1080 PNG): gold, silver and bronze for the top 3 of the
// IslandDAO V5 coffee race. Name and cups are filled in when the race closes.
// Run: cd design/medals && NODE_PATH=$(npm root -g) node medals.mjs "Name 1" 21 "Name 2" 20 "Name 3" 19
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const wordmark = readFileSync(new URL("../instagram/wordmark-cream.svg", import.meta.url), "utf8").replace("<svg", '<svg style="width:100%;height:auto;display:block"');
const [n1 = "Champion", c1 = "21", n2 = "Runner-up", c2 = "20", n3 = "Third place", c3 = "19"] = process.argv.slice(2);
const MEDALS = [
  { rank: 1, file: "medal-1-gold.png", title: "Coffee Champion", place: "1st place", name: n1, cups: c1, a: "#f6d47a", b: "#c9962e", c: "#8a6418", glow: "rgba(246,212,122,.35)" },
  { rank: 2, file: "medal-2-silver.png", title: "Coffee Runner-up", place: "2nd place", name: n2, cups: c2, a: "#eef1f2", b: "#b9c1c6", c: "#7c868c", glow: "rgba(220,228,232,.28)" },
  { rank: 3, file: "medal-3-bronze.png", title: "Coffee Podium", place: "3rd place", name: n3, cups: c3, a: "#f0b48a", b: "#b9774a", c: "#7a4a2a", glow: "rgba(240,180,138,.3)" },
];
const cup = `<svg viewBox="0 0 24 24" style="width:150px;height:150px" fill="none" stroke="#2a1a08" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h13v2a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H16M7 8c0-1.5 2-1.5 2-3M11 8c0-1.5 2-1.5 2-3"/></svg>`;
const html = m => `<body style="margin:0;width:1080px;height:1080px;overflow:hidden;font-family:'Arial Black',Arial,sans-serif;color:#eef3ee;
  background:radial-gradient(circle at 76% 18%, #21392f 0%, #11201b 42%, #0a1311 70%, #080f0e 100%);display:flex;flex-direction:column;align-items:center">
  <div style="margin-top:64px;width:260px">${wordmark}</div>
  <div style="margin-top:14px;font:700 26px/1 Arial,sans-serif;letter-spacing:8px;color:#a8e6b8">ISLANDDAO V5 · COFFEE RACE</div>
  <div style="position:relative;margin-top:46px;width:440px;height:440px;border-radius:50%;display:grid;place-items:center;
    background:radial-gradient(circle at 35% 30%, ${m.a} 0%, ${m.b} 55%, ${m.c} 100%);box-shadow:0 0 120px ${m.glow}, inset 0 -18px 40px rgba(0,0,0,.25), inset 0 14px 30px rgba(255,255,255,.35)">
    <div style="position:absolute;inset:26px;border-radius:50%;border:6px solid rgba(255,255,255,.35)"></div>
    <div style="display:grid;justify-items:center;gap:6px">${cup}
      <div style="font:900 120px/1 'Arial Black',sans-serif;color:#2a1a08">#${m.rank}</div></div>
  </div>
  <div style="margin-top:44px;font:900 64px/1 'Arial Black',sans-serif;text-transform:uppercase;color:${m.a}">${m.title}</div>
  <div style="margin-top:20px;font:700 44px/1.1 Arial,sans-serif">${m.name}</div>
  <div style="margin-top:14px;font:600 30px/1 Arial,sans-serif;color:#c9d6cd">${m.place} · ${m.cups} coffees · Nov 2026</div>
</body>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const m of MEDALS) { await p.setContent(html(m)); await p.screenshot({ path: m.file }); }
await b.close(); console.log("ok");

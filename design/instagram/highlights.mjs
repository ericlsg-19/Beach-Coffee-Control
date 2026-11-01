// Instagram highlight covers (1080 × 1920, icon centered for the round crop) + a preview of the three circles.
// Same look as the profile picture: near-black green background, cream line icon.
// Run: cd design/instagram && NODE_PATH=$(npm root -g) node highlights.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const here = fileURLToPath(new URL(".", import.meta.url));
const BG = "#0f1714", INK = "#edd5b9";
const icons = {
  // A cup on its saucer, steam and two sparkles: the bar at events.
  eventos: `<path d="M29 46h38v12a19 19 0 0 1-19 19a19 19 0 0 1-19-19z"/><path d="M67 50h4a7 7 0 0 1 0 14h-5"/><path d="M22 85h56"/>
    <path d="M41 38c-4-5 4-8 0-13M53 38c-4-5 4-8 0-13"/><path d="M20 28v8M16 32h8M80 24v8M76 28h8"/>`,
  // A menu card with a coffee bean on top.
  cardapio: `<rect x="28" y="16" width="44" height="68" rx="5"/><ellipse cx="50" cy="31" rx="6" ry="8" transform="rotate(25 50 31)"/><path d="M47 25c4 3 2 9 6 12"/>
    <path d="M37 49h26M37 58h26M37 67h18"/>`,
  // A calendar with a check: book your date.
  orcamento: `<rect x="22" y="24" width="56" height="54" rx="7"/><path d="M22 40h56M37 17v14M63 17v14"/><path d="M37 59l8 8l17-17"/>`,
};
const page = (svg, w, h) => `<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;background:${BG};display:grid;place-items:center">
<svg viewBox="0 0 100 100" width="600" height="600" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const [name, svg] of Object.entries(icons)) {
  await p.setContent(page(svg, 1080, 1920));
  await p.screenshot({ path: here + `highlight-${name}.png` });
}
// Preview: the three as Instagram shows them, round, with their titles.
const labels = { eventos: "EVENTOS", cardapio: "CARDÁPIO", orcamento: "ORÇAMENTO" };
await p.setViewportSize({ width: 900, height: 360 });
await p.setContent(`<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@500&display=swap"></head>
<body style="margin:0;background:#000;display:flex;gap:60px;justify-content:center;align-items:center;height:360px;font-family:Figtree;color:#fff">
${Object.entries(icons).map(([n, svg]) => `<div style="text-align:center"><div style="width:190px;height:190px;border-radius:50%;border:3px solid #3a3a3a;padding:6px;box-sizing:border-box">
<div style="width:100%;height:100%;border-radius:50%;background:${BG};display:grid;place-items:center"><svg viewBox="0 0 100 100" width="96" height="96" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></div></div>
<div style="margin-top:14px;font-size:22px;letter-spacing:.02em">${labels[n]}</div></div>`).join("")}</body></html>`, { waitUntil: "networkidle" });
await p.screenshot({ path: here + "highlights-preview.png" });
await b.close();

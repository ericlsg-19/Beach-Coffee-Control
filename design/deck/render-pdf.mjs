// Renders the deck (design/deck/slides, the copy of the Slides artifact) to a 1920 × 1080 PDF: design/deck/beach-coffee-pitch.pdf.
// x-icon and x-shape are the Slides editor's own elements; here they become plain SVG. Speaker notes (<aside>) are left out,
// and so are the grey placeholder shapes the editor drops in the middle of a slide (#9aa0a6).
// Run: cd design/deck && NODE_PATH=$(npm root -g) node render-pdf.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const deck = JSON.parse(readFileSync(here + "deck.json", "utf8"));
const dataUri = path => "data:image/png;base64," + readFileSync(new URL(path, import.meta.url)).toString("base64");
const BLOBS = {
  ac28aae1d9e631b6fe1b5e0032361e7c: dataUri("../logo/beach-coffee-logo-badge.png"),
  d9ca6dc20f4d67fb1a3fc7f00f77f0c0: dataUri("../sticker/bag-mockup-transparent.png"),
};
const ICONS = {
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  Warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  CheckCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  Lightning: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
};
const bg = style => (style.match(/background:\s*([^;]+)/) || [])[1] || "#e8b86a";

function slideHtml(id) {
  return readFileSync(`${here}slides/${id}.html`, "utf8")
    .replace(/<aside>[\s\S]*?<\/aside>/g, "")
    .replace(/<x-shape kind="(ellipse|diamond|rect)"[^>]*#9aa0a6[^>]*><\/x-shape>/g, "")
    .replace(/<x-icon name="(\w+)" style="([^"]*)"><\/x-icon>/g, (_, name, style) =>
      `<svg viewBox="0 0 24 24" style="${style};flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">${ICONS[name] || ""}</svg>`)
    .replace(/<x-shape kind="arrow-right" style="([^"]*)"><\/x-shape>/g, (_, style) =>
      `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="${style.replace(/background:[^;]+;?/, "")};flex:none;background:none"><polygon fill="${bg(style)}" points="0,30 60,30 60,0 100,50 60,100 60,70 0,70"/></svg>`)
    .replace(/<x-shape kind="line" style="([^"]*)"><\/x-shape>/g, (_, style) => `<div style="${style}"></div>`)
    .replace(/src="\/_blob\/(\w+)"/g, (_, blob) => `src="${BLOBS[blob] || ""}"`);
}

const fonts = Object.values(deck.faces).map(f => `<link rel="stylesheet" href="${f.href}">`).join("");
const html = `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
@page { size: 1920px 1080px; margin: 0; }
* { margin: 0; box-sizing: border-box; }
html, body { background: #071110; }
section { width: 1920px; height: 1080px; position: relative; overflow: hidden; color: #eef3ee; font-family: Figtree, Arial, sans-serif; break-after: page; }
h1 { font-size: 96px; font-weight: 600; line-height: 1.1; } h2 { font-size: 64px; font-weight: 600; line-height: 1.15; }
h3 { font-size: 44px; font-weight: 600; line-height: 1.2; } p { font-size: 32px; line-height: 1.4; }
</style></head><body>${deck.order.map(slideHtml).join("\n")}</body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: here + "beach-coffee-pitch.pdf", preferCSSPageSize: true, printBackground: true });
const shots = process.argv[2];
if (shots) {
  const sections = await p.$$("section");
  for (const [i, s] of sections.entries()) await s.screenshot({ path: `${shots}/slide-${i + 1}.png` });
}
await b.close();
console.log("wrote beach-coffee-pitch.pdf,", deck.order.length, "slides");

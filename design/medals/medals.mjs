// Renders the coffee race medals (1080 × 1080 PNG) for the top 3 of the IslandDAO V5 coffee race:
// a metallic medal (laurel wreath, engraved rim, embossed coffee cup over waves with the anchor from the
// logo) on an emerald silk ribbon. Vector, drawn here; no AI image.
// Run: cd design/medals && NODE_PATH=$(npm root -g) node medals.mjs "Name 1" 21 "Name 2" 20 "Name 3" 19
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const wordmark = readFileSync(new URL("../instagram/wordmark-cream.svg", import.meta.url), "utf8").replace("<svg", '<svg style="width:100%;height:auto;display:block"');
const [n1 = "Your name", c1 = "21", n2 = "Your name", c2 = "20", n3 = "Your name", c3 = "19"] = process.argv.slice(2);
const MEDALS = [
  { rank: 1, sfx: "ST", file: "medal-1-gold.png", title: "Coffee Champion", name: n1, cups: c1, m: ["#fff6cf", "#f1c95a", "#c4901f", "#7a520a", "#3d2804"], glow: "rgba(241,201,90,.30)" },
  { rank: 2, sfx: "ND", file: "medal-2-silver.png", title: "Coffee Runner-up", name: n2, cups: c2, m: ["#ffffff", "#dde3e7", "#a3adb3", "#5d666c", "#2c3236"], glow: "rgba(221,227,231,.22)" },
  { rank: 3, sfx: "RD", file: "medal-3-bronze.png", title: "Coffee Podium", name: n3, cups: c3, m: ["#ffe2c6", "#e09a62", "#ad6534", "#6b3816", "#341906"], glow: "rgba(224,154,98,.26)" },
];
const CX = 540, CY = 470, R = 262;
const deg = a => a * Math.PI / 180;
const pt = (r, a) => [CX + r * Math.cos(deg(a)), CY + r * Math.sin(deg(a))];

function laurel(side) { // one branch, from the bottom up one side
  let s = "";
  const r = 168, from = side < 0 ? 100 : 80, to = side < 0 ? 228 : -48;
  const n = 11;
  s += `<path d="M ${pt(r, from).join(" ")} A ${r} ${r} 0 0 ${side < 0 ? 1 : 0} ${pt(r, to).join(" ")}" stroke="url(#metalDark)" stroke-width="5" fill="none"/>`;
  for (let i = 0; i < n; i++) {
    const a = from + (to - from) * (i + 0.5) / n;
    for (const out of [-1, 1]) {
      const [x, y] = pt(r + out * 14, a);
      const tangent = a + (side < 0 ? 90 : -90);
      const rot = tangent + out * side * 28;
      s += `<ellipse cx="${x}" cy="${y}" rx="22" ry="8.5" transform="rotate(${rot} ${x} ${y})" fill="url(#leaf)" stroke="url(#metalDark)" stroke-width="1.5"/>`;
    }
  }
  const [bx, by] = pt(r, to);
  s += `<ellipse cx="${bx}" cy="${by}" rx="18" ry="7" transform="rotate(${to + (side < 0 ? 90 : -90)} ${bx} ${by})" fill="url(#leaf)" stroke="url(#metalDark)" stroke-width="1.5"/>`;
  return s;
}
const knurl = () => Array.from({ length: 144 }, (_, i) => {
  const a = i * 2.5, [x1, y1] = pt(R - 14, a), [x2, y2] = pt(R - 2, a);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#metalDark)" stroke-width="2.2" opacity=".55"/>`;
}).join("");
const sparkles = () => [[150, 210, 1], [930, 170, .8], [880, 690, .6], [190, 640, .7], [760, 110, .5], [300, 120, .45], [980, 430, .5], [90, 420, .4]]
  .map(([x, y, k]) => `<path d="M ${x} ${y - 22 * k} Q ${x} ${y} ${x + 22 * k} ${y} Q ${x} ${y} ${x} ${y + 22 * k} Q ${x} ${y} ${x - 22 * k} ${y} Q ${x} ${y} ${x} ${y - 22 * k} Z" fill="#fff6dc" opacity="${.35 + k * .4}"/>`).join("");

function svg(md) {
  const [l, m1, m2, d, dd] = md.m;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#1f4637"/><stop offset=".45" stop-color="#0f2620"/><stop offset="1" stop-color="#050d0b"/></radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${md.glow}"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${l}"/><stop offset=".3" stop-color="${m1}"/><stop offset=".62" stop-color="${m2}"/><stop offset=".85" stop-color="${d}"/><stop offset="1" stop-color="${m1}"/></linearGradient>
    <radialGradient id="face" cx="40%" cy="32%" r="80%"><stop offset="0" stop-color="${l}"/><stop offset=".35" stop-color="${m1}"/><stop offset=".75" stop-color="${m2}"/><stop offset="1" stop-color="${d}"/></radialGradient>
    <linearGradient id="metalDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${d}"/><stop offset="1" stop-color="${dd}"/></linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${m1}"/><stop offset="1" stop-color="${m2}"/></linearGradient>
    <linearGradient id="relief" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${m1}"/></linearGradient>
    <linearGradient id="silk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a3a2c"/><stop offset=".5" stop-color="#14684d"/><stop offset="1" stop-color="#0a3a2c"/></linearGradient>
    <linearGradient id="silkShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,0,0,.45)"/><stop offset=".6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></linearGradient>
    <linearGradient id="banner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a7a5a"/><stop offset="1" stop-color="#0b3d2e"/></linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset=".45" stop-color="rgba(255,255,255,0)"/><stop offset=".5" stop-color="rgba(255,255,255,.45)"/><stop offset=".56" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
    <filter id="emboss" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.5" flood-color="${dd}" flood-opacity=".9"/>
      <feDropShadow dx="0" dy="-1.5" stdDeviation=".6" flood-color="${l}" flood-opacity=".9"/>
    </filter>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#000" flood-opacity=".6"/></filter>
    <path id="arcTop" d="M ${pt(214, 180).join(" ")} A 214 214 0 0 1 ${pt(214, 0).join(" ")}"/>
    <path id="arcBot" d="M ${pt(232, 180).join(" ")} A 232 232 0 0 0 ${pt(232, 0).join(" ")}"/>
    <clipPath id="faceClip"><circle cx="${CX}" cy="${CY}" r="${R - 20}"/></clipPath>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <g opacity=".045">${Array.from({ length: 24 }, (_, i) => `<path d="M ${CX} ${CY} L ${pt(900, i * 15 - 1.6).join(" ")} L ${pt(900, i * 15 + 1.6).join(" ")} Z" fill="#fff4d6"/>`).join("")}</g>
  <circle cx="${CX}" cy="${CY}" r="420" fill="url(#halo)"/>
  ${sparkles()}
  <!-- ribbon -->
  <g filter="url(#drop)">
    <path d="M 330 -10 L 470 -10 L 600 300 L 470 330 Z" fill="url(#silk)"/>
    <path d="M 750 -10 L 610 -10 L 480 300 L 610 330 Z" fill="url(#silk)"/>
    <path d="M 365 -10 L 380 -10 L 515 318 L 500 322 Z" fill="#efe1c8" opacity=".9"/><path d="M 420 -10 L 435 -10 L 560 308 L 545 312 Z" fill="#efe1c8" opacity=".9"/>
    <path d="M 715 -10 L 700 -10 L 565 318 L 580 322 Z" fill="#efe1c8" opacity=".9"/><path d="M 660 -10 L 645 -10 L 520 308 L 535 312 Z" fill="#efe1c8" opacity=".9"/>
    <path d="M 330 -10 L 470 -10 L 600 300 L 470 330 Z M 750 -10 L 610 -10 L 480 300 L 610 330 Z" fill="url(#silkShade)"/>
    <rect x="490" y="186" width="100" height="44" rx="10" fill="url(#rim)" stroke="url(#metalDark)" stroke-width="3"/>
  </g>
  <!-- medal -->
  <g filter="url(#drop)">
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#rim)"/>
    ${knurl()}
    <circle cx="${CX}" cy="${CY}" r="${R - 18}" fill="none" stroke="${dd}" stroke-opacity=".6" stroke-width="4"/>
    <circle cx="${CX}" cy="${CY}" r="${R - 22}" fill="url(#face)"/>
    <circle cx="${CX}" cy="${CY}" r="${R - 22}" fill="none" stroke="${l}" stroke-opacity=".7" stroke-width="2"/>
    <circle cx="${CX}" cy="${CY}" r="192" fill="none" stroke="url(#metalDark)" stroke-width="3" opacity=".7"/>
    <circle cx="${CX}" cy="${CY}" r="196" fill="none" stroke="${l}" stroke-width="1.5" opacity=".7"/>
    <g filter="url(#emboss)" font-family="Caladea, 'Bitstream Charter', serif" font-weight="700" letter-spacing="7" fill="${d}">
      <text font-size="29"><textPath href="#arcTop" startOffset="50%" text-anchor="middle">ISLANDDAO V5 · COFFEE RACE</textPath></text>
      <text font-size="25"><textPath href="#arcBot" startOffset="50%" text-anchor="middle">FLORIANÓPOLIS · NOVEMBER 2026</textPath></text>
    </g>
    <g filter="url(#emboss)">${laurel(-1)}${laurel(1)}</g>
    <!-- emblem: steam, cup, waves, anchor, rank -->
    <g filter="url(#emboss)" fill="none" stroke="url(#metalDark)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 512 338 c -14 -16 14 -22 0 -40 M 540 332 c -14 -16 14 -22 0 -40 M 568 338 c -14 -16 14 -22 0 -40" stroke-width="6"/>
      <path d="M 478 356 h 124 v 18 a 50 50 0 0 1 -50 50 h -24 a 50 50 0 0 1 -50 -50 z" fill="url(#relief)" stroke-width="5"/>
      <path d="M 602 368 h 12 a 18 18 0 0 1 0 36 h -16" stroke-width="5"/>
      <path d="M 458 440 h 164" stroke-width="5"/>
      <path d="M 446 466 q 18 -14 36 0 t 36 0 t 36 0 t 36 0 t 36 0" stroke-width="5"/>
    </g>
    <g filter="url(#emboss)" text-anchor="middle" fill="url(#relief)" stroke="url(#metalDark)" stroke-width="3">
      <text x="${CX - 14}" y="600" font-family="'Inter Display', Inter, sans-serif" font-weight="900" font-size="128">${md.rank}</text>
      <text x="${CX + 40}" y="548" font-family="'Inter Display', Inter, sans-serif" font-weight="800" font-size="36" text-anchor="start">${md.sfx}</text>
    </g>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#shine)" clip-path="url(#faceClip)" opacity=".8"/>
  </g>
  <!-- banner across the bottom of the medal -->
  <g filter="url(#drop)">
    <path d="M 250 722 L 300 700 L 300 772 L 250 794 L 272 758 Z" fill="#0b3d2e"/>
    <path d="M 830 722 L 780 700 L 780 772 L 830 794 L 808 758 Z" fill="#0b3d2e"/>
    <path d="M 292 694 Q 540 742 788 694 L 788 770 Q 540 818 292 770 Z" fill="url(#banner)" stroke="${m1}" stroke-width="3"/>
    <text x="${CX}" y="762" text-anchor="middle" font-family="'Inter Display', Inter, sans-serif" font-weight="900" font-size="38" letter-spacing="5" fill="${l}">${md.title.toUpperCase()}</text>
  </g>
  <text x="${CX}" y="892" text-anchor="middle" font-family="'Inter Display', Inter, sans-serif" font-weight="800" font-size="62" fill="#f4efe4">${md.name}</text>
  <text x="${CX}" y="945" text-anchor="middle" font-family="Inter, sans-serif" font-weight="500" font-size="28" letter-spacing="3" fill="#a8e6b8">${md.cups} COFFEES · ${md.rank}${md.sfx} PLACE · THE COFFEE RACE</text>
</svg>`;
}
const html = md => `<body style="margin:0;width:1080px;height:1080px;overflow:hidden;position:relative">${svg(md)}
  <div style="position:absolute;left:50%;bottom:44px;width:150px;transform:translateX(-50%);opacity:.9">${wordmark}</div></body>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const md of MEDALS) { await p.setContent(html(md)); await p.waitForTimeout(100); await p.screenshot({ path: md.file }); }
await b.close(); console.log("ok");

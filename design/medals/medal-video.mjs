// Records a looping 1080 × 1080 MP4 of each medal spinning in 3D (coin edge, Beach Coffee back side,
// light sweep, twinkling sparkles), with the banner, name and cups fixed below. For the NFT's
// animation_url; the PNG from medals.mjs stays the main image.
// Run: cd design/medals && NODE_PATH=$(npm root -g) node medal-video.mjs "Name 1" 21 "Name 2" 20 "Name 3" 19
import { mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { MEDALS, svg, wordmark } from "./medals.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = fileURLToPath(new URL(".", import.meta.url));
const LOOP = 6; // seconds: 2.4 s still (light sweep), 3 s spin, 0.6 s settle
const names = process.argv.slice(2);
MEDALS.forEach((m, i) => { if (names[i * 2]) m.name = names[i * 2]; if (names[i * 2 + 1]) m.cups = names[i * 2 + 1]; });

const page = md => {
  const [l, m1, m2, d] = md.m;
  const edge = Array.from({ length: 14 }, (_, i) => `<div class="edge" style="transform:translateZ(${(i - 7) * 1.6}px)"></div>`).join("");
  return `<!doctype html><html><head><style>
  html,body{margin:0;width:1080px;height:1080px;overflow:hidden;background:radial-gradient(circle at 50% 40%, #1f4637 0%, #0f2620 45%, #050d0b 100%);font-family:'Inter Display',Inter,sans-serif}
  .halo{position:absolute;left:540px;top:430px;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(circle, ${md.glow} 0%, rgba(0,0,0,0) 62%);animation:breathe ${LOOP}s ease-in-out infinite}
  @keyframes breathe{0%,100%{opacity:.85}50%{opacity:1}}
  .stage{position:absolute;left:540px;top:430px;width:600px;height:600px;margin:-300px 0 0 -300px;perspective:1800px}
  .float{width:100%;height:100%;animation:float ${LOOP}s ease-in-out infinite;transform-style:preserve-3d}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  .coin{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:spin ${LOOP}s cubic-bezier(.45,0,.2,1) infinite}
  @keyframes spin{0%,40%{transform:rotateY(0deg)}90%,100%{transform:rotateY(360deg)}}
  .face{position:absolute;inset:0;backface-visibility:hidden}
  .shadow{position:absolute;left:540px;top:742px;width:420px;height:46px;margin-left:-210px;border-radius:50%;background:radial-gradient(ellipse, rgba(0,0,0,.6), rgba(0,0,0,0) 70%);animation:shad ${LOOP}s ease-in-out infinite}
  @keyframes shad{0%,100%{transform:scaleX(1);opacity:.9}50%{transform:scaleX(.9);opacity:.7}}
  .face.front{transform:translateZ(12px)} .face.back{transform:rotateY(180deg) translateZ(12px)}
  .edge{position:absolute;left:50%;top:50%;width:${(262 / 292) * 600 * 0.97}px;height:${(262 / 292) * 600 * 0.97}px;margin:-${(262 / 292) * 300 * 0.97}px 0 0 -${(262 / 292) * 300 * 0.97}px;backface-visibility:visible;border-radius:50%;background:linear-gradient(90deg, ${d}, ${m2} 30%, ${l} 50%, ${m2} 70%, ${d})}
  .sweep{position:absolute;inset:0;border-radius:50%;overflow:hidden;transform:translateZ(13px);pointer-events:none;backface-visibility:hidden;-webkit-mask:radial-gradient(circle, #000 ${(262 / 292) * 50}%, transparent ${(262 / 292) * 50 + .3}%)}
  .sweep::before{content:"";position:absolute;top:-20%;left:-60%;width:40%;height:140%;transform:rotate(20deg);background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0));animation:sweep ${LOOP}s ease-in-out infinite}
  @keyframes sweep{0%{left:-60%}30%{left:120%}100%{left:120%}}
  .spark{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;animation:tw ${LOOP / 2}s ease-in-out infinite}
  .spark svg{width:100%;height:100%}
  @keyframes tw{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}
  .text{position:absolute;left:0;right:0;text-align:center}
  .banner{top:772px;display:inline-block;white-space:nowrap;left:50%;transform:translateX(-50%);right:auto;padding:16px 48px;border-radius:14px;background:linear-gradient(#1a7a5a,#0b3d2e);border:3px solid ${m1};color:${l};font-weight:900;font-size:38px;letter-spacing:5px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
  .name{top:884px;color:#f4efe4;font-weight:800;font-size:60px}
  .stats{top:962px;color:#a8e6b8;font:500 28px/1 Inter,sans-serif;letter-spacing:3px}
  .wm{position:absolute;left:50%;bottom:30px;width:130px;transform:translateX(-50%);opacity:.85}
  </style></head><body>
  <div class="halo"></div>
  ${[[140, 200, 0], [940, 170, .7], [900, 640, 1.4], [170, 620, 2.1], [770, 90, 1], [300, 110, 2.6], [990, 420, .4], [80, 400, 1.8]].map(([x, y, dl]) =>
    `<div class="spark" style="left:${x}px;top:${y}px;animation-delay:-${dl}s"><svg viewBox="-1 -1 2 2"><path d="M0 -1Q0 0 1 0Q0 0 0 1Q0 0 -1 0Q0 0 0 -1Z" fill="#fff6dc"/></svg></div>`).join("")}
  <div class="shadow"></div>
  <div class="stage"><div class="float"><div class="coin">
    ${edge}
    <div class="face back">${svg(md, "back")}</div>
    <div class="face front">${svg(md, "medal")}</div>
    <div class="sweep"></div>
  </div></div></div>
  <div class="text banner">${md.title.toUpperCase()}</div>
  <div class="text name">${md.name}</div>
  <div class="text stats">${md.cups} COFFEES · ${md.rank}${md.sfx} PLACE · THE COFFEE RACE</div>
  <div class="wm">${wordmark}</div>
  </body></html>`;
};

const browser = await chromium.launch();
for (const md of MEDALS) {
  const tmp = here + ".rec-" + md.rank; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1080 }, recordVideo: { dir: tmp, size: { width: 1080, height: 1080 } } });
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.setContent(page(md));
  await p.evaluate(() => document.getAnimations().forEach(a => { a.currentTime = 0; }));
  const start = (Date.now() - t0) / 1000;
  await p.waitForTimeout(LOOP * 1000 + 600);
  const v = p.video(); await ctx.close();
  const out = here + md.file.replace(".png", ".mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", (start + 0.3).toFixed(2), "-t", String(LOOP), "-i", await v.path(), "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", "-an", out]);
  rmSync(tmp, { recursive: true, force: true });
  console.log("wrote", out);
}
await browser.close();

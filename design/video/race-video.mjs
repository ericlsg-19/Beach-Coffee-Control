// Records a vertical (1080 × 1920) video of the coffee race: the ranking, a 1 USDC race boost (+1 cup,
// shown as ⚡), the jump in the ranking, and the Top patrons board. The page is the real miniapp.js;
// Telegram, the API and the payment are faked in the browser.
// Output: design/video/beach-coffee-race.mp4
// Run: cd design/video && NODE_PATH=$(npm root -g) node race-video.mjs
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { miniAppHtml } from "../../telegram-bot/src/miniapp.js";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const worker = readFileSync(new URL("../../telegram-bot/src/worker.js", import.meta.url), "utf8");
const drinks = [...worker.matchAll(/\{ id: "([a-z]+)",\s*name: "([^"]+)" \}/g)].map(m => ({ id: m[1], name: m[2] }));
const logo = "data:image/png;base64," + readFileSync(new URL("../app/icon-192.png", import.meta.url)).toString("base64");

const app = miniAppHtml(drinks, { recipient: "WTxV6GDprgz2vHT4gX4ULCexqqaXYKQ8zWpZoYJHz2u", bagPrice: "10", bagStock: 20, bagsLeft: 12 })
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', `<script>
window.Telegram = { WebApp: { initData: "demo", initDataUnsafe: {}, ready(){}, expand(){}, onEvent(){}, offEvent(){}, setHeaderColor(){}, setBackgroundColor(){}, close(){}, openLink(){},
  showConfirm(m, cb){ cb(true); }, showAlert(){}, HapticFeedback: { impactOccurred(){}, selectionChanged(){}, notificationOccurred(){} } } };
const __S = window.__S = { boosted: false, paid: false };
const __race = () => {
  const rows = [["João B.", 21, 0], ["RIK", 20, 1], ["iggynore", 19, 0], ["Lucas G.", 19, 0], ["Ana", 18, __S.paid ? 1 : 0], ["Paloma L.", 17, 0], ["Beau L.", 17, 0], ["Jaspen T.", 15, 0], ["Camila", 15, 0], ["Bernardo N.", 14, 0]];
  rows.sort((a, b) => (b[1] + b[2]) - (a[1] + a[2]) || (a[0] === "Ana" ? -1 : b[0] === "Ana" ? 1 : 0));
  const top = rows.map(([name, drinks, boosts], i) => ({ rank: i + 1, name, drinks, boosts, me: name === "Ana" }));
  const me = top.find(r => r.me);
  return { top, me: { rank: me.rank, drinks: me.drinks, boosts: me.boosts }, total: 114, boostedToday: __S.paid || __S.boosted,
    patrons: [["RIK", 25], ["Lucas G.", 12], ["Paloma L.", 10], ["Ana", 5], ["Tiago", 3]].map(([name, usdc], i) => ({ rank: i + 1, name, usdc, me: name === "Ana" })) };
};
window.fetch = async (path, init) => {
  let r;
  if (path === "/api/session") r = { ok: true, user: { first_name: "Ana" }, open: true, orders: [], event: null, out: [], daily: { max: 3, used: 1 }, ranking: __race() };
  if (path === "/api/pay") { __S.boosted = true; r = { ok: true, payment: { ref: "R", kind: "boost", amount: "1", micro: 1000000, solflare: "#", phantom: "#", page: "#" } }; }
  if (String(path).startsWith("/api/pay/")) r = { ok: true, payment: { ref: "R", kind: "boost", amount: "1", status: __S.paid ? "paid" : "pending" } };
  return { json: async () => r };
};
</script>`);

const W = 1080, H = 1920, SCALE = 1.86, SW = 390, SH = 844;
const stage = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600&display=swap">
<style>
* { box-sizing: border-box; } html, body { margin: 0; }
body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: Figtree, sans-serif; color: #eef3ee;
  background: radial-gradient(circle at 80% 10%, #21392f 0%, rgba(7,17,16,0) 55%), radial-gradient(circle at 10% 95%, #10251f 0%, rgba(7,17,16,0) 45%), #071110; }
.cap { position: absolute; left: 60px; right: 60px; top: 70px; height: 150px; text-align: center; transition: opacity .35s; }
.cap .k { font: 900 54px/1.05 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; color: #a8e6b8; }
.cap .s { margin-top: 14px; font: 500 34px/1.25 Figtree, sans-serif; color: #c9d6cd; }
.phone { position: absolute; left: ${(W - SW * SCALE) / 2 - 16}px; top: 250px; width: ${SW * SCALE + 32}px; height: ${SH * SCALE + 32}px;
  border-radius: 92px; background: #1b1f1e; padding: 16px; box-shadow: 0 40px 120px rgba(0,0,0,.6), inset 0 0 0 3px #2c3331; }
.screen { width: ${SW}px; height: ${SH}px; transform: scale(${SCALE}); transform-origin: 0 0; border-radius: 41px; overflow: hidden; position: relative; background: #071110; }
.bar { height: 56px; display: flex; align-items: center; gap: 10px; padding: 0 16px; background: #0b1614; border-bottom: 1px solid rgba(168,230,184,.12); font-size: 15px; }
.bar img { width: 30px; height: 30px; border-radius: 50%; } .bar b { flex: 1; font-weight: 600; } .bar span { color: #7f9a8c; font-size: 13px; }
iframe { width: ${SW}px; height: ${SH - 56}px; border: 0; display: block; }
.notif { position: absolute; left: 10px; right: 10px; top: -140px; background: rgba(28,36,34,.96); border-radius: 22px; padding: 12px 14px;
  display: flex; gap: 12px; align-items: flex-start; box-shadow: 0 12px 40px rgba(0,0,0,.5); transition: top .45s cubic-bezier(.2,.9,.3,1.2); z-index: 7; }
.notif.on { top: 10px; } .notif img { width: 38px; height: 38px; border-radius: 10px; }
.notif .t { font-size: 13px; color: #9db3a6; } .notif .t b { color: #eef3ee; font-weight: 600; } .notif .m { margin-top: 3px; font-size: 15px; line-height: 1.3; }
.tap { position: absolute; width: 86px; height: 86px; margin: -43px 0 0 -43px; border-radius: 50%; background: rgba(168,230,184,.35);
  border: 4px solid rgba(168,230,184,.9); pointer-events: none; opacity: 0; transform: scale(.4); transition: transform .25s, opacity .25s; z-index: 10; }
.tap.on { opacity: 1; transform: scale(1); }
.end { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 36px; text-align: center; opacity: 0; transition: opacity .6s;
  background: radial-gradient(circle at 50% 35%, #21392f 0%, #071110 65%); z-index: 20; }
.end.on { opacity: 1; } .end svg { height: 120px; width: auto; }
.end h1 { margin: 0; font: 900 104px/1.02 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; } .end h1 b { color: #a8e6b8; }
.end p { margin: 0; font: 600 38px/1.35 Figtree, sans-serif; color: #e8b86a; }
</style></head><body>
<div class="cap" id="cap"><div class="k" id="capK"></div><div class="s" id="capS"></div></div>
<div class="phone"><div class="screen">
  <div class="bar"><img src="${logo}" alt=""><b>Beach Coffee Co.</b><span>mini app</span></div><iframe id="app"></iframe>
  <div class="notif" id="notif"><img src="${logo}" alt=""><div><div class="t"><b>BeachCoffeeBot</b> · now</div>
    <div class="m">⚡ <b>+1 cup in the coffee race!</b><br>You are #3 with 18 ☕ +1⚡</div></div></div>
</div></div>
<div class="tap" id="tap"></div>
<div class="end" id="end">${WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"')}<h1>The coffee<br><b>race.</b></h1><p>☕ every coffee counts · ⚡ one boost a day<br>💛 tips make you a patron</p></div>
</body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const tmp = here + ".rec-race";
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: tmp, size: { width: W, height: H } } });
const page = await ctx.newPage();
const t0 = Date.now();
await page.setContent(stage, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const start = (Date.now() - t0) / 1000;
await page.$eval("#app", (f, html) => { f.srcdoc = html; }, app);
await page.waitForTimeout(400);
const f = await (await page.$("#app")).contentFrame();
await f.waitForSelector('[data-id="latte"]');

const wait = ms => page.waitForTimeout(ms);
const caption = async (k, s = "") => {
  await page.evaluate(([k, s]) => { const c = document.getElementById("cap"); c.style.opacity = 0;
    setTimeout(() => { document.getElementById("capK").textContent = k; document.getElementById("capS").textContent = s; c.style.opacity = 1; }, 300); }, [k, s]);
  await wait(450);
};
const tap = async sel => {
  const el = f.locator(sel).first();
  await el.evaluate(e => e.scrollIntoView({ block: "center", behavior: "smooth" })); await wait(500);
  const box = await el.boundingBox();
  await page.evaluate(([x, y]) => { const t = document.getElementById("tap"); t.style.left = x + "px"; t.style.top = y + "px"; t.classList.add("on"); }, [box.x + box.width / 2, box.y + box.height / 2]);
  await wait(260); await el.evaluate(e => e.click()); await wait(200);
  await page.evaluate(() => document.getElementById("tap").classList.remove("on"));
};
const scroll = async y => { await f.evaluate(y => window.scrollTo({ top: y, behavior: "smooth" }), y); await wait(900); };

await caption("The coffee race", "114 coffee lovers at Island DAO");
await wait(1200);
await tap('[data-tab="rank"]'); await wait(1600);
await caption("You're #5", "One cup off the podium");
await wait(1800);
await caption("Boost: +1 cup", "1 USDC, once a day, shown as ⚡");
await wait(700);
await tap("#raceBoostBtn"); await wait(1400);
await caption("Pay with your wallet", "USDC on Solana, like a tip");
await wait(900);
await tap("#paySolflare"); await wait(1200);
await f.evaluate(() => { window.__S.paid = true; });
await f.waitForSelector("#payDone:not([hidden])", { timeout: 8000 });
await caption("⚡ +1 cup!", "Confirmed onchain in seconds");
await page.evaluate(() => document.getElementById("notif").classList.add("on"));
await wait(2200);
await page.evaluate(() => document.getElementById("notif").classList.remove("on"));
await tap('[data-tab="rank"]'); await wait(900);
await caption("Up to #3", "Everyone sees the ⚡");
await wait(2400);
await tap('[data-board="patrons"]'); await wait(800);
await caption("Top patrons 💛", "Tips get their own board");
await wait(2600);
await page.evaluate(() => document.getElementById("end").classList.add("on"));
await wait(3000);

const video = page.video();
await ctx.close(); await browser.close();
const webm = await video.path();
const out = here + "beach-coffee-race.mp4";
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", start.toFixed(2), "-i", webm, "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out]);
rmSync(tmp, { recursive: true, force: true });
console.log("wrote", out);

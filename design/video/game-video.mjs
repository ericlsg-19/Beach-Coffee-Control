// Records a vertical (1080 × 1920) preview of the bar game in the Mini App, with its motion: the menu
// pops in, order, "Skip the line", boost with points (your cup slides to #1, points fly), the drink is
// ready (+points), Me and Shop. The page is the real miniapp.js; Telegram and the API are faked.
// Output: design/video/beach-coffee-game.mp4
// Run: cd design/video && NODE_PATH=$(npm root -g) node game-video.mjs
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { miniAppHtml } from "../../telegram-bot/src/miniapp.js";
import { GAME } from "../../telegram-bot/src/game.js";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const worker = readFileSync(new URL("../../telegram-bot/src/worker.js", import.meta.url), "utf8");
const drinks = [...worker.matchAll(/\{ id: "([a-z]+)",\s*name: "([^"]+)" \}/g)].map(m => ({ id: m[1], name: m[2] }));
const logo = "data:image/png;base64," + readFileSync(new URL("../app/icon-192.png", import.meta.url)).toString("base64");

const app = miniAppHtml(drinks, { recipient: "WTxV6GDprgz2vHT4gX4ULCexqqaXYKQ8zWpZoYJHz2u", bagPrice: "10", bagStock: 20, bagsLeft: 12 })
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', `<script>
window.Telegram = { WebApp: { initData: "demo", initDataUnsafe: {}, ready(){}, expand(){}, onEvent(){}, offEvent(){}, setHeaderColor(){}, setBackgroundColor(){}, close(){}, openLink(){},
  showConfirm(m, cb){ cb(true); }, showAlert(){}, HapticFeedback: { impactOccurred(){}, selectionChanged(){}, notificationOccurred(){} } } };
const __R = ${JSON.stringify(GAME)};
const __S = window.__S = { points: 245, streak: 3, cupToday: false, rush: null, mine: null,
  queue: [ { num: 21, drink: "latte", boost: 1 }, { num: 19, drink: "cappuccino", boost: 0 }, { num: 20, drink: "americano", boost: 0 }, { num: 23, drink: "mocha", boost: 0 } ],
  log: [ { delta: 24, label: "First coffee of the day · 🔥 2" }, { delta: 34, label: "Boost cashback · 2 USDC" }, { delta: 22, label: "First coffee of the day · 🔥 1" } ],
  shop: [ { id: 1, name: "Beach Coffee sticker pack", points: 60, left: 18 }, { id: 2, name: "Island DAO Edition coffee bag", points: 900, left: 9 } ], ready: false };
const __sorted = () => { const q = [...__S.queue]; const b = q.filter(o => o.boost).sort((a, c) => c.boost - a.boost); const f = q.filter(o => !o.boost); return [...b, ...f]; };
const __game = () => ({ points: __S.points, streak: __S.streak, cupToday: __S.cupToday, rush: __S.rush, rules: __R, log: __S.log, shop: __S.shop,
  queue: __sorted().map((o, i) => ({ ...o, position: i + 1, eta: Math.round((i + 1) * 1.5), mine: o.num === __S.mine, guarded: false })) });
const __orders = () => __S.mine ? [{ num: __S.mine, drink: "flatwhite", status: __S.ready ? "ready" : "pending" }] : [];
window.fetch = async (path, init) => {
  const b = init && init.body ? JSON.parse(init.body) : {}; let r;
  if (path === "/api/session") r = { ok: true, user: { first_name: "Ana" }, open: true, orders: __orders(), event: null, out: [], daily: { max: 3, used: __S.mine ? 1 : 0 },
    ranking: { me: { rank: 4, drinks: 12 }, total: 61, top: [{ rank: 1, name: "Moxie", drinks: 31 }, { rank: 2, name: "Vali", drinks: 27 }, { rank: 3, name: "Tom", drinks: 19 }, { rank: 4, name: "Ana", drinks: 12, me: true }] }, game: __game() };
  if (path === "/api/order") { __S.mine = 24; __S.queue.push({ num: 24, drink: b.drink, boost: 0 }); r = { ok: true, order: { num: 24, drink: b.drink }, orders: __orders() }; }
  if (path === "/api/boost") { const me = __S.queue.find(o => o.num === __S.mine); me.boost += b.amount; __S.points -= Math.round(b.amount * __R.pointsPerUsdc);
    __S.log.unshift({ delta: -Math.round(b.amount * __R.pointsPerUsdc), label: "Boost #24 · " + b.amount + " USDC" }); r = { ok: true, position: 1, points: __S.points }; }
  if (path === "/api/shop") { const it = __S.shop.find(i => i.id === b.item); __S.points -= it.points; it.left -= 1; __S.log.unshift({ delta: -it.points, label: "Shop · " + it.name }); r = { ok: true, points: __S.points }; }
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
    <div class="m">🏝️ <b>Your Flat White is ready!</b><br>🪙 +26 points · 🔥 4-day streak</div></div></div>
</div></div>
<div class="tap" id="tap"></div>
<div class="end" id="end">${WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"')}<h1>Free.<br>Boost.<br><b>Points.</b></h1><p>☕ coffee is free · ⚡ skip the line in USDC<br>🪙 points for coming back</p></div>
</body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const tmp = here + ".rec-game";
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
await f.waitForSelector('[data-id="flatwhite"]');

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

await caption("Coffee is free", "Order from your seat, wait your turn");
await wait(1600);
await scroll(380);
await tap('[data-id="flatwhite"]'); await wait(400);
await tap('[data-milk="regular"]'); await wait(400);
await tap("#fallbackBtn"); await wait(900);
await f.evaluate(() => { const s = document.getElementById("tipSheet"); if (s) s.hidden = true; });
await caption("In a hurry?", "Skip the line with a boost");
await tap("[data-goqueue]"); await wait(1400);
await f.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" })); await wait(500);
await caption("You're #5", "Free orders go in arrival order");
await wait(1300);
await tap('[data-boost="2"]'); await wait(700);
await caption("Boost 2 USDC", "Pay in USDC, or with your points");
await wait(600);
await tap("#boostPoints"); await wait(80);
await f.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" })); await wait(400);
await caption("⚡ Zoom: #1", "Your cup jumps the queue");
await wait(2400);
await f.evaluate(() => { window.__S.ready = true; window.__S.cupToday = true; window.__S.points += 26; window.__S.streak = 4;
  window.__S.queue = window.__S.queue.filter(o => o.num !== 24); window.__S.log.unshift({ delta: 26, label: "First coffee of the day · 🔥 4" }); });
await page.evaluate(() => document.getElementById("notif").classList.add("on"));
await caption("Ready! ☕", "Your first coffee today earns points");
await wait(1900);
await page.evaluate(() => document.getElementById("notif").classList.remove("on"));
await f.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
await tap('[data-tab="rank"]'); await wait(300);
await caption("Points and streak", "Days in a row earn more 🔥");
await wait(2400);
await tap('[data-tab="pay"]'); await wait(600);
await caption("Spend your points", "Boosts, merch, the coffee bag");
await wait(900);
await tap('[data-shop="1"]'); await wait(2300);
await tap('[data-tab="menu"]'); await wait(400);
await f.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
await caption("Collect it at the bar", "");
await wait(1800);
await page.evaluate(() => document.getElementById("end").classList.add("on"));
await wait(3000);

const video = page.video();
await ctx.close(); await browser.close();
const webm = await video.path();
const out = here + "beach-coffee-game.mp4";
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", start.toFixed(2), "-i", webm, "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out]);
rmSync(tmp, { recursive: true, force: true });
console.log("wrote", out);

// Records a vertical (1080 × 1920) video of the coffee check-in onchain: order in the Mini App, tap
// "Check in", the check-in page opens in the wallet, confirm, "Checked in!" and the Telegram ping.
// The pages are the real ones (miniapp.js, checkinpage.js) with Telegram, the API and the wallet faked
// in the browser: nothing reaches the bot or Solana. The wallet step is a neutral sheet, not a real
// wallet's screen.
// Output: design/video/beach-coffee-checkin.mp4
// Run: cd design/video && NODE_PATH=$(npm root -g) node checkin-video.mjs
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { miniAppHtml } from "../../telegram-bot/src/miniapp.js";
import { checkinPageHtml } from "../../telegram-bot/src/checkinpage.js";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const worker = readFileSync(new URL("../../telegram-bot/src/worker.js", import.meta.url), "utf8");
const drinks = [...worker.matchAll(/\{ id: "([a-z]+)",\s*name: "([^"]+)" \}/g)].map(m => ({ id: m[1], name: m[2] }));
const logo = "data:image/png;base64," + readFileSync(new URL("../app/icon-192.png", import.meta.url)).toString("base64");

const app = miniAppHtml(drinks, null).replace("<head>", `<head><script>
window.Telegram = { WebApp: { initData: "demo", initDataUnsafe: {}, ready(){}, expand(){}, onEvent(){}, offEvent(){}, setHeaderColor(){}, setBackgroundColor(){}, close(){}, openLink(u){ parent.postMessage("open-checkin", "*"); },
  showConfirm(m, cb){ cb(true); }, showAlert(){}, HapticFeedback: { impactOccurred(){}, selectionChanged(){}, notificationOccurred(){} } } };
const orders = [{ num: 13, drink: "cappuccino", status: "ready", checkin: "done" }];
window.fetch = async (path, init) => {
  const b = init && init.body ? JSON.parse(init.body) : {}; let r;
  if (path === "/api/session") r = { ok: true, user: { first_name: "Ana" }, open: true, orders, ranking: null, event: null, out: [], checkin: true };
  if (path === "/api/order") { orders.unshift({ num: 14, drink: b.drink, status: "pending" }); r = { ok: true, order: { num: 14, drink: b.drink }, orders }; }
  if (path === "/api/checkin") r = { ok: true, checkin: { status: "open", solflare: "#", phantom: "#", page: "#" } };
  return { json: async () => r };
};
</script>`);

const checkin = checkinPageHtml({ token: "T", drink: "Espresso", num: 14, day: "2026-11-07", status: "open", signature: null, feePayer: "Bar", solflare: "#", phantom: "#" })
  .replace("<head>", `<head><script>
window.solanaWeb3 = { Transaction: { from: b => ({ serialize: () => b }) } };
window.solflare = { isSolflare: true, publicKey: "Guest", connect: async () => ({ publicKey: "Guest" }),
  signTransaction: tx => new Promise(res => { parent.postMessage("wallet-sheet", "*"); window.__approve = () => res(tx); }) };
const _fetch = window.fetch;
window.fetch = async (path, init) => {
  let r;
  if (String(path).endsWith("/tx")) r = { ok: true, tx: btoa("tx"), feePayer: "Bar" };
  else if (String(path).endsWith("/send")) r = { ok: true, status: "sent", signature: "5Vf…Qn" };
  else r = { ok: true, status: "done", signature: "5VfYmGBjvQKe3xgLtTQPSMEUdpEVHrhLVUfGqyxTqzNmnbbNfFv4DgKMZiZq1vUhPskzZBhX1T1BvDkJGtdpQnQH" };
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
.view { position: absolute; left: 0; right: 0; top: 0; bottom: 0; transition: transform .5s cubic-bezier(.2,.8,.2,1); background: #071110; }
#v2 { transform: translateX(100%); } #v2.on { transform: none; }
iframe { width: ${SW}px; height: ${SH - 56}px; border: 0; display: block; }
.sheet { position: absolute; left: 0; right: 0; bottom: -420px; background: #151a19; border-radius: 26px 26px 0 0; padding: 22px 20px 28px; z-index: 6;
  box-shadow: 0 -20px 60px rgba(0,0,0,.6); transition: bottom .45s cubic-bezier(.2,.9,.3,1.1); }
.sheet.on { bottom: 0; }
.sheet h3 { margin: 0 0 4px; font-size: 20px; } .sheet .site { color: #7f9a8c; font-size: 14px; margin-bottom: 14px; }
.sheet .row { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #262d2b; font-size: 15px; } .sheet .row span:first-child { color: #9db3a6; }
.sheet .ok { margin-top: 16px; height: 48px; border-radius: 999px; background: #a8e6b8; color: #08201a; display: grid; place-items: center; font-weight: 600; }
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
.end h1 { margin: 0; font: 900 112px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; } .end h1 b { color: #a8e6b8; }
.end p { margin: 0; font: 600 40px/1.3 Figtree, sans-serif; color: #e8b86a; letter-spacing: .04em; }
</style></head><body>
<div class="cap" id="cap"><div class="k" id="capK"></div><div class="s" id="capS"></div></div>
<div class="phone"><div class="screen">
  <div class="view" id="v1"><div class="bar"><img src="${logo}" alt=""><b>Beach Coffee Co.</b><span>mini app</span></div><iframe id="app"></iframe></div>
  <div class="view" id="v2"><div class="bar"><span style="font-size:15px;color:#c9d6cd">🔒 drinkbeachcoffee.com</span><b></b><span>in your wallet</span></div><iframe id="ck"></iframe>
    <div class="sheet" id="sheet"><h3>Confirm in your wallet</h3><div class="site">drinkbeachcoffee.com · Beach Coffee check-in</div>
      <div class="row"><span>Balance changes</span><span>None</span></div>
      <div class="row"><span>Network fee</span><span>Paid by the bar</span></div>
      <div class="row"><span>Memo</span><span>Espresso #14</span></div>
      <div class="ok" id="sheetOk">Confirm</div></div></div>
  <div class="notif" id="notif"><img src="${logo}" alt=""><div><div class="t"><b>BeachCoffeeBot</b> · now</div>
    <div class="m">☕ <b>Checked in onchain!</b><br>Your Espresso #14 is on Solana.</div></div></div>
</div></div>
<div class="tap" id="tap"></div>
<div class="end" id="end">${WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"')}<h1>Every coffee,<br><b>onchain.</b></h1><p>drinkbeachcoffee.com</p></div>
<script>window.addEventListener("message", e => { if (e.data === "wallet-sheet") document.getElementById("sheet").classList.add("on"); });</script>
</body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const tmp = here + ".rec-checkin";
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: tmp, size: { width: W, height: H } } });
const page = await ctx.newPage();
const t0 = Date.now();
await page.setContent(stage, { waitUntil: "networkidle" });
await page.$eval("#app", (f, html) => { f.srcdoc = html; }, app);
await page.$eval("#ck", (f, html) => { f.srcdoc = html; }, checkin);
await page.waitForTimeout(2500);
const appFrame = () => page.frames().find(f => f.parentFrame() && f.name() === "" && f.url() === "about:srcdoc" && f !== ckFrame());
let ckRef = null;
const ckFrame = () => ckRef;
const frames = page.frames().filter(f => f !== page.mainFrame());
const fApp = await (await page.$("#app")).contentFrame();
ckRef = await (await page.$("#ck")).contentFrame();
await fApp.waitForSelector('[data-id="espresso"]');
await page.evaluate(() => document.fonts.ready);
const start = (Date.now() - t0) / 1000;

const wait = ms => page.waitForTimeout(ms);
const caption = async (k, s = "") => {
  await page.evaluate(([k, s]) => { const c = document.getElementById("cap"); c.style.opacity = 0;
    setTimeout(() => { document.getElementById("capK").textContent = k; document.getElementById("capS").textContent = s; c.style.opacity = 1; }, 300); }, [k, s]);
  await wait(450);
};
const tapAt = async box => {
  await page.evaluate(([x, y]) => { const t = document.getElementById("tap"); t.style.left = x + "px"; t.style.top = y + "px"; t.classList.add("on"); },
    [box.x + box.width / 2, box.y + box.height / 2]);
  await wait(280);
};
const tapOff = async () => { await wait(220); await page.evaluate(() => document.getElementById("tap").classList.remove("on")); };
const tap = async (frame, sel) => { const el = frame.locator(sel).first(); await tapAt(await el.boundingBox()); await el.evaluate(e => e.click()); await tapOff(); };
const scroll = async (frame, y) => { await frame.evaluate(y => window.scrollTo({ top: y, behavior: "smooth" }), y); await wait(1400); };

await caption("Coffee, onchain", "Check in every coffee, like the event check-in");
await wait(1800);
await caption("Order from your seat");
await scroll(fApp, 470);
await tap(fApp, '[data-id="espresso"]');
await wait(900);
await tap(fApp, "#fallbackBtn");
await wait(1000);
await caption("Check in your coffee", "Free: the bar pays the network fee");
const cardY = await fApp.evaluate(() => document.querySelector(".checkin-card").getBoundingClientRect().top + window.scrollY - 90);
await scroll(fApp, cardY);
await wait(600);
await tap(fApp, '[data-checkin="solflare"]');
await page.evaluate(() => document.getElementById("v2").classList.add("on"));
await wait(900);
await caption("Opens in your wallet", "Your wallet signs a check-in memo");
await wait(1800);
await tap(ckRef, "#go");
await wait(900);
await caption("No balance changes", "Nothing leaves your wallet");
await wait(1700);
await tapAt(await page.locator("#sheetOk").boundingBox());
await page.evaluate(() => document.getElementById("sheet").classList.remove("on"));
await ckRef.evaluate(() => window.__approve());
await tapOff();
await ckRef.waitForSelector("#done:not([hidden])", { timeout: 15000 });
await caption("Checked in ☕", "Proof you had a coffee here, on Solana");
await wait(1800);
await page.evaluate(() => document.getElementById("notif").classList.add("on"));
await wait(2300);
await page.evaluate(() => document.getElementById("end").classList.add("on"));
await wait(2800);

const video = page.video();
await ctx.close();
await browser.close();
const webm = await video.path();
const out = here + "beach-coffee-checkin.mp4";
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", start.toFixed(2), "-i", webm, "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out]);
rmSync(tmp, { recursive: true, force: true });
console.log("wrote", out);

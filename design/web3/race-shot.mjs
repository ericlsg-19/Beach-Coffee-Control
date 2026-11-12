// Renders the final coffee race (Island DAO, 11 Nov 2026) in the real Mini App for the /web3 page:
// design/web3/race-final.png (390 × 750 at 2×). Telegram and the API are faked in the browser.
// Run: cd design/web3 && NODE_PATH=$(npm root -g) node race-shot.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { miniAppHtml } from "../../telegram-bot/src/miniapp.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const worker = readFileSync(new URL("../../telegram-bot/src/worker.js", import.meta.url), "utf8");
const drinks = [...worker.matchAll(/\{ id: "([a-z]+)",\s*name: "([^"]+)" \}/g)].map(m => ({ id: m[1], name: m[2] }));
// Final top 10, from the bot's ranking: [name, score (drinks + boosts), boosts].
const FINAL = [["Beau L.", 30, 2], ["RIK", 30, 0], ["iggynore", 27, 0], ["Camila", 25, 0], ["João B.", 21, 0], ["Tony", 21, 0],
  ["Paloma L.", 20, 0], ["Dimitris", 20, 0], ["Lucas G.", 19, 0], ["Bobby L.", 16, 0]];
const ranking = { top: FINAL.map(([name, d, b], i) => ({ rank: i + 1, name, drinks: d, boosts: b, me: false })), me: null, total: 115, boostedToday: false, patrons: [] };
const app = miniAppHtml(drinks, { recipient: "WTxV6GDprgz2vHT4gX4ULCexqqaXYKQ8zWpZoYJHz2u", bagPrice: "10", bagStock: 20, bagsLeft: 9 })
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', `<script>
window.Telegram = { WebApp: { initData: "demo", initDataUnsafe: {}, ready(){}, expand(){}, onEvent(){}, offEvent(){}, setHeaderColor(){}, setBackgroundColor(){}, close(){}, openLink(){},
  showConfirm(m, cb){ cb(true); }, showAlert(){}, HapticFeedback: { impactOccurred(){}, selectionChanged(){}, notificationOccurred(){} } } };
try { localStorage.setItem("bc-news", "seen-all"); } catch (e) {}
window.fetch = async path => ({ json: async () => path === "/api/session"
  ? { ok: true, user: { first_name: "Guest" }, open: true, orders: [], event: null, out: [], daily: { max: 3, used: 0 }, ranking: ${JSON.stringify(ranking)} }
  : { ok: true } });
</script>`);
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 750 }, deviceScaleFactor: 2 });
await p.setContent(app, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
await p.evaluate(() => { const s = document.getElementById("newsSheet"); if (s) s.hidden = true; });
await p.click('[data-tab="rank"]').catch(() => {});
await p.waitForTimeout(300);
await p.click('[data-board="race"]');
await p.waitForTimeout(900);
// A guest's view without their own card: the boost offer and the board, from the board switch down.
await p.evaluate(() => {
  document.getElementById("meRank").hidden = true;
  document.getElementById("raceBoost").hidden = false;
  window.scrollTo(0, document.getElementById("rankSeg").getBoundingClientRect().top + window.scrollY - 16);
});
await p.waitForTimeout(300);
await p.screenshot({ path: here + "race-final.png" });
await b.close();

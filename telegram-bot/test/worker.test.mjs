// Runs the worker against an in-memory SQLite database and a fake Telegram API.
// Usage (from telegram-bot/): npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.js";
import { PUBLIC_RPCS } from "../src/pay.js";

// Minimal D1 shim: prepare().bind().first()/all()/run().
function d1() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  return {
    prepare(sql) {
      let params = [];
      const stmt = {
        bind(...p) { params = p; return stmt; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async run() { db.prepare(sql).run(...params); return { success: true }; },
      };
      return stmt;
    },
  };
}

function setup() {
  const calls = [];
  let nextId = 100;
  globalThis.fetch = async (url, init) => {
    const method = url.split("/").pop();
    calls.push({ method, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ ok: true, result: { message_id: nextId++ } }));
  };
  const env = { DB: d1(), BOT_TOKEN: "t", WEBHOOK_SECRET: "s", BARISTA_CODE: "beach123", SOLANA_ADDRESS: "ADDR" };
  const post = update => worker.fetch(new Request("https://bot/", {
    method: "POST",
    headers: { "X-Telegram-Bot-Api-Secret-Token": "s" },
    body: JSON.stringify(update),
  }), env);
  return { env, calls, post };
}

const BARISTA = 1, ANA = 2;
const msg = (chat, text) => ({ message: { chat: { id: chat, type: "private" }, from: { id: chat, first_name: "Ana" }, text } });
const tap = (chat, data, id = 50) => ({ callback_query: { id: "cb", data, from: { id: chat, first_name: "Ana", username: "ana" }, message: { chat: { id: chat, type: "private" }, message_id: id } } });

test("rejects requests without the webhook secret", async () => {
  const { env } = setup();
  const res = await worker.fetch(new Request("https://bot/", { method: "POST", body: "{}" }), env);
  assert.equal(res.status, 403);
});

test("customer can't order before a barista chat is set", async () => {
  const { calls, post } = setup();
  await post(tap(ANA, "c:latte"));
  assert.match(calls.at(-1).body.text, /aren't open yet/);
});

test("full order: menu, confirm, barista notified, ready message to customer", async () => {
  const { calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  assert.match(calls.at(-1).body.text, /Orders will arrive in this chat/);

  await post(msg(ANA, "/start"));
  assert.equal(calls.at(-1).method, "sendMessage");
  assert.match(calls.at(-1).body.text, /tap <b>Order ☕<\/b> at the bottom/);
  assert.equal(calls.at(-1).body.reply_markup, undefined);

  await post(tap(ANA, "d:flatwhite"));
  assert.match(calls.at(-1).body.text, /Flat White/);

  calls.length = 0;
  await post(tap(ANA, "c:flatwhite"));
  const toCustomer = calls.find(c => c.method === "editMessageText" && c.body.chat_id === ANA);
  const toBarista = calls.find(c => c.method === "sendMessage" && c.body.chat_id === String(BARISTA));
  assert.match(toCustomer.body.text, /Order #1<\/b> · Flat White/);
  assert.doesNotMatch(toCustomer.body.text, /ADDR|USDC|SOL/); // drinks are free: no payment details
  assert.match(toBarista.body.text, /#1 · Flat White/);
  assert.match(toBarista.body.text, /Ana \(@ana\)/);
  const readyData = toBarista.body.reply_markup.inline_keyboard[0][0].callback_data;

  // A customer can't mark their own order ready.
  calls.length = 0;
  await post(tap(ANA, readyData));
  assert.ok(!calls.some(c => c.method === "sendMessage"));

  await post(tap(BARISTA, readyData, 77));
  const ready = calls.find(c => c.method === "sendMessage" && c.body.chat_id === ANA);
  assert.match(ready.body.text, /Your Flat White is ready/);

  // Tapping Ready again doesn't message the customer twice.
  calls.length = 0;
  await post(tap(BARISTA, readyData, 77));
  assert.ok(!calls.some(c => c.method === "sendMessage" && c.body.chat_id === ANA));
});

test("daily numbers count up, /today and /queue report them", async () => {
  const { calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  await post(tap(ANA, "c:latte"));
  await post(tap(ANA, "c:mocha"));
  assert.match(calls.filter(c => c.body.chat_id === String(BARISTA)).at(-1).body.text, /#2 · Mocha/);

  await post(msg(BARISTA, "/today"));
  assert.match(calls.at(-1).body.text, /Total: <b>2<\/b> drinks · Telegram 2 · Bar 0/);
  assert.match(calls.at(-1).body.text, /Still waiting: 2/);
  await post(msg(BARISTA, "/queue"));
  assert.match(calls.at(-1).body.text, /Waiting \(2\)/);
});

test("/total adds up every day of the event, Telegram and bar", async () => {
  const { env, calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  await post(msg(BARISTA, "/total"));
  assert.match(calls.at(-1).body.text, /No orders yet/);

  const add = (day, drink, chat, status = "ready") => env.DB.prepare(
    "INSERT INTO orders (day, num, created_at, drink, customer_chat, customer_name, status) VALUES (?, 1, ?, ?, ?, 'Ana S.', ?)"
  ).bind(day, `${day}T15:00:00Z`, drink, chat, status).run();
  await add("2026-10-22", "latte", 0);
  await add("2026-10-22", "latte", 0);
  await add("2026-10-27", "latte", ANA);
  await add("2026-10-27", "mocha", 0);
  await add("2026-10-27", "espresso", 0);
  await add("2026-10-27", "mocha", ANA, "cancelled");

  await post(msg(BARISTA, "/total"));
  const text = calls.at(-1).body.text;
  assert.match(text, /since Thu 22 Oct \(2 days\)/);
  assert.match(text, /Total: <b>5<\/b> drinks · Telegram 1 · Bar 4/);
  assert.match(text, /Best day: Tue 27 Oct \(3\)/);
  assert.match(text, /Top drink: Latte/);
  assert.match(text, /Telegram customers: 1/);
});

test("limits pending drinks per customer and respects /close", async () => {
  const { calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  for (let i = 0; i < 3; i++) await post(tap(ANA, "c:espresso"));
  await post(tap(ANA, "c:espresso"));
  assert.match(calls.at(-1).body.text, /already have 3 drinks/);

  await post(msg(BARISTA, "/close"));
  await post(msg(ANA, "hi"));
  assert.match(calls.at(-1).body.text, /closed/);
});

test("wrong barista code is refused", async () => {
  const { calls, post } = setup();
  await post(msg(ANA, "/barista nope"));
  assert.match(calls.at(-1).body.text, /doesn't match/);
});

test("scheduled check re-registers a lost webhook and leaves a healthy one alone", async () => {
  const { env, calls } = setup();
  env.WEBHOOK_URL = "https://bot.example";
  let current = "";
  globalThis.fetch = async (url, init) => {
    const method = url.split("/").pop(); const body = JSON.parse(init.body);
    calls.push({ method, body });
    if (method === "getWebhookInfo") return new Response(JSON.stringify({ ok: true, result: { url: current, pending_update_count: 3 } }));
    if (method === "setWebhook") current = body.url;
    return new Response(JSON.stringify({ ok: true, result: true }));
  };
  const runCron = async () => { const jobs = []; await worker.scheduled({}, env, { waitUntil: p => jobs.push(p) }); await Promise.all(jobs); };
  await runCron();
  const set = calls.find(c => c.method === "setWebhook");
  assert.equal(set.body.url, "https://bot.example");
  assert.equal(set.body.secret_token, "s");

  calls.length = 0;
  await runCron();
  assert.ok(!calls.some(c => c.method === "setWebhook"));
});

// ---------- Mini App ----------
import { createHmac } from "node:crypto";

// Builds initData the way Telegram does, signed with the bot token (independent of the worker code).
function signedInitData(botToken, user, authDate = Math.floor(Date.now() / 1000)) {
  const fields = { auth_date: String(authDate), query_id: "AAE", user: JSON.stringify(user) };
  const check = Object.keys(fields).sort().map(k => `${k}=${fields[k]}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secret).update(check).digest("hex");
  return new URLSearchParams({ ...fields, hash }).toString();
}
const apiCall = (env, path, body) => worker.fetch(new Request(`https://bot${path}`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
}), env);

test("serves the Mini App page with all 12 drinks", async () => {
  const { env } = setup();
  const res = await worker.fetch(new Request("https://bot/app"), env);
  assert.equal(res.headers.get("content-type"), "text/html; charset=utf-8");
  const html = await res.text();
  assert.match(html, /telegram-web-app\.js/);
  for (const name of ["Freddo Espresso", "Iced Latte", "Hot Chocolate"]) assert.ok(html.includes(name), name);
});

test("Mini App rejects forged or expired initData", async () => {
  const { env } = setup();
  const forged = signedInitData("some-other-token", { id: ANA, first_name: "Ana" });
  assert.equal((await apiCall(env, "/api/session", { initData: forged })).status, 401);
  const old = signedInitData("t", { id: ANA, first_name: "Ana" }, Math.floor(Date.now() / 1000) - 2 * 86400);
  assert.equal((await apiCall(env, "/api/session", { initData: old })).status, 401);
  assert.equal((await apiCall(env, "/api/order", { drink: "latte" })).status, 401);
});

test("Mini App order: saved, receipt to customer, barista notified, listed in session", async () => {
  const { env, calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  const initData = signedInitData("t", { id: ANA, first_name: "Ana", username: "ana" });

  const session = await (await apiCall(env, "/api/session", { initData })).json();
  assert.deepEqual([session.ok, session.open, session.user.first_name, session.orders.length], [true, true, "Ana", 0]);

  calls.length = 0;
  const r = await (await apiCall(env, "/api/order", { initData, drink: "icedlatte" })).json();
  assert.deepEqual(r.order, { num: 1, drink: "icedlatte" });
  assert.equal(r.orders[0].status, "pending");
  assert.match(calls.find(c => c.body.chat_id === ANA).body.text, /Order #1<\/b> · Iced Latte/);
  assert.match(calls.find(c => c.body.chat_id === String(BARISTA)).body.text, /#1 · Iced Latte[\s\S]*Ana \(@ana\)/);

  const bad = await (await apiCall(env, "/api/order", { initData, drink: "beer" })).json();
  assert.equal(bad.ok, false);
});

test("/start points customers to the Order button instead of chat buttons", async () => {
  const { calls, post } = setup();
  await post(msg(ANA, "/start"));
  assert.match(calls.at(-1).body.text, /Order ☕/);
  assert.equal(calls.at(-1).body.reply_markup, undefined);
});

test("/start sends the how-to-order picture when the bot knows its URL", async () => {
  const { env, calls, post } = setup();
  env.WEBHOOK_URL = "https://bot.example";
  await post(msg(ANA, "/start"));
  const photo = calls.at(-1);
  assert.equal(photo.method, "sendPhoto");
  assert.match(photo.body.photo, /^https:\/\/bot\.example\/how-to-order\.jpg/);
  assert.match(photo.body.caption, /tap <b>Order ☕<\/b>/);

  const img = await worker.fetch(new Request("https://bot.example/how-to-order.jpg"), env);
  assert.equal(img.headers.get("content-type"), "image/jpeg");
  const bytes = new Uint8Array(await img.arrayBuffer());
  assert.deepEqual([bytes[0], bytes[1]], [0xff, 0xd8]); // JPEG header
});

test("/health reports database, barista and today's counts", async () => {
  const { env, post } = setup();
  let h = await (await worker.fetch(new Request("https://bot/health"), env)).json();
  assert.deepEqual([h.ok, h.open, h.barista_set, h.orders_today, h.waiting], [true, true, false, 0, 0]);
  await post(msg(BARISTA, "/barista beach123"));
  await post(tap(ANA, "c:latte"));
  h = await (await worker.fetch(new Request("https://bot/health"), env)).json();
  assert.deepEqual([h.barista_set, h.orders_today, h.waiting], [true, 1, 1]);
});

// The Âncora page (ancora/ancora.html) must offer the same menu and version as the bot.
test("Âncora and the bot share the same menu and version", async () => {
  const ancora = readFileSync(new URL("../../ancora/ancora.html", import.meta.url), "utf8");
  const bot = readFileSync(new URL("../src/worker.js", import.meta.url), "utf8");
  const menu = src => [...src.matchAll(/\{ id: "([a-z]+)",\s*name: "([^"]+)" \}/g)].map(m => `${m[1]}=${m[2]}`);
  assert.deepEqual(menu(ancora), menu(bot));
  assert.equal(menu(bot).length, 12);
  const botVersion = bot.match(/const VERSION = "([^"]+)"/)[1];
  assert.ok(ancora.includes(`Âncora v${botVersion}`), `Âncora should show v${botVersion}`);
  const h = await (await worker.fetch(new Request("https://bot/health"), setup().env)).json();
  assert.equal(h.version, botVersion);
});

// ---------- Âncora panel and reports ----------

const panel = (env, method, path, body, code = "beach123") => worker.fetch(new Request(`https://bot${path}`, {
  method, headers: { "content-type": "application/json", ...(code ? { "X-Barista-Code": code } : {}) },
  body: body ? JSON.stringify(body) : undefined,
}), env);

test("serves Âncora at /panel from the generated copy of ancora/ancora.html", async () => {
  const { env } = setup();
  const html = await (await worker.fetch(new Request("https://bot/panel"), env)).text();
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<title>Âncora<\/title>/);
  const source = readFileSync(new URL("../../ancora/ancora.html", import.meta.url), "utf8");
  const { ANCORA_HTML } = await import("../src/ancora-html.js");
  assert.equal(ANCORA_HTML, source, "run `npm run sync:ancora` after editing ancora/ancora.html");
});

test("panel API needs the barista code", async () => {
  const { env } = setup();
  assert.equal((await panel(env, "GET", "/api/panel/orders", null, null)).status, 401);
  assert.equal((await panel(env, "GET", "/api/panel/orders", null, "wrong")).status, 401);
});

test("panel shows Telegram and bar orders together; Ready and remove notify Telegram customers", async () => {
  const { env, calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  await post(tap(ANA, "c:latte"));                                   // Telegram order #1
  const bar = await (await panel(env, "POST", "/api/panel/orders", { drink: "mocha", customer: "Rita", day: localDayForTest() })).json();
  assert.equal(bar.order.source, "bar");

  let list = (await (await panel(env, "GET", "/api/panel/orders")).json()).orders;
  assert.deepEqual(list.map(o => [o.drink, o.source, o.customer]), [["latte", "telegram", "Ana (@ana) · Telegram"], ["mocha", "bar", "Rita"]]);

  calls.length = 0;
  await panel(env, "POST", `/api/panel/orders/${list[0].id}`, { done: true });
  assert.match(calls.find(c => c.method === "sendMessage" && c.body.chat_id === ANA).body.text, /Your Latte is ready/);
  await panel(env, "POST", `/api/panel/orders/${list[1].id}`, { done: true });
  list = (await (await panel(env, "GET", "/api/panel/orders")).json()).orders;
  assert.deepEqual(list.map(o => o.done), [true, true]);

  await panel(env, "DELETE", `/api/panel/orders/${list[1].id}`);          // bar order: removed
  await post(tap(ANA, "c:matcha"));                                        // Telegram order #2 (bar #2 was removed)
  list = (await (await panel(env, "GET", "/api/panel/orders")).json()).orders;
  calls.length = 0;
  await panel(env, "DELETE", `/api/panel/orders/${list.at(-1).id}`);       // Telegram pending: cancelled
  assert.match(calls.find(c => c.body.chat_id === ANA).body.text, /couldn't make order #2 \(Matcha\)/);
  list = (await (await panel(env, "GET", "/api/panel/orders")).json()).orders;
  assert.deepEqual(list.map(o => o.drink), ["latte"]);
});

test("daily report at 23:00 Floripa covers Telegram and bar orders", async () => {
  const { env, calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  await post(tap(ANA, "c:espresso"));
  await panel(env, "POST", "/api/panel/orders", { drink: "espresso", customer: "", day: localDayForTest() });
  await panel(env, "POST", "/api/panel/orders", { drink: "matcha", customer: "", day: localDayForTest() });
  calls.length = 0;
  const jobs = [];
  await worker.scheduled({ cron: "0 2 * * *" }, env, { waitUntil: p => jobs.push(p) });
  await Promise.all(jobs);
  const report = calls.find(c => c.method === "sendMessage" && c.body.chat_id === String(BARISTA)).body.text;
  assert.match(report, /End of day/);
  assert.match(report, /Total: <b>3<\/b> drinks · Telegram 1 · Bar 2/);
  assert.match(report, /Espresso: <b>2<\/b>/);
  assert.match(report, /Top drink: Espresso/);
  assert.match(report, /Telegram customers: 1/);
  assert.ok(!calls.some(c => c.method === "getWebhookInfo"), "the report cron doesn't run the webhook check");
});

function localDayForTest() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

// ---------- Ranking ----------

test("ranking counts Telegram orders per customer, skips bar and cancelled orders, hides last names", async () => {
  const { env, calls, post } = setup();
  await post(msg(BARISTA, "/barista beach123"));
  const BEN = 3;
  const tapAs = (chat, first, last, username, data) => post({ callback_query: { id: "cb", data,
    from: { id: chat, first_name: first, last_name: last, username }, message: { chat: { id: chat, type: "private" }, message_id: 50 } } });
  await tapAs(ANA, "Ana", "Souza", "ana", "c:latte");
  await tapAs(ANA, "Ana", "Souza", "ana", "c:mocha");
  await tapAs(BEN, "Ben", undefined, "ben", "c:espresso");
  await tapAs(BEN, "Ben", undefined, "ben", "c:espresso");
  await tapAs(BEN, "Ben", undefined, "ben", "c:espresso");
  await panel(env, "POST", "/api/panel/orders", { drink: "latte", customer: "Walk-in", day: localDayForTest() });
  // Cancel one of Ben's: he drops to 2 and Ana (who got to 2 first) stays ahead.
  const benOrders = (await (await panel(env, "GET", "/api/panel/orders")).json()).orders.filter(o => o.customer.startsWith("Ben"));
  await panel(env, "DELETE", `/api/panel/orders/${benOrders[0].id}`);

  const full = (await (await panel(env, "GET", "/api/panel/ranking")).json()).ranking;
  assert.deepEqual(full.map(r => [r.rank, r.name, r.drinks]), [[1, "Ana Souza (@ana)", 2], [2, "Ben (@ben)", 2]]);

  const initData = signedInitData("t", { id: BEN, first_name: "Ben", username: "ben" });
  const s = await (await apiCall(env, "/api/session", { initData })).json();
  assert.deepEqual(s.ranking.top, [{ rank: 1, name: "Ana S.", drinks: 2, me: false }, { rank: 2, name: "Ben", drinks: 2, me: true }]);
  assert.deepEqual(s.ranking.me, { rank: 2, drinks: 2 });

  calls.length = 0;
  await post(msg(BARISTA, "/ranking"));
  assert.match(calls.at(-1).body.text, /🥇 Ana Souza \(@ana\) · <b>2<\/b>\n🥈 Ben \(@ben\) · <b>2<\/b>/);
  await post(msg(BARISTA, "/today"));
  assert.match(calls.at(-1).body.text, /Top customer: Ana Souza \(@ana\) \(2\)/);
});

test("Mini App has Menu and Ranking tabs", async () => {
  const { env } = setup();
  const html = await (await worker.fetch(new Request("https://bot/app"), env)).text();
  assert.match(html, /data-tab="menu"/);
  assert.match(html, /data-tab="rank"/);
});

// ---------- Tips and the coffee bag (USDC on Solana) ----------

const SHOP = "WTxV6GDprgz2vHT4gX4ULCexqqaXYKQ8zWpZoYJHz2u";
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const BUYER = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

// setup() plus a fake Solana RPC. chain[reference] = [{ signature, received (USDC), failed? }].
function setupPay(extraEnv = {}) {
  const t = setup();
  Object.assign(t.env, { SOLANA_ADDRESS: SHOP, SOLANA_RPC_URL: "https://rpc.test", BAG_PRICE_USDC: "10", WEBHOOK_URL: "https://bot" }, extraEnv);
  const chain = {}, rpcCalls = [];
  // Public RPCs refuse by default, the way api.mainnet-beta.solana.com answers Cloudflare Workers.
  const publicUp = new Set();
  const telegram = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    url = String(url);
    const isPublic = PUBLIC_RPCS.includes(url);
    if (!url.startsWith("https://rpc.test") && !isPublic) return telegram(url, init);
    if (isPublic && !publicUp.has(url)) {
      return new Response(JSON.stringify({ jsonrpc: "2.0", error: { code: 403, message: "Access forbidden" } }), { status: 403 });
    }
    const { method, params } = JSON.parse(init.body);
    rpcCalls.push(`${new URL(url).host} ${method}`);
    const all = Object.values(chain).flat();
    let result;
    if (method === "getLatestBlockhash") result = { value: { blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi", lastValidBlockHeight: 99 } };
    if (method === "getSignaturesForAddress") result = (chain[params[0]] || []).map(t => ({ signature: t.signature, err: t.failed ? {} : null }));
    if (method === "getTransaction") {
      const t = all.find(t => t.signature === params[0]);
      const bal = amount => [{ accountIndex: 2, mint: USDC, owner: SHOP, uiTokenAmount: { amount: String(amount) } }];
      result = { meta: { err: t.failed ? { InstructionError: [1, "x"] } : null, preTokenBalances: bal(5_000_000), postTokenBalances: bal(5_000_000 + t.received * 1e6) },
        transaction: { message: { accountKeys: [{ pubkey: BUYER }, { pubkey: SHOP }] } } };
    }
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
  };
  const getJson = async path => (await worker.fetch(new Request(`https://bot${path}`), t.env)).json();
  return { ...t, chain, rpcCalls, publicUp, getJson };
}
const pay = (env, body) => apiCall(env, "/api/pay", body).then(r => r.json());
const runMinuteCron = async env => { const jobs = []; await worker.scheduled({ cron: "* * * * *" }, env, { waitUntil: p => jobs.push(p.catch(() => {})) }); await Promise.all(jobs); };

test("tips and bags are off until SOLANA_ADDRESS is a real address", async () => {
  const { env } = setup();
  const r = await pay(env, { kind: "tip", amount: "5" });
  assert.equal(r.ok, false);
  assert.match(r.error, /aren't open yet/);
  const app = await (await worker.fetch(new Request("https://bot/app"), env)).text();
  assert.match(app, /const PAY = null;/);
});

test("after an order the Mini App offers an optional tip that goes straight to checkout", async () => {
  const { env } = setupPay();
  const app = await (await worker.fetch(new Request("https://bot/app"), env)).text();
  assert.match(app, /Tip the barista\?/);
  assert.match(app, /data-tip=/);
  assert.match(app, /else startPay\(\)/);
  assert.match(app, /id="tipSheet"/);
  assert.match(app, /Maybe later/);
});

test("validates tips and uses the bag price from the config", async () => {
  const { env } = setupPay();
  assert.equal((await pay(env, { kind: "tip", amount: "0.5" })).ok, false);
  assert.equal((await pay(env, { kind: "tip", amount: "1000" })).ok, false);
  assert.equal((await pay(env, { kind: "tip", amount: "5.123" })).ok, false);
  assert.equal((await pay(env, { kind: "drink" })).ok, false);
  const tip = await pay(env, { kind: "tip", amount: "7,5" });
  assert.equal(tip.payment.amount, "7.5");
  const bag = await pay(env, { kind: "bag", amount: "1" }); // the price can't be chosen by the customer
  assert.equal(bag.payment.amount, "10");
  assert.equal(bag.payment.micro, 10_000_000);
});

test("payment links: plain address on the page, Solana Pay only inside the QR and wallet links", async () => {
  const { env } = setupPay();
  const { payment } = await pay(env, { kind: "tip", amount: "5" });
  assert.match(payment.ref, /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.equal(payment.page, `https://bot/pay/${payment.ref}`);
  const sp = new URL(payment.solanaPay);
  assert.equal(sp.protocol, "solana:");
  assert.equal(sp.pathname, SHOP);
  assert.equal(sp.searchParams.get("amount"), "5");
  assert.equal(sp.searchParams.get("spl-token"), USDC);
  assert.equal(sp.searchParams.get("reference"), payment.ref);
  assert.equal(payment.phantom, `https://phantom.app/ul/browse/${encodeURIComponent(payment.page)}?ref=${encodeURIComponent("https://bot")}`);
  assert.match(payment.solflare, /^https:\/\/solflare\.com\/ul\/v1\/browse\//);

  const html = await (await worker.fetch(new Request(payment.page), env)).text();
  assert.ok(html.includes('"qr":"\\u003csvg xmlns='), "QR code embedded");
  // The address people copy is the bare address; "solana:" only lives in the Solana Pay link (QR).
  assert.ok(html.includes(`"recipient":"${SHOP}"`));
  assert.equal(html.split(`solana:${SHOP}`).length - 1, 1);
  const chooser = await worker.fetch(new Request("https://bot/pay"), env);
  assert.equal(chooser.status, 200);
  assert.match(await chooser.text(), /Tip the barista/);
  const missing = await worker.fetch(new Request("https://bot/pay/nope"), env);
  assert.equal(missing.status, 302);
  const lib = await worker.fetch(new Request("https://bot/vendor/web3.js"), env);
  assert.match(lib.headers.get("content-type"), /javascript/);
  assert.match(await lib.text(), /^var solanaWeb3=/);
  const bh = await (await worker.fetch(new Request("https://bot/api/pay/blockhash"), env)).json();
  assert.equal(bh.lastValidBlockHeight, 99);
});

test("web tip: found on chain, barista told once with a Solscan link", async () => {
  const { env, calls, post, chain, getJson } = setupPay();
  await post(msg(BARISTA, "/barista beach123"));
  const { payment } = await pay(env, { kind: "tip", amount: "5", name: "Rita" });
  assert.equal((await getJson(`/api/pay/${payment.ref}`)).payment.status, "pending");

  chain[payment.ref] = [{ signature: "sig1", received: 5 }];
  calls.length = 0;
  await new Promise(r => setTimeout(r, 0));
  // The page polls; the worker looks at the chain at most every 3 s, so force a fresh check.
  await env.DB.prepare("UPDATE payments SET checked_at = NULL").run();
  const paid = await getJson(`/api/pay/${payment.ref}`);
  assert.equal(paid.payment.status, "paid");
  const toBarista = calls.filter(c => c.method === "sendMessage" && c.body.chat_id === String(BARISTA));
  assert.equal(toBarista.length, 1);
  assert.match(toBarista[0].body.text, /💛 <b>Tip · 5 USDC<\/b>\n👤 Rita/);
  assert.match(toBarista[0].body.text, /solscan\.io\/tx\/sig1/);

  calls.length = 0;
  await env.DB.prepare("UPDATE payments SET checked_at = NULL").run();
  await getJson(`/api/pay/${payment.ref}`);
  await runMinuteCron(env);
  assert.ok(!calls.some(c => c.method === "sendMessage" && /Tip/.test(c.body.text || "")), "no second announcement");
});

test("underpaid or failed transactions don't count, and one transaction can't pay twice", async () => {
  const { env, post, chain, getJson } = setupPay();
  await post(msg(BARISTA, "/barista beach123"));
  const a = (await pay(env, { kind: "bag" })).payment;
  const b = (await pay(env, { kind: "bag" })).payment;
  chain[a.ref] = [{ signature: "short", received: 9.99 }, { signature: "failed", received: 10, failed: true }];
  await runMinuteCron(env);
  assert.equal((await getJson(`/api/pay/${a.ref}`)).payment.status, "pending");
  await env.DB.prepare("UPDATE payments SET checked_at = NULL").run();
  await getJson(`/api/pay/${a.ref}`); // the last check is now this payment's
  const why = (await getJson("/health?rpc=1")).last_payment_check;
  assert.ok(why.trace.includes("short: received 9990000 of 10000000 micro-USDC"), JSON.stringify(why));

  chain[a.ref].push({ signature: "good", received: 10 });
  chain[b.ref] = [{ signature: "good", received: 10 }]; // same transaction carrying both references
  await runMinuteCron(env);
  const statuses = [(await getJson(`/api/pay/${a.ref}`)).payment.status, (await getJson(`/api/pay/${b.ref}`)).payment.status];
  assert.deepEqual(statuses.sort(), ["paid", "pending"]);
});

test("coffee bag from the Mini App: customer and barista told, hand-over, /today and the panel", async () => {
  const { env, calls, post, chain } = setupPay();
  await post(msg(BARISTA, "/barista beach123"));
  const initData = signedInitData("t", { id: ANA, first_name: "Ana", last_name: "Souza", username: "ana" });
  const app = await (await worker.fetch(new Request("https://bot/app"), env)).text();
  assert.match(app, /data-tab="pay"/);
  assert.ok(app.includes(`"recipient":"${SHOP}"`));

  const { payment } = await pay(env, { initData, kind: "bag" });
  chain[payment.ref] = [{ signature: "bagsig", received: 10 }];
  calls.length = 0;
  await runMinuteCron(env);

  const toAna = calls.find(c => c.method === "sendMessage" && c.body.chat_id === ANA);
  assert.match(toAna.body.text, /Coffee bag #1 is yours/);
  const toBarista = calls.find(c => c.method === "sendMessage" && /Coffee bag #1 paid · 10 USDC/.test(c.body.text));
  assert.match(toBarista.body.text, /Ana Souza \(@ana\)/);
  const handOver = toBarista.body.reply_markup.inline_keyboard[0][0].callback_data;
  assert.equal(handOver, "h:1");

  calls.length = 0;
  await post(tap(ANA, handOver)); // customers can't mark it handed over
  assert.ok(!calls.some(c => c.method === "editMessageText"));
  await post(tap(BARISTA, handOver, 88));
  assert.match(calls.find(c => c.method === "editMessageText").body.text, /Coffee bag #1 handed over/);

  await post(msg(BARISTA, "/today"));
  assert.match(calls.at(-1).body.text, /🛍️ Coffee bags: 1 · 10 USDC/);

  const list = (await (await panel(env, "GET", "/api/panel/payments")).json()).payments;
  assert.deepEqual(list.map(p => [p.kind, p.amount, p.customer, p.handed]), [["bag", "10", "Ana Souza (@ana) · Telegram", true]]);
  await panel(env, "POST", `/api/panel/payments/${list[0].id}`, { handed: false });
  assert.equal((await (await panel(env, "GET", "/api/panel/payments")).json()).payments[0].handed, false);
  assert.equal((await panel(env, "GET", "/api/panel/payments", null, "wrong")).status, 401);
});

test("an RPC outage doesn't break checkout; it's retried by the cron", async () => {
  const { env, chain, getJson } = setupPay({ SOLANA_RPC_URL: "https://rpc.test/down" });
  const { payment } = await pay(env, { kind: "tip", amount: "2" });
  const telegramAndRpc = globalThis.fetch;
  globalThis.fetch = async (url, init) => String(url).endsWith("/down") ? new Response("busy", { status: 503 }) : telegramAndRpc(url, init);
  await runMinuteCron(env);
  assert.equal((await getJson(`/api/pay/${payment.ref}`)).payment.status, "pending");
  globalThis.fetch = telegramAndRpc;
  env.SOLANA_RPC_URL = "https://rpc.test";
  chain[payment.ref] = [{ signature: "late", received: 2 }];
  await runMinuteCron(env);
  assert.equal((await getJson(`/api/pay/${payment.ref}`)).payment.status, "paid");
});

test("the Mini App and payment page scripts are valid JavaScript", async () => {
  const { env } = setupPay();
  const scripts = async path => {
    const html = await (await worker.fetch(new Request(`https://bot${path}`), env)).text();
    return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  };
  const { payment } = await pay(env, { kind: "bag" });
  for (const path of ["/app", "/pay", `/pay/${payment.ref}`]) {
    const list = await scripts(path);
    assert.ok(list.length, `${path} has an inline script`);
    for (const js of list) assert.doesNotThrow(() => new Function(js), `${path} script parses`);
  }
});

test("limited edition: bags stop selling at BAG_STOCK, unpaid checkouts hold one for 15 minutes", async () => {
  const { env, calls, post, chain } = setupPay({ BAG_STOCK: "2" });
  await post(msg(BARISTA, "/barista beach123"));
  const appText = async () => (await worker.fetch(new Request("https://bot/app"), env)).text();
  assert.ok((await appText()).includes('"bagStock":2,"bagsLeft":2'));

  const a = (await pay(env, { kind: "bag" })).payment;
  const b = (await pay(env, { kind: "bag" })).payment;
  const held = await pay(env, { kind: "bag" });
  assert.match(held.error, /being paid for right now/);
  assert.equal((await pay(env, { kind: "tip", amount: "2" })).ok, true, "tips aren't limited");

  chain[a.ref] = [{ signature: "a1", received: 10 }];
  calls.length = 0;
  await runMinuteCron(env);
  assert.match(calls.find(c => /Coffee bag #1 paid/.test(c.body.text || "")).body.text, /📦 1 left/);

  // An abandoned checkout stops holding its bag after 15 minutes.
  await env.DB.prepare("UPDATE payments SET created_at = ? WHERE id = ?").bind(new Date(Date.now() - 16 * 60 * 1000).toISOString(), 2).run();
  const c = (await pay(env, { kind: "bag" })).payment;
  chain[c.ref] = [{ signature: "c1", received: 10 }];
  await runMinuteCron(env);
  const soldOut = await pay(env, { kind: "bag" });
  assert.match(soldOut.error, /sold out/);
  assert.ok((await appText()).includes('"bagsLeft":0'));

  calls.length = 0;
  await post(msg(BARISTA, "/bags"));
  assert.match(calls.at(-1).body.text, /Sold: <b>2<\/b>[\s\S]*Left: <b>0<\/b> of 2/);
  await post(msg(BARISTA, "/today"));
  assert.match(calls.at(-1).body.text, /🛍️ Coffee bags: 2 · 20 USDC \(0 left\)/);
  assert.equal((await (await panel(env, "GET", "/api/panel/payments")).json()).bags_left, 0);
  void b;
});

test("falls back to a public RPC when the first one refuses (403 from api.mainnet-beta)", async () => {
  const { env, post, chain, publicUp, rpcCalls, getJson } = setupPay();
  delete env.SOLANA_RPC_URL;
  await post(msg(BARISTA, "/barista beach123"));
  const [publicnode, mainnetBeta] = PUBLIC_RPCS;
  assert.equal(mainnetBeta, "https://api.mainnet-beta.solana.com");

  // Nothing answers: checkout still works and the page gets a clear failure for the blockhash.
  const { payment } = await pay(env, { kind: "tip", amount: "1" });
  assert.equal((await worker.fetch(new Request("https://bot/api/pay/blockhash"), env)).status, 502);
  let h = await getJson("/health?rpc=1");
  assert.deepEqual(h.rpc.map(r => [r.host, r.ok]), [["solana-rpc.publicnode.com", false], ["api.mainnet-beta.solana.com", false]]);
  assert.match(h.rpc[1].error, /403/);

  publicUp.add(publicnode);
  assert.equal((await getJson("/api/pay/blockhash")).blockhash, "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi");
  chain[payment.ref] = [{ signature: "pn1", received: 1 }];
  await runMinuteCron(env);
  assert.equal((await getJson(`/api/pay/${payment.ref}`)).payment.status, "paid");
  assert.ok(rpcCalls.some(c => c === "solana-rpc.publicnode.com getSignaturesForAddress"));
  h = await getJson("/health?rpc=1");
  assert.equal(h.rpc[0].ok, true);
  assert.equal(h.last_payment_check.found, true);
  assert.equal(h.last_payment_check.signature, "pn1");
  assert.equal((await getJson("/health")).rpc, undefined, "plain /health doesn't call Solana");
});

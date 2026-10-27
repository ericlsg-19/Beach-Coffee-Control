// Runs the worker against an in-memory SQLite database and a fake Telegram API.
// Usage (from telegram-bot/): npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.js";

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
  assert.match(toCustomer.body.text, /ADDR/);
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
  assert.match(calls.at(-1).body.text, /Total: <b>2<\/b> · Waiting: <b>2<\/b>/);
  await post(msg(BARISTA, "/queue"));
  assert.match(calls.at(-1).body.text, /Waiting \(2\)/);
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

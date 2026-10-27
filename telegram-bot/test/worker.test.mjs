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
  assert.equal(calls.at(-1).body.reply_markup.inline_keyboard.flat().length, 12);

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

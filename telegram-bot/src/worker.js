// Beach Coffee Co. Telegram bot, running as a Cloudflare Worker.
//
// Customers order a drink from the menu; the order lands in the barista chat
// with Ready / Cancel buttons; tapping Ready messages the customer.
//
// Bindings (see wrangler.toml): DB (D1 database).
// Secrets: BOT_TOKEN, WEBHOOK_SECRET, BARISTA_CODE. Vars: WEBHOOK_URL, SOLANA_ADDRESS (optional).
//
// Routes: POST /         Telegram webhook (checked with WEBHOOK_SECRET)
//         GET  /app      the Mini App menu
//         POST /api/...  Mini App calls, authenticated with Telegram initData

import { miniAppHtml } from "./miniapp.js";
import { verifyInitData } from "./initdata.js";
import { HOW_TO_ORDER_JPG } from "./howto.js";

const DRINKS = [
  { id: "espresso",   name: "Espresso" },
  { id: "double",     name: "Double Espresso" },
  { id: "freddo",     name: "Freddo Espresso" },
  { id: "americano",  name: "Americano" },
  { id: "carioca",    name: "Carioca" },
  { id: "cappuccino", name: "Cappuccino" },
  { id: "flatwhite",  name: "Flat White" },
  { id: "latte",      name: "Latte" },
  { id: "icedlatte",  name: "Iced Latte" },
  { id: "mocha",      name: "Mocha" },
  { id: "matcha",     name: "Matcha" },
  { id: "chocolate",  name: "Hot Chocolate" },
];

const TIME_ZONE = "America/Sao_Paulo";
const MAX_PENDING_PER_CUSTOMER = 3;

const drinkById = id => DRINKS.find(d => d.id === id);

function localDay(date = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function localTime(iso) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
const escapeHtml = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

function customerName(from) {
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");
  return from.username ? `${name} (@${from.username})` : name;
}

// ---------- Telegram API ----------

async function tg(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) console.log(`telegram ${method} failed`, JSON.stringify(data));
  return data;
}
const send = (env, chat_id, text, reply_markup) =>
  tg(env, "sendMessage", { chat_id, text, parse_mode: "HTML", reply_markup });
const edit = (env, chat_id, message_id, text, reply_markup) =>
  tg(env, "editMessageText", { chat_id, message_id, text, parse_mode: "HTML", reply_markup });

const appUrl = env => `${env.WEBHOOK_URL}/app`;

// ---------- Settings ----------

async function getSetting(env, key) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  return row ? row.value : null;
}
async function setSetting(env, key, value) {
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(key, String(value)).run();
}
async function isOpen(env) {
  return (await getSetting(env, "open")) !== "0";
}

// ---------- Customer flow ----------

async function showMenu(env, chatId, messageId) {
  if (!(await isOpen(env))) {
    const text = "The bar is closed right now 🌙 Come back soon!";
    return messageId ? edit(env, chatId, messageId, text) : send(env, chatId, text);
  }
  // Ordering happens in the Mini App, opened from the "Order ☕" button next to the message box.
  const text = "☕ <b>Beach Coffee Co.</b> · Island DAO\n\n" +
    "To order, tap <b>Order ☕</b> at the bottom of the chat, next to the message box 👇\n" +
    "Pick your drink and we'll message you here when it's ready.";
  if (messageId) return edit(env, chatId, messageId, text);
  if (env.WEBHOOK_URL) {
    const res = await tg(env, "sendPhoto", { chat_id: chatId, photo: `${env.WEBHOOK_URL}/how-to-order.jpg?v=1`, caption: text, parse_mode: "HTML" });
    if (res.ok) return res;
  }
  return send(env, chatId, text);
}

async function askConfirm(env, chatId, messageId, drink) {
  return edit(env, chatId, messageId, `You picked <b>${drink.name}</b>. Place the order?`, {
    inline_keyboard: [[
      { text: "✅ Order it", callback_data: `c:${drink.id}` },
      { text: "↩ Change", callback_data: "menu" },
    ]],
  });
}

// Saves the order and notifies the barista. Returns { order } or { error } with a customer-facing message.
async function createOrder(env, chatId, from, drink) {
  if (!(await isOpen(env))) return { error: "The bar is closed right now 🌙 Come back soon!" };

  const baristaChat = await getSetting(env, "barista_chat");
  if (!baristaChat) return { error: "Orders aren't open yet. Please order at the bar 🙏" };

  const pending = await env.DB.prepare("SELECT COUNT(*) AS n FROM orders WHERE customer_chat = ? AND status = 'pending'")
    .bind(chatId).first();
  if (pending.n >= MAX_PENDING_PER_CUSTOMER) {
    return { error: `You already have ${pending.n} drinks on the way. We'll message you as soon as they're ready ☕` };
  }

  const day = localDay();
  const createdAt = new Date().toISOString();
  const name = customerName(from);
  // The daily number is computed inside the INSERT so two orders at once can't share it.
  const order = await env.DB.prepare(
    `INSERT INTO orders (day, num, created_at, drink, customer_chat, customer_name)
     VALUES (?1, (SELECT COALESCE(MAX(num), 0) + 1 FROM orders WHERE day = ?1), ?2, ?3, ?4, ?5)
     RETURNING id, num`
  ).bind(day, createdAt, drink.id, chatId, name).first();

  const msg = await send(env, baristaChat,
    `🆕 <b>#${order.num} · ${drink.name}</b>\n👤 ${escapeHtml(name)}\n🕐 ${localTime(createdAt)}`,
    { inline_keyboard: [[
      { text: "✅ Ready", callback_data: `r:${order.id}` },
      { text: "❌ Cancel", callback_data: `k:${order.id}` },
    ]] });
  if (msg.ok) {
    await env.DB.prepare("UPDATE orders SET barista_message_id = ? WHERE id = ?").bind(msg.result.message_id, order.id).run();
  }
  console.log("order created", JSON.stringify({ num: order.num, drink: drink.id, chat: chatId }));
  return { order };
}

function receiptText(env, order, drink) {
  const pay = env.SOLANA_ADDRESS
    ? `\n\nPay at the bar, or send SOL / USDC (Solana) to:\n<code>${escapeHtml(env.SOLANA_ADDRESS)}</code>`
    : "";
  return `🧾 <b>Order #${order.num}</b> · ${drink.name}\nGot it! We'll message you here when it's ready.${pay}`;
}

// Order placed from the chat buttons: the menu message turns into the receipt.
async function placeOrder(env, chatId, messageId, from, drink) {
  const { order, error } = await createOrder(env, chatId, from, drink);
  return edit(env, chatId, messageId, error || receiptText(env, order, drink));
}

// ---------- Barista flow ----------

async function isBaristaChat(env, chatId) {
  return String(chatId) === (await getSetting(env, "barista_chat"));
}

async function finishOrder(env, chatId, messageId, orderId, status) {
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
  if (!order) return;
  const drink = drinkById(order.drink) || { name: order.drink };
  if (order.status !== "pending") {
    // Already handled (double tap, or two baristas): just clear the buttons.
    return edit(env, chatId, messageId, `${order.status === "ready" ? "✅" : "❌"} <b>#${order.num} · ${drink.name}</b>\n👤 ${escapeHtml(order.customer_name)}`);
  }
  await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ? AND status = 'pending'").bind(status, orderId).run();
  console.log(`order ${status}`, JSON.stringify({ num: order.num, drink: order.drink }));

  if (status === "ready") {
    await send(env, order.customer_chat, `🏝️ <b>Your ${drink.name} is ready!</b>\nOrder #${order.num}. Pick it up at the bar ☕`);
  } else {
    await send(env, order.customer_chat, `Sorry, we couldn't make order #${order.num} (${drink.name}). Please come talk to us at the bar 🙏`);
  }
  const label = status === "ready" ? "✅ Ready" : "❌ Cancelled";
  await edit(env, chatId, messageId, `${label} · <b>#${order.num} · ${drink.name}</b>\n👤 ${escapeHtml(order.customer_name)}`);
}

async function todayReport(env, chatId) {
  const day = localDay();
  const { results } = await env.DB.prepare(
    "SELECT drink, COUNT(*) AS n FROM orders WHERE day = ? AND status != 'cancelled' GROUP BY drink ORDER BY n DESC"
  ).bind(day).all();
  const pending = await env.DB.prepare("SELECT COUNT(*) AS n FROM orders WHERE day = ? AND status = 'pending'").bind(day).first();
  const total = results.reduce((sum, r) => sum + r.n, 0);
  if (!total) return send(env, chatId, `📊 <b>Today (${day})</b>\nNo orders through the bot yet.`);
  const lines = results.map(r => `${(drinkById(r.drink) || { name: r.drink }).name}: <b>${r.n}</b>`);
  return send(env, chatId, `📊 <b>Today (${day})</b>\n${lines.join("\n")}\n\nTotal: <b>${total}</b> · Waiting: <b>${pending.n}</b>`);
}

async function queue(env, chatId) {
  const { results } = await env.DB.prepare(
    "SELECT num, drink, customer_name FROM orders WHERE status = 'pending' ORDER BY id"
  ).all();
  if (!results.length) return send(env, chatId, "🙌 No drinks waiting.");
  const lines = results.map(o => `#${o.num} · ${(drinkById(o.drink) || { name: o.drink }).name} · ${escapeHtml(o.customer_name)}`);
  return send(env, chatId, `⏳ <b>Waiting (${results.length})</b>\n${lines.join("\n")}`);
}

const BARISTA_HELP =
  "Barista commands:\n/today: today's count\n/queue: drinks waiting\n/close: stop taking orders\n/open: start taking orders";

// ---------- Update routing ----------

async function onMessage(env, message) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();
  const [command, ...args] = text.split(/\s+/);
  const cmd = command.toLowerCase().replace(/@\w+$/, "");

  if (cmd === "/barista") {
    if (env.BARISTA_CODE && args[0] === env.BARISTA_CODE) {
      await setSetting(env, "barista_chat", chatId);
      return send(env, chatId, `✅ Orders will arrive in this chat.\n\n${BARISTA_HELP}`);
    }
    return send(env, chatId, "That code doesn't match.");
  }

  if (await isBaristaChat(env, chatId)) {
    if (cmd === "/today") return todayReport(env, chatId);
    if (cmd === "/queue") return queue(env, chatId);
    if (cmd === "/close") { await setSetting(env, "open", "0"); return send(env, chatId, "🌙 Closed. New orders are paused."); }
    if (cmd === "/open") { await setSetting(env, "open", "1"); return send(env, chatId, "☀️ Open. Taking orders."); }
    if (message.chat.type !== "private") return; // stay quiet in a group
    if (cmd === "/help") return send(env, chatId, BARISTA_HELP);
  }

  // Anything else from a customer shows the menu.
  if (message.chat.type === "private") return showMenu(env, chatId);
}

async function onCallback(env, cb) {
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;
  const data = cb.data || "";
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });

  if (data === "menu") return showMenu(env, chatId, messageId);
  if (data.startsWith("d:")) {
    const drink = drinkById(data.slice(2));
    return drink ? askConfirm(env, chatId, messageId, drink) : showMenu(env, chatId, messageId);
  }
  if (data.startsWith("c:")) {
    const drink = drinkById(data.slice(2));
    return drink ? placeOrder(env, chatId, messageId, cb.from, drink) : showMenu(env, chatId, messageId);
  }
  if (data.startsWith("r:") || data.startsWith("k:")) {
    if (!(await isBaristaChat(env, chatId))) return;
    return finishOrder(env, chatId, messageId, Number(data.slice(2)), data[0] === "r" ? "ready" : "cancelled");
  }
}

// ---------- Webhook health ----------

// Runs every minute: re-registers the webhook when Telegram lost it (e.g. after
// /revoke in BotFather) or keeps rejecting deliveries.
async function ensureWebhook(env) {
  const info = await tg(env, "getWebhookInfo", {});
  if (!info.ok) return; // bad BOT_TOKEN: already logged by tg()
  const { url, pending_update_count, last_error_message } = info.result;
  console.log("webhook info", JSON.stringify({ url, pending_update_count, last_error_message }));
  const rejected = last_error_message && /403|401|Forbidden|Unauthorized/.test(last_error_message);
  if (url === env.WEBHOOK_URL && !rejected) return;
  const res = await tg(env, "setWebhook", {
    url: env.WEBHOOK_URL,
    secret_token: env.WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
  });
  console.log("webhook reset", JSON.stringify(res));
}

// Puts the "Order ☕" button (opens the Mini App) next to the chat input.
async function ensureMenuButton(env) {
  const current = await tg(env, "getChatMenuButton", {});
  if (current.ok && current.result.type === "web_app" && current.result.web_app?.url === appUrl(env)) return;
  const res = await tg(env, "setChatMenuButton", { menu_button: { type: "web_app", text: "Order ☕", web_app: { url: appUrl(env) } } });
  console.log("menu button set", JSON.stringify(res));
}

// ---------- Mini App API ----------

async function todaysOrders(env, chatId) {
  const { results } = await env.DB.prepare(
    "SELECT num, drink, status FROM orders WHERE customer_chat = ? AND day = ? ORDER BY id DESC LIMIT 5"
  ).bind(chatId, localDay()).all();
  return results;
}

// GET /health: is the worker up, can it reach the database, are orders open?
async function health(env) {
  try {
    const today = await env.DB.prepare(
      "SELECT COUNT(*) AS orders, SUM(status = 'pending') AS waiting FROM orders WHERE day = ?"
    ).bind(localDay()).first();
    return json({ ok: true, day: localDay(), open: await isOpen(env), barista_set: !!(await getSetting(env, "barista_chat")),
      orders_today: today.orders, waiting: today.waiting || 0 });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 500);
  }
}

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

async function handleApi(request, env, path) {
  if (request.method !== "POST") return json({ ok: false, error: "Use POST" }, 405);
  const body = await request.json().catch(() => ({}));
  const user = await verifyInitData(body.initData, env.BOT_TOKEN);
  if (!user) return json({ ok: false, error: "Please open the menu from the bot in Telegram." }, 401);

  if (path === "/api/session") {
    return json({ ok: true, user: { first_name: user.first_name || "" }, open: await isOpen(env), orders: await todaysOrders(env, user.id) });
  }
  if (path === "/api/order") {
    const drink = drinkById(body.drink);
    if (!drink) return json({ ok: false, error: "Pick a drink from the menu." }, 400);
    const { order, error } = await createOrder(env, user.id, user, drink);
    if (error) {
      console.log("order refused", JSON.stringify({ chat: user.id, drink: drink.id, error }));
      return json({ ok: false, error });
    }
    await send(env, user.id, receiptText(env, order, drink));
    return json({ ok: true, order: { num: order.num, drink: drink.id }, orders: await todaysOrders(env, user.id) });
  }
  return json({ ok: false, error: "Not found" }, 404);
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ensureWebhook(env).then(() => ensureMenuButton(env)));
  },

  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === "/app") {
      return new Response(miniAppHtml(DRINKS), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (path.startsWith("/api/")) return handleApi(request, env, path);
    if (path === "/health") return health(env);
    if (path === "/how-to-order.jpg") {
      const bytes = Uint8Array.from(atob(HOW_TO_ORDER_JPG), c => c.charCodeAt(0));
      return new Response(bytes, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } });
    }
    if (request.method !== "POST") return new Response("Beach Coffee Co. bot is running ☕");
    if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403 });
    }
    const update = await request.json().catch(() => null);
    try {
      if (update?.message) await onMessage(env, update.message);
      else if (update?.callback_query) await onCallback(env, update.callback_query);
    } catch (e) {
      console.log("update failed", e && e.stack);
    }
    // Always 200 so Telegram doesn't retry the same update forever.
    return new Response("ok");
  },
};

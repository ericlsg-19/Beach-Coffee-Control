// Beach Coffee Co. Telegram bot, running as a Cloudflare Worker.
//
// Customers order a drink from the menu; the order lands in the barista chat
// with Ready / Cancel buttons; tapping Ready messages the customer.
//
// Drinks are free. Tips and the Island DAO coffee bag are paid in USDC on Solana (see pay.js).
//
// Bindings (see wrangler.toml): DB (D1 database).
// Secrets: BOT_TOKEN, WEBHOOK_SECRET, BARISTA_CODE, SOLANA_RPC_URL (optional).
// Vars: WEBHOOK_URL, SOLANA_ADDRESS (receives tips and bag payments; empty turns them off), BAG_PRICE_USDC, BAG_STOCK.
//
// Routes: POST /         Telegram webhook (checked with WEBHOOK_SECRET)
//         GET  /app      the Mini App menu
//         POST /api/...  Mini App calls, authenticated with Telegram initData
//         GET  /pay      tip / coffee bag page (printed QR), /pay/<reference> checkout
//         /api/pay/...   payments, open to the web

import { miniAppHtml, MILK_DRINKS, MILKS, MILK_CHOICES, EVENT_ONLY } from "./miniapp.js";
import { verifyInitData } from "./initdata.js";
import { HOW_TO_ORDER_JPG } from "./howto.js";
import { ANCORA_HTML } from "./ancora-html.js";
import { WEB3_IIFE } from "./vendor/web3-iife.js";
import { payPageHtml } from "./paypage.js";
import { PRODUCTS, priceFor, newReference, isAddress, fromMicro, solanaPayUrl, walletLinks, qrSvg, findPayment, latestBlockhash, rpcStatus } from "./pay.js";

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
  { id: "icedcoffee", name: "Iced Coffee" },
  { id: "mocha",      name: "Mocha" },
  { id: "matcha",     name: "Matcha" },
  { id: "chocolate",  name: "Hot Chocolate" },
];

// Keep in step with the Âncora page (ancora/ancora.html): same menu, same version.
const VERSION = "1.7.9";

const TIME_ZONE = "America/Sao_Paulo";
const MAX_PENDING_PER_CUSTOMER = 3;
// 23:00 in Florianópolis (UTC−3). Must match the second cron in wrangler.toml.
const DAILY_REPORT_CRON = "0 2 * * *";

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
  tg(env, "sendMessage", { chat_id, text, parse_mode: "HTML", reply_markup, link_preview_options: { is_disabled: true } });
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
// The bar is closed on weekends (Saturday and Sunday, bar time) unless /open opens that day (or the
// "weekends" setting is "open"), and any day after /close. closedText says why, for the guest; isOpen is the yes/no.
const WEEKEND_TEXT = "The barista is off touching sand 🏝️ Orders open again Monday. Keep building ☕";
const CLOSED_TEXT = "The bar is closed right now 🌙 Come back soon!";
const isWeekend = (date = new Date()) => ["Sat", "Sun"].includes(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(date));
async function closedText(env) {
  if ((await getSetting(env, "open")) === "0") return CLOSED_TEXT;
  if (isWeekend() && (await getSetting(env, "weekends")) !== "open" && (await getSetting(env, "open_day")) !== localDay()) return WEEKEND_TEXT;
  return null;
}
async function isOpen(env) {
  return !(await closedText(env));
}

// ---------- Lunch break (/lunch) ----------
//
// Every day the barista stops for lunch (13:00–14:00 bar time unless /lunch changes it). Orders still come
// in: the guest confirms the drink will be ready after lunch, and the barista sees it marked that way.

const LUNCH_DEFAULT = "13:00-14:00";
const nowHHMM = (date = new Date()) => new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
// "14:00" → "2 pm", "13:30" → "1:30 pm"
const clockLabel = hhmm => { const [h, m] = hhmm.split(":").map(Number); return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "am" : "pm"}`; };

async function lunchSetting(env) {
  const v = (await getSetting(env, "lunch")) || LUNCH_DEFAULT;
  const m = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(v);
  return m ? { from: m[1], until: m[2] } : null; // "off" or anything else: no break
}
// { from, until, label } while the break is on, null otherwise.
async function lunchBreak(env, now = nowHHMM()) {
  const l = await lunchSetting(env);
  return l && now >= l.from && now < l.until ? { ...l, label: clockLabel(l.until) } : null;
}

// /lunch → shows it. /lunch 12:30-13:30 to move it, /lunch off to stop it.
async function lunchCommand(env, args) {
  const a = (args[0] || "").toLowerCase();
  if (a === "off") await setSetting(env, "lunch", "off");
  else if (/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(a)) await setSetting(env, "lunch", a.split("-").map(t => t.padStart(5, "0")).join("-"));
  else if (a) return "Use /lunch 13:00-14:00, or /lunch off.";
  const l = await lunchSetting(env);
  if (!l) return "🍽️ No lunch break: orders are made right away.";
  return `🍽️ Lunch break every day ${l.from}–${l.until}.\nOrders still come in; guests confirm they'll be ready from ${l.until}.\n/lunch 12:30-13:30 to change it, /lunch off to stop it.`;
}

// ---------- Event day (/demoday) ----------
//
// For one day only: a short menu with a stock per drink and at most `max` drinks per guest that day.
// It's stored with the day it was turned on, so the next day the full menu is back by itself.

const EVENT_DEFAULT = { stock: { icedcoffee: 10, icedlatte: 10 }, max: 1 };
const drinksWord = n => (n === 1 ? "1 drink" : `${n} drinks`);
// Minutes a guest used to stand in line at the bar (timed at the Vila), now spent building instead.
const LINE_MINUTES = 5;

async function eventDay(env) {
  try {
    const e = JSON.parse((await getSetting(env, "event_day")) || "null");
    return e && e.day === localDay() ? e : null;
  } catch { return null; }
}

const ordersToday = (env, column, value) => env.DB.prepare(
  `SELECT COUNT(*) AS n FROM orders WHERE day = ? AND status != 'cancelled' AND ${column} = ?`
).bind(localDay(), value).first().then(r => r.n);

// What the Mini App needs on an event day: each drink with what's left, and how many this guest has had.
async function eventStatus(env, chatId) {
  const e = await eventDay(env);
  if (!e) return null;
  const drinks = [];
  for (const [id, stock] of Object.entries(e.stock)) drinks.push({ id, stock, left: Math.max(0, stock - await ordersToday(env, "drink", id)) });
  return { drinks, max: e.max, used: chatId ? await ordersToday(env, "customer_chat", chatId) : 0 };
}

async function eventText(env) {
  const s = await eventStatus(env);
  if (!s) return "Event day is off: the full menu is on.";
  const name = id => (drinkById(id) || { name: id }).name;
  return [`🎤 <b>Event day</b> · today only, max ${drinksWord(s.max)} per guest`,
    ...s.drinks.map(d => `${name(d.id)}: <b>${d.left}</b> left of ${d.stock}`),
    "", "The full menu comes back tomorrow, or now with /demoday off."].join("\n");
}

// /demoday → Iced Coffee 10 and Iced Latte 10, max 1 per guest. /demoday icedcoffee=15 icedlatte=10 max=2 to change it. /demoday off.
async function demoDayCommand(env, args) {
  if ((args[0] || "").toLowerCase() === "off") { await setSetting(env, "event_day", ""); return eventText(env); }
  const stock = {}; let max = EVENT_DEFAULT.max;
  for (const a of args) {
    const [k, v] = a.toLowerCase().split("=");
    if (k === "max" && /^\d+$/.test(v || "")) max = Number(v);
    else if (drinkById(k) && /^\d+$/.test(v || "")) stock[k] = Number(v);
  }
  const e = { day: localDay(), stock: Object.keys(stock).length ? stock : EVENT_DEFAULT.stock, max };
  await setSetting(env, "event_day", JSON.stringify(e));
  return eventText(env);
}

// ---------- Customer flow ----------

async function showMenu(env, chatId, messageId) {
  const closed = await closedText(env);
  if (closed) {
    const text = closed;
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
// milk: a key of MILKS for a drink made with milk; anything else means regular.
async function createOrder(env, chatId, from, drink, milk = "") {
  if (!MILKS[milk] || !MILK_DRINKS.includes(drink.id)) milk = "";
  const closed = await closedText(env);
  if (closed) return { error: closed };

  const baristaChat = await getSetting(env, "barista_chat");
  if (!baristaChat) return { error: "Orders aren't open yet. Please order at the bar 🙏" };

  const pending = await env.DB.prepare("SELECT COUNT(*) AS n FROM orders WHERE customer_chat = ? AND status = 'pending'")
    .bind(chatId).first();
  if (pending.n >= MAX_PENDING_PER_CUSTOMER) {
    return { error: `You already have ${pending.n} drinks on the way. We'll message you as soon as they're ready ☕` };
  }

  const event = await eventDay(env);
  if (event) {
    if (!(drink.id in event.stock)) {
      const names = Object.keys(event.stock).map(id => (drinkById(id) || { name: id }).name).join(" or ");
      return { error: `Today it's ${names} only. Pick one of those ☕` };
    }
    if (await ordersToday(env, "drink", drink.id) >= event.stock[drink.id]) return { error: `${drink.name} is sold out for today 🙏` };
    if (await ordersToday(env, "customer_chat", chatId) >= event.max) return { error: `That's your ${event.max === 1 ? "drink" : drinksWord(event.max)} for today 🙌 See you tomorrow!` };
  } else if (EVENT_ONLY.includes(drink.id)) {
    return { error: "Pick a drink from the menu." };
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
  if (milk) {
    order.milk = milk;
    await env.DB.prepare("INSERT INTO order_extras (order_id, milk) VALUES (?, ?)").bind(order.id, milk).run();
  }

  const lunch = await lunchBreak(env);
  if (lunch) order.lunch = lunch.until;
  const msg = await send(env, baristaChat,
    `🆕 <b>#${order.num} · ${drink.name}</b>${milk ? `\n🥛 <b>${MILKS[milk]}</b>` : ""}\n👤 ${escapeHtml(name)}\n🕐 ${localTime(createdAt)}` +
      (lunch ? `\n🍽️ <b>After lunch</b> · from ${lunch.until}` : ""),
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

// No payment details here: drinks are free.
function receiptText(order, drink) {
  return `🧾 <b>Order #${order.num}</b> · ${drink.name}${order.milk ? ` · ${MILKS[order.milk]}` : ""}\n` + (order.lunch
    ? `Got it! The barista is on lunch break 🍽️ Your drink will be ready from ${clockLabel(order.lunch)}. We'll message you here.`
    : "Got it! We'll message you here when it's ready.");
}

// Order placed from the chat buttons: the menu message turns into the receipt.
async function placeOrder(env, chatId, messageId, from, drink) {
  const { order, error } = await createOrder(env, chatId, from, drink);
  return edit(env, chatId, messageId, error || receiptText(order, drink));
}

// ---------- Barista flow ----------

async function isBaristaChat(env, chatId) {
  return String(chatId) === (await getSetting(env, "barista_chat"));
}

// The time an order was marked ready (none when it's set back to pending).
async function markReadyTime(env, orderId, ready) {
  if (ready) await env.DB.prepare("INSERT OR REPLACE INTO order_times (order_id, ready_at) VALUES (?, ?)").bind(orderId, new Date().toISOString()).run();
  else await env.DB.prepare("DELETE FROM order_times WHERE order_id = ?").bind(orderId).run();
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
  if (status === "ready") await markReadyTime(env, orderId, true);
  console.log(`order ${status}`, JSON.stringify({ num: order.num, drink: order.drink }));

  if (status === "ready") {
    await send(env, order.customer_chat, `🏝️ <b>Your ${drink.name} is ready!</b>\nOrder #${order.num}. Pick it up at the bar ☕`);
  } else {
    await send(env, order.customer_chat, `Sorry, we couldn't make order #${order.num} (${drink.name}). Please come talk to us at the bar 🙏`);
  }
  const label = status === "ready" ? "✅ Ready" : "❌ Cancelled";
  await edit(env, chatId, messageId, `${label} · <b>#${order.num} · ${drink.name}</b>\n👤 ${escapeHtml(order.customer_name)}`);
}

// Summary of one day (Telegram and bar orders together), sent by /today, /report and the nightly cron.
async function dayReport(env, day) {
  const { results } = await env.DB.prepare(
    "SELECT drink, customer_chat, status, created_at FROM orders WHERE day = ? AND status != 'cancelled'"
  ).bind(day).all();
  const label = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${day}T12:00:00Z`));
  const sales = await salesLines(env, day);
  if (!results.length) return [`📊 <b>${label}</b>`, "No orders yet.", ...sales].join("\n");

  const count = (list, key) => list.reduce((m, o) => m.set(key(o), (m.get(key(o)) || 0) + 1), new Map());
  const byDrink = [...count(results, o => o.drink)].sort((a, b) => b[1] - a[1]);
  const byHour = [...count(results, o => localTime(o.created_at).slice(0, 2))].sort((a, b) => b[1] - a[1]);
  const telegram = results.filter(o => o.customer_chat !== 0);
  const customers = new Set(telegram.map(o => o.customer_chat)).size;
  const waiting = results.filter(o => o.status === "pending").length;
  const name = id => (drinkById(id) || { name: id }).name;
  const [peakHour, peakCount] = byHour[0];
  const [top] = await ranking(env, day);

  return [
    `📊 <b>${label}</b>`,
    `Total: <b>${results.length}</b> drinks · Telegram ${telegram.length} · Bar ${results.length - telegram.length}`,
    "",
    ...byDrink.map(([id, n]) => `${name(id)}: <b>${n}</b>`),
    "",
    `⭐ Top drink: ${name(byDrink[0][0])}`,
    `⏰ Busiest hour: ${peakHour}:00–${String((Number(peakHour) + 1) % 24).padStart(2, "0")}:00 (${peakCount})`,
    `👥 Telegram customers: ${customers}`,
    ...(top ? [`🏆 Top customer: ${escapeHtml(top.name)} (${top.drinks})`] : []),
    `⏳ Still waiting: ${waiting}`,
    ...(sales.length ? ["", ...sales] : []),
  ].join("\n");
}

// The whole event so far, every day together: /total.
async function eventReport(env) {
  const { results } = await env.DB.prepare(
    "SELECT day, drink, customer_chat FROM orders WHERE status != 'cancelled'"
  ).all();
  const { results: paid } = await env.DB.prepare(
    "SELECT kind, COUNT(*) AS n, SUM(amount_micro) AS micro FROM payments WHERE status = 'paid' GROUP BY kind"
  ).all();
  const tips = paid.find(r => r.kind === "tip"), bags = paid.find(r => r.kind === "bag");
  const sales = [
    ...(tips ? [`💛 Tips: ${tips.n} · ${usdc(tips.micro)}`] : []),
    ...(bags ? [`🛍️ Coffee bags: ${bags.n} · ${usdc(bags.micro)}`] : []),
  ];
  if (!results.length) return ["📈 <b>Event so far</b>", "No orders yet.", ...sales].join("\n");

  const count = key => [...results.reduce((m, o) => m.set(key(o), (m.get(key(o)) || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const byDrink = count(o => o.drink), byDay = count(o => o.day);
  const days = byDay.map(([d]) => d).sort();
  const telegram = results.filter(o => o.customer_chat !== 0);
  const name = id => (drinkById(id) || { name: id }).name;
  const dayLabel = day => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${day}T12:00:00Z`));
  const [top] = await ranking(env);
  const timed = await env.DB.prepare(
    `SELECT COUNT(*) AS n, AVG((julianday(t.ready_at) - julianday(o.created_at)) * 1440) AS minutes
     FROM orders o JOIN order_times t ON t.order_id = o.id WHERE o.customer_chat != 0 AND o.status = 'ready'`
  ).first();
  const backHours = telegram.length * LINE_MINUTES / 60;

  return [
    `📈 <b>Event so far</b> · since ${dayLabel(days[0])} (${days.length} day${days.length === 1 ? "" : "s"})`,
    `Total: <b>${results.length}</b> drinks · Telegram ${telegram.length} · Bar ${results.length - telegram.length}`,
    `Average: ${Math.round(results.length / days.length)} a day · Best day: ${dayLabel(byDay[0][0])} (${byDay[0][1]})`,
    "",
    ...byDrink.map(([id, n]) => `${name(id)}: <b>${n}</b>`),
    "",
    `⭐ Top drink: ${name(byDrink[0][0])}`,
    `👥 Telegram customers: ${new Set(telegram.map(o => o.customer_chat)).size}`,
    ...(top ? [`🏆 Top customer: ${escapeHtml(top.name)} (${top.drinks})`] : []),
    "",
    `🕐 Time back to build: ~${backHours.toFixed(1)} h (${telegram.length} Telegram orders × ${LINE_MINUTES} min not spent in line)`,
    ...(timed.n ? [`⏱️ Tap → ready: ${Math.round(timed.minutes)} min on average (${timed.n} timed)`] : []),
    ...(sales.length ? ["", ...sales] : []),
  ].join("\n");
}

async function sendDailyReport(env) {
  const chat = await getSetting(env, "barista_chat");
  if (!chat) return;
  const text = await dayReport(env, localDay());
  await send(env, chat, `🌙 <b>End of day</b>\n\n${text}`);
  console.log("daily report sent", JSON.stringify({ day: localDay() }));
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
  "Barista commands:\n/today: today's report\n/report YYYY-MM-DD: report for another day\n/total: the whole event so far\n/demoday: today only, Iced Coffee 10 + Iced Latte 10, max 1 per guest (/demoday off to stop)\n/lunch: the daily lunch break, 13:00–14:00 (/lunch 12:30-13:30 to move it, /lunch off)\n/queue: drinks waiting\n/ranking: who ordered the most\n/panel: open Âncora, the barista panel\n/bags: Island DAO coffee bags sold and left (/bags 17 sets how many are left)\n/close: stop taking orders\n/open: start taking orders (on Saturday or Sunday, just that day: weekends are closed by default)\n\nTips and coffee bags paid in USDC arrive here too, and show up in /today.";

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
    if (cmd === "/today") return send(env, chatId, await dayReport(env, localDay()));
    if (cmd === "/demoday") return send(env, chatId, await demoDayCommand(env, args));
    if (cmd === "/lunch") return send(env, chatId, await lunchCommand(env, args));
    if (cmd === "/total") return send(env, chatId, await eventReport(env));
    if (cmd === "/report") {
      const day = /^\d{4}-\d{2}-\d{2}$/.test(args[0] || "") ? args[0] : localDay();
      return send(env, chatId, await dayReport(env, day));
    }
    if (cmd === "/panel") {
      return send(env, chatId, "🧾 <b>Âncora</b>: the barista panel with every order (Telegram and bar) and the day-by-day summary.",
        { inline_keyboard: [[{ text: "Open the panel", url: `${env.WEBHOOK_URL}/panel#key=${encodeURIComponent(env.BARISTA_CODE)}` }]] });
    }
    if (cmd === "/queue") return queue(env, chatId);
    if (cmd === "/ranking") return send(env, chatId, await rankingText(env));
    if (cmd === "/bags") return send(env, chatId, await bagsCommand(env, args));
    if (cmd === "/close") {
      await setSetting(env, "open", "0"); await setSetting(env, "open_day", "");
      return send(env, chatId, "🌙 Closed. New orders are paused until /open.");
    }
    if (cmd === "/open") {
      // On a weekend /open opens just today; the next weekend day is closed again by itself.
      await setSetting(env, "open", "1"); await setSetting(env, "open_day", isWeekend() ? localDay() : "");
      return send(env, chatId, isWeekend() ? "☀️ Open today (weekend). Taking orders." : "☀️ Open. Taking orders.");
    }
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
  if (data.startsWith("h:")) {
    if (!(await isBaristaChat(env, chatId))) return;
    return handOverBag(env, chatId, messageId, Number(data.slice(2)));
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

// ---------- Ranking ----------
//
// Telegram customers ordered by drinks (cancelled orders don't count). On a tie, whoever got
// there first stays ahead. Bar orders have no customer identity, so they're not ranked.

async function ranking(env, day) {
  const stmt = env.DB.prepare(
    `SELECT customer_chat AS chat, MAX(customer_name) AS name, COUNT(*) AS drinks, MAX(created_at) AS last
     FROM orders WHERE customer_chat != 0 AND status != 'cancelled' ${day ? "AND day = ?" : ""}
     GROUP BY customer_chat ORDER BY drinks DESC, last ASC`
  );
  const { results } = await (day ? stmt.bind(day) : stmt).all();
  return results.map((r, i) => ({ rank: i + 1, ...r }));
}

// "Ana Souza (@ana)" → "Ana S.": what other customers see in the Mini App.
function publicName(name) {
  const words = String(name || "").replace(/\s*\(@[^)]*\)\s*$/, "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "Coffee lover";
  return words.length > 1 ? `${words[0]} ${words[words.length - 1][0].toUpperCase()}.` : words[0];
}

async function rankingForCustomer(env, chatId) {
  const all = await ranking(env);
  const me = all.find(r => r.chat === chatId);
  return {
    top: all.slice(0, 10).map(r => ({ rank: r.rank, name: publicName(r.name), drinks: r.drinks, me: r.chat === chatId })),
    me: me ? { rank: me.rank, drinks: me.drinks } : null,
    total: all.length,
  };
}

async function rankingText(env) {
  const all = await ranking(env);
  if (!all.length) return "🏆 <b>Ranking</b>\nNo Telegram orders yet.";
  const medal = r => ["🥇", "🥈", "🥉"][r.rank - 1] || `${r.rank}.`;
  return ["🏆 <b>Ranking · whole event</b>", ...all.slice(0, 10).map(r => `${medal(r)} ${escapeHtml(r.name)} · <b>${r.drinks}</b>`)].join("\n");
}

async function todaysOrders(env, chatId) {
  const { results } = await env.DB.prepare(
    "SELECT num, drink, status FROM orders WHERE customer_chat = ? AND day = ? ORDER BY id DESC LIMIT 5"
  ).bind(chatId, localDay()).all();
  return results;
}

// GET /health: is the worker up, can it reach the database, are orders open?
async function health(env, withRpc = false) {
  try {
    const today = await env.DB.prepare(
      "SELECT COUNT(*) AS orders, SUM(status = 'pending') AS waiting FROM orders WHERE day = ?"
    ).bind(localDay()).first();
    return json({ ok: true, version: VERSION, day: localDay(), open: await isOpen(env), barista_set: !!(await getSetting(env, "barista_chat")),
      orders_today: today.orders, waiting: today.waiting || 0, payments: paymentsOn(env),
      ...(withRpc && paymentsOn(env) ? { rpc: await rpcStatus(env), last_payment_check: JSON.parse(await getSetting(env, "last_payment_check") || "null") } : {}) });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 500);
  }
}

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

// ---------- Âncora panel API (barista only) ----------
//
// The Âncora page (ancora/ancora.html) is served at /panel and reads and writes orders
// here, so Telegram orders and bar orders share one database. Bar orders have customer_chat 0.

const isBarOrder = o => o.customer_chat === 0;

function panelOrder(o) {
  return {
    id: String(o.id), drink: o.drink, day: o.day, time: o.created_at, done: o.status === "ready", milk: MILKS[o.milk] || "",
    customer: isBarOrder(o) ? o.customer_name : `${o.customer_name} · Telegram`,
    source: isBarOrder(o) ? "bar" : "telegram",
  };
}

async function handlePanelApi(request, env, path) {
  if (!env.BARISTA_CODE || request.headers.get("X-Barista-Code") !== env.BARISTA_CODE) {
    return json({ ok: false, error: "Wrong barista code." }, 401);
  }
  const id = Number(path.split("/")[4]);

  if (path === "/api/panel/orders" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT o.*, e.milk FROM orders o LEFT JOIN order_extras e ON e.order_id = o.id WHERE o.status != 'cancelled' ORDER BY o.id"
    ).all();
    return json({ ok: true, orders: results.map(panelOrder) });
  }
  if (path === "/api/panel/ranking") {
    return json({ ok: true, ranking: (await ranking(env)).map(({ rank, name, drinks, last }) => ({ rank, name, drinks, last })) });
  }
  if (path === "/api/panel/orders" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const drink = drinkById(body.drink);
    if (!drink) return json({ ok: false, error: "Unknown drink." }, 400);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(body.day || "") ? body.day : localDay();
    const order = await env.DB.prepare(
      `INSERT INTO orders (day, num, created_at, drink, customer_chat, customer_name)
       VALUES (?1, (SELECT COALESCE(MAX(num), 0) + 1 FROM orders WHERE day = ?1), ?2, ?3, 0, ?4)
       RETURNING *`
    ).bind(day, new Date().toISOString(), drink.id, String(body.customer || "").slice(0, 80)).first();
    console.log("order created", JSON.stringify({ num: order.num, drink: drink.id, source: "bar" }));
    return json({ ok: true, order: panelOrder(order) });
  }

  if (path === "/api/panel/payments" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM payments WHERE status = 'paid' ORDER BY id").all();
    return json({ ok: true, payments: results.map(panelPayment), bags_left: await bagsLeft(env) });
  }
  if (path.startsWith("/api/panel/payments/") && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const p = await env.DB.prepare("UPDATE payments SET handed_over = ? WHERE id = ? AND kind = 'bag' AND status = 'paid' RETURNING *")
      .bind(body.handed ? 1 : 0, id).first();
    return p ? json({ ok: true, payment: panelPayment(p) }) : json({ ok: false, error: "Payment not found." }, 404);
  }

  const order = id ? await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first() : null;
  if (!order) return json({ ok: false, error: "Order not found." }, 404);
  const baristaChat = await getSetting(env, "barista_chat");

  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (body.done && order.status === "pending" && !isBarOrder(order)) {
      // Same as tapping Ready in Telegram: the customer gets the message.
      await finishOrder(env, baristaChat, order.barista_message_id, order.id, "ready");
    } else {
      await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.done ? "ready" : "pending", order.id).run();
      await markReadyTime(env, order.id, !!body.done);
    }
    return json({ ok: true });
  }
  if (request.method === "DELETE") {
    if (isBarOrder(order)) {
      await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(order.id).run();
    } else if (order.status === "pending") {
      await finishOrder(env, baristaChat, order.barista_message_id, order.id, "cancelled");
    } else {
      await env.DB.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").bind(order.id).run();
    }
    return json({ ok: true });
  }
  return json({ ok: false, error: "Not found" }, 404);
}

function panelHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${ANCORA_HTML}</body></html>`;
}

async function handleApi(request, env, path) {
  if (request.method !== "POST") return json({ ok: false, error: "Use POST" }, 405);
  const body = await request.json().catch(() => ({}));
  const user = await verifyInitData(body.initData, env.BOT_TOKEN);
  if (!user) return json({ ok: false, error: "Please open the menu from the bot in Telegram." }, 401);

  if (path === "/api/session") {
    return json({ ok: true, user: { first_name: user.first_name || "" }, open: await isOpen(env), orders: await todaysOrders(env, user.id),
      event: await eventStatus(env, user.id), lunch: (await isOpen(env)) ? await lunchBreak(env) : null,
      closed: await closedText(env), ranking: await rankingForCustomer(env, user.id) });
  }
  if (path === "/api/order") {
    const drink = drinkById(body.drink);
    if (!drink) return json({ ok: false, error: "Pick a drink from the menu." }, 400);
    if (MILK_DRINKS.includes(drink.id) && !MILK_CHOICES.includes(body.milk)) {
      return json({ ok: false, error: "Choose your milk first: regular, lactose-free or plant-based." }, 400);
    }
    // During lunch the guest must have seen and accepted "ready from 2 pm" first.
    const lunch = await lunchBreak(env);
    if (lunch && !body.afterLunch) return json({ ok: false, lunch, error: `The barista is on lunch break until ${lunch.label}.` });
    const { order, error } = await createOrder(env, user.id, user, drink, body.milk);
    if (error) {
      console.log("order refused", JSON.stringify({ chat: user.id, drink: drink.id, error }));
      return json({ ok: false, error });
    }
    await send(env, user.id, receiptText(order, drink));
    return json({ ok: true, order: { num: order.num, drink: drink.id, ...(order.milk ? { milk: order.milk } : {}), ...(order.lunch ? { lunch: clockLabel(order.lunch) } : {}) }, orders: await todaysOrders(env, user.id) });
  }
  return json({ ok: false, error: "Not found" }, 404);
}

// ---------- Tips and the coffee bag (USDC on Solana) ----------

const CHECK_WINDOW_MS = 2 * 60 * 60 * 1000; // the cron keeps looking for a payment for 2 hours
const EXPIRE_MS = 24 * 60 * 60 * 1000;      // after a day an unpaid checkout is dropped
const MAX_OPEN_PAYMENTS = 300;              // unpaid checkouts across everyone (against spam)
const MAX_OPEN_PER_CUSTOMER = 5;
const usdc = micro => `${fromMicro(micro)} USDC`;
const paymentsOn = env => isAddress(env.SOLANA_ADDRESS);
const bagPrice = env => fromMicro(priceFor(env, "bag").micro || 0);
const BAG_HOLD_MS = 15 * 60 * 1000; // an unpaid bag checkout holds one bag for 15 minutes

// Limited edition: BAG_STOCK bags in total. null when no stock is set (no limit).
const bagStock = env => (/^\d+$/.test(String(env.BAG_STOCK ?? "")) ? Number(env.BAG_STOCK) : null);
// Bags sold outside the app (cash, at the bar) count too: /bags 17 says how many are left right now.
const bagsSoldInApp = env => env.DB.prepare("SELECT COUNT(*) AS n FROM payments WHERE kind = 'bag' AND status = 'paid'").first().then(r => r.n);
const bagsSoldOffline = async env => Number(await getSetting(env, "bags_sold_offline")) || 0;
async function bagsLeft(env) {
  const stock = bagStock(env);
  if (stock === null) return null;
  return Math.max(0, stock - await bagsSoldInApp(env) - await bagsSoldOffline(env));
}
async function bagsCommand(env, args) {
  const stock = bagStock(env), n = args[0];
  if (n !== undefined) {
    if (stock === null) return "No stock limit is set (BAG_STOCK).";
    const inApp = await bagsSoldInApp(env);
    if (!/^\d+$/.test(n) || Number(n) > stock - inApp) return `Use /bags N, the bags left now (at most ${stock - inApp}: ${inApp} were sold in the app).`;
    await setSetting(env, "bags_sold_offline", String(stock - inApp - Number(n)));
  }
  return bagsText(env);
}
async function bagsText(env) {
  const stock = bagStock(env), left = await bagsLeft(env);
  const sold = await env.DB.prepare("SELECT COUNT(*) AS n, SUM(handed_over) AS handed FROM payments WHERE kind = 'bag' AND status = 'paid'").first();
  const offline = await bagsSoldOffline(env);
  return [`🛍️ <b>Island DAO coffee bags</b> · ${bagPrice(env)} USDC`,
    `Sold in the app: <b>${sold.n}</b> · handed over: ${sold.handed || 0}` + (offline ? `\nSold at the bar: <b>${offline}</b>` : ""),
    stock === null ? "No stock limit set." : `Left: <b>${left}</b> of ${stock}`].join("\n");
}
const payConfig = async env => ({ recipient: env.SOLANA_ADDRESS, bagPrice: bagPrice(env), bagStock: bagStock(env), bagsLeft: await bagsLeft(env) });
const payerName = p => p.customer_name || "Someone at the bar";

function publicPayment(env, p, base, withQr = false) {
  const page = `${base}/pay/${p.reference}`;
  const solanaPay = solanaPayUrl(env.SOLANA_ADDRESS, p);
  return {
    ref: p.reference, kind: p.kind, amount: fromMicro(p.amount_micro), micro: p.amount_micro, status: p.status, bagNo: p.id,
    page, solanaPay, ...walletLinks(page, base), ...(withQr ? { qr: qrSvg(solanaPay) } : {}),
  };
}

// Returns { payment } or { error } with a customer-facing message.
async function createPayment(env, { kind, amount, chat = 0, name = "" }) {
  if (!paymentsOn(env)) return { error: "Tips and coffee bags aren't open yet. Ask at the bar 🙏" };
  const price = priceFor(env, kind, amount);
  if (price.error) return price;
  const left = price.kind === "bag" ? await bagsLeft(env) : null;
  if (left !== null) {
    if (left <= 0) return { error: "The Island DAO coffee bags are sold out 🙏" };
    const held = await env.DB.prepare("SELECT COUNT(*) AS n FROM payments WHERE kind = 'bag' AND status = 'pending' AND created_at > ?")
      .bind(new Date(Date.now() - BAG_HOLD_MS).toISOString()).first();
    if (held.n >= left) return { error: "The last bags are being paid for right now. Try again in a few minutes." };
  }
  const since = new Date(Date.now() - CHECK_WINDOW_MS).toISOString();
  const open = await env.DB.prepare(
    "SELECT COUNT(*) AS n, COALESCE(SUM(customer_chat = ?), 0) AS mine FROM payments WHERE status = 'pending' AND created_at > ?"
  ).bind(chat, since).first();
  if (open.n >= MAX_OPEN_PAYMENTS || (chat && open.mine >= MAX_OPEN_PER_CUSTOMER)) {
    return { error: "Too many open payments right now. Try again in a few minutes." };
  }
  const p = await env.DB.prepare(
    `INSERT INTO payments (reference, kind, amount_micro, day, created_at, customer_chat, customer_name)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(newReference(), price.kind, price.micro, localDay(), new Date().toISOString(), chat, String(name).slice(0, 80)).first();
  console.log("payment created", JSON.stringify({ id: p.id, kind: p.kind, amount: fromMicro(p.amount_micro), chat }));
  return { payment: p };
}

// Looks the payment up on Solana; marks it paid and tells the barista (and the customer) once.
async function checkPayment(env, p) {
  if (p.status !== "pending" || !paymentsOn(env)) return p;
  await env.DB.prepare("UPDATE payments SET checked_at = ? WHERE id = ?").bind(new Date().toISOString(), p.id).run();
  let found;
  const trace = [];
  const note = info => setSetting(env, "last_payment_check", JSON.stringify({ id: p.id, at: new Date().toISOString(), ...info }));
  try {
    found = await findPayment(env, p, trace);
  } catch (e) {
    const error = String(e && e.message || e).slice(0, 300);
    console.log("payment check failed", JSON.stringify({ id: p.id, error }));
    await note({ error });
    return p;
  }
  if (!found) { await note({ found: false, trace }); return p; }
  await note({ found: true, signature: found.signature });
  let paid;
  try {
    paid = await env.DB.prepare(
      "UPDATE payments SET status = 'paid', signature = ?, payer = ?, paid_at = ? WHERE id = ? AND status = 'pending' RETURNING *"
    ).bind(found.signature, found.payer, new Date().toISOString(), p.id).first();
  } catch (e) {
    // signature is UNIQUE: one transaction can't pay for two checkouts.
    console.log("payment signature reused", JSON.stringify({ id: p.id, signature: found.signature }));
    return p;
  }
  if (!paid) return env.DB.prepare("SELECT * FROM payments WHERE id = ?").bind(p.id).first();
  console.log("payment paid", JSON.stringify({ id: paid.id, kind: paid.kind, amount: fromMicro(paid.amount_micro), signature: paid.signature }));
  await announcePayment(env, paid);
  return paid;
}

async function announcePayment(env, p) {
  const link = `<a href="https://solscan.io/tx/${p.signature}">View on Solscan</a>`;
  const baristaChat = await getSetting(env, "barista_chat");
  if (baristaChat && p.kind === "bag") {
    const left = await bagsLeft(env);
    await send(env, baristaChat,
      `🛍️ <b>Coffee bag #${p.id} paid · ${usdc(p.amount_micro)}</b>\n👤 ${escapeHtml(payerName(p))}\nHand them an Island DAO Limited Edition bag.` +
      (left === null ? "" : `\n📦 ${left} left`) + `\n${link}`,
      { inline_keyboard: [[{ text: "✅ Handed over", callback_data: `h:${p.id}` }]] });
  } else if (baristaChat) {
    await send(env, baristaChat, `💛 <b>Tip · ${usdc(p.amount_micro)}</b>\n👤 ${escapeHtml(payerName(p))}\n${link}`);
  }
  if (!p.customer_chat) return;
  await send(env, p.customer_chat, p.kind === "bag"
    ? `🛍️ <b>Paid! Coffee bag #${p.id} is yours.</b>\nShow this message at the bar to pick up your Island DAO Limited Edition bag.`
    : `💛 <b>Thank you for the ${usdc(p.amount_micro)} tip!</b>\nIt went straight to the barista. See you at the bar ☕`);
}

async function handOverBag(env, chatId, messageId, id) {
  const p = await env.DB.prepare("UPDATE payments SET handed_over = 1 WHERE id = ? AND kind = 'bag' AND status = 'paid' RETURNING *")
    .bind(id).first();
  if (!p) return;
  return edit(env, chatId, messageId, `✅ <b>Coffee bag #${p.id} handed over</b> · ${usdc(p.amount_micro)}\n👤 ${escapeHtml(payerName(p))}`);
}

// Every minute: look for the recent unpaid checkouts on Solana, and drop the old ones.
async function checkOpenPayments(env) {
  if (!paymentsOn(env)) return;
  const now = Date.now();
  const { results } = await env.DB.prepare(
    "SELECT * FROM payments WHERE status = 'pending' AND created_at > ? ORDER BY checked_at IS NOT NULL, checked_at LIMIT 20"
  ).bind(new Date(now - CHECK_WINDOW_MS).toISOString()).all();
  for (const p of results) await checkPayment(env, p);
  await env.DB.prepare("UPDATE payments SET status = 'expired' WHERE status = 'pending' AND created_at < ?")
    .bind(new Date(now - EXPIRE_MS).toISOString()).run();
}

async function salesLines(env, day) {
  const { results } = await env.DB.prepare(
    "SELECT kind, COUNT(*) AS n, SUM(amount_micro) AS micro FROM payments WHERE day = ? AND status = 'paid' GROUP BY kind"
  ).bind(day).all();
  const of = kind => results.find(r => r.kind === kind);
  const left = of("bag") ? await bagsLeft(env) : null;
  return [
    ...(of("tip") ? [`💛 Tips: ${of("tip").n} · ${usdc(of("tip").micro)}`] : []),
    ...(of("bag") ? [`🛍️ Coffee bags: ${of("bag").n} · ${usdc(of("bag").micro)}${left === null ? "" : ` (${left} left)`}`] : []),
  ];
}

function panelPayment(p) {
  return {
    id: String(p.id), kind: p.kind, amount: fromMicro(p.amount_micro), day: p.day, time: p.paid_at,
    customer: payerName(p) + (p.customer_chat ? " · Telegram" : ""), handed: !!p.handed_over, signature: p.signature,
  };
}

// /api/pay: open to the web (the printed QR leads to /pay). From the Mini App, initData names the customer.
async function handlePayApi(request, env, path, base) {
  if (path === "/api/pay" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const user = body.initData ? await verifyInitData(body.initData, env.BOT_TOKEN) : null;
    const { payment, error } = await createPayment(env, {
      kind: body.kind, amount: body.amount,
      chat: user ? user.id : 0, name: user ? customerName(user) : String(body.name || "").trim(),
    });
    if (error) return json({ ok: false, error });
    return json({ ok: true, payment: publicPayment(env, payment, base) });
  }
  if (path === "/api/pay/blockhash") {
    try {
      const { blockhash, lastValidBlockHeight } = await latestBlockhash(env);
      return json({ ok: true, blockhash, lastValidBlockHeight });
    } catch (e) {
      return json({ ok: false, error: "Solana is busy. Try again." }, 502);
    }
  }
  const ref = path.slice("/api/pay/".length);
  let p = await env.DB.prepare("SELECT * FROM payments WHERE reference = ?").bind(ref).first();
  if (!p) return json({ ok: false, error: "Payment not found." }, 404);
  // The page polls every few seconds; look at the chain at most every 3 s per payment.
  if (p.status === "pending" && (!p.checked_at || Date.now() - Date.parse(p.checked_at) > 3000)) p = await checkPayment(env, p);
  return json({ ok: true, payment: publicPayment(env, p, base) });
}

async function payPage(env, path, base) {
  const html = body => new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
  if (!paymentsOn(env)) return html("Tips and coffee bags aren't open yet. Ask at the bar ☕");
  let payment = null;
  if (path !== "/pay") {
    const p = await env.DB.prepare("SELECT * FROM payments WHERE reference = ?").bind(path.slice("/pay/".length)).first();
    if (!p || p.status === "expired") return Response.redirect(`${base}/pay`, 302);
    payment = publicPayment(env, p, base, true);
  }
  return html(payPageHtml({ ...(await payConfig(env)), payment }));
}

export default {
  async scheduled(event, env, ctx) {
    if (event.cron === DAILY_REPORT_CRON) return ctx.waitUntil(sendDailyReport(env));
    ctx.waitUntil(ensureWebhook(env).then(() => ensureMenuButton(env)));
    ctx.waitUntil(checkOpenPayments(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const base = env.WEBHOOK_URL || url.origin;
    // Pages opened on the old workers.dev address (printed cards, old links) move to our own domain, where
    // wallets don't flag the site. The fragment (Telegram's initData, the panel key) survives the redirect.
    if (request.method === "GET" && url.hostname.endsWith(".workers.dev") && base !== url.origin
      && (path === "/app" || path === "/panel" || path === "/pay" || path.startsWith("/pay/"))) {
      return Response.redirect(base + path + url.search, 301);
    }
    if (path === "/app") {
      const pay = paymentsOn(env) ? await payConfig(env) : null;
      return new Response(miniAppHtml(DRINKS, pay), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (path === "/pay" || path.startsWith("/pay/")) return payPage(env, path, base);
    if (path.startsWith("/api/pay")) return handlePayApi(request, env, path, base);
    if (path === "/vendor/web3.js") {
      return new Response(WEB3_IIFE, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "public, max-age=86400" } });
    }
    if (path === "/panel") return new Response(panelHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
    if (path.startsWith("/api/panel/")) return handlePanelApi(request, env, path);
    if (path.startsWith("/api/")) return handleApi(request, env, path);
    if (path === "/health") return health(env, url.searchParams.has("rpc"));
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

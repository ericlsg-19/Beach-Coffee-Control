// Finance: the operation's costs and income by day, entered in Âncora (Finance) and reported
// there, in /finance and in the end-of-day message.
//
// Costs and income are typed in BRL (finance_entries). Tips and coffee bags sold in the app are
// paid in USDC (payments, direct_transfers) and converted at the rate in the setting usdc_brl.
// Drinks are free, so they bring no income: profit = income + app bags − costs. Tips are kept
// apart (they're the barista's), and "profit + tips" shows both together.

export const COST_CATEGORIES = {
  coffee: "Coffee beans",
  milk: "Milk",
  supplies: "Other ingredients",
  cups: "Cups & packaging",
  staff: "Staff",
  transport: "Transport",
  venue: "Venue & fees",
  equipment: "Equipment",
  other: "Other cost",
};
export const INCOME_CATEGORIES = {
  event: "Event fee",
  sponsor: "Sponsor",
  bags: "Coffee bags (cash)",
  other: "Other income",
};
export const DEFAULT_USDC_BRL = 5.5;
const MAX_CENTS = 100_000_000; // R$ 1,000,000 per entry

const isDay = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

export async function usdcRate(env) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'usdc_brl'").first();
  const rate = Number(row && row.value);
  return rate > 0 ? rate : DEFAULT_USDC_BRL;
}
export async function setUsdcRate(env, value) {
  const rate = Number(String(value).replace(",", "."));
  if (!(rate > 0 && rate < 100)) return null;
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('usdc_brl', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(String(rate)).run();
  return rate;
}

// "12,50", "1.234,50", "12.5" or 12.5 → 1250 cents. null when it isn't a positive amount.
export function parseCents(value) {
  let s = String(value ?? "").trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(Number(s) * 100);
  return cents > 0 && cents <= MAX_CENTS ? cents : null;
}

export function publicEntry(e) {
  return { id: e.id, day: e.day, kind: e.kind, category: e.category, description: e.description, cents: e.amount_cents, time: e.created_at };
}

export async function addEntry(env, body, today) {
  const kind = body.kind === "income" ? "income" : body.kind === "cost" ? "cost" : null;
  if (!kind) return { error: "Pick cost or income." };
  const categories = kind === "cost" ? COST_CATEGORIES : INCOME_CATEGORIES;
  if (!categories[body.category]) return { error: "Pick a category." };
  const cents = parseCents(body.amount);
  if (!cents) return { error: "Type the amount in reais, like 120,50." };
  const entry = await env.DB.prepare(
    `INSERT INTO finance_entries (day, kind, category, description, amount_cents, created_at)
     VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(isDay(body.day) ? body.day : today, kind, body.category, String(body.description || "").trim().slice(0, 120), cents, new Date().toISOString()).first();
  return { entry: publicEntry(entry) };
}

export async function deleteEntry(env, id) {
  const gone = await env.DB.prepare("DELETE FROM finance_entries WHERE id = ? RETURNING id").bind(id).first();
  return !!gone;
}

// One row per day that has drinks, entries or USDC, newest first. Money in BRL cents, USDC in micro.
export async function financeDays(env) {
  const rate = await usdcRate(env);
  const days = new Map();
  const day = d => {
    if (!days.has(d)) days.set(d, { day: d, drinks: 0, costs: 0, income: 0, byCategory: {}, tipsMicro: 0, tips: 0, bagsMicro: 0, bagsCount: 0 });
    return days.get(d);
  };
  const { results: drinks } = await env.DB.prepare("SELECT day, COUNT(*) AS n FROM orders WHERE status != 'cancelled' GROUP BY day").all();
  for (const r of drinks) day(r.day).drinks = r.n;
  const { results: entries } = await env.DB.prepare(
    "SELECT day, kind, category, SUM(amount_cents) AS cents FROM finance_entries GROUP BY day, kind, category"
  ).all();
  for (const r of entries) {
    const d = day(r.day);
    d[r.kind === "income" ? "income" : "costs"] += r.cents;
    d.byCategory[`${r.kind}:${r.category}`] = r.cents;
  }
  const { results: paid } = await env.DB.prepare(
    "SELECT day, kind, COUNT(*) AS n, SUM(amount_micro) AS micro FROM payments WHERE status = 'paid' GROUP BY day, kind"
  ).all();
  const { results: direct } = await env.DB.prepare(
    "SELECT day, COUNT(*) AS n, SUM(amount_micro) AS micro FROM direct_transfers GROUP BY day"
  ).all();
  for (const r of paid) {
    const d = day(r.day);
    if (r.kind === "bag") { d.bagsMicro += r.micro; d.bagsCount += r.n; } else { d.tipsMicro += r.micro; d.tips += r.n; }
  }
  // USDC sent outside the app (no checkout) is almost always a tip.
  for (const r of direct) { const d = day(r.day); d.tipsMicro += r.micro; d.tips += r.n; }

  const toCents = micro => Math.round(micro / 1e6 * rate * 100);
  return [...days.values()].sort((a, b) => b.day.localeCompare(a.day)).map(d => withTotals(d, toCents));
}

function withTotals(d, toCents) {
  const tipsCents = toCents(d.tipsMicro), bagsCents = toCents(d.bagsMicro);
  const profit = d.income + bagsCents - d.costs;
  return { ...d, tipsCents, bagsCents, profit, profitWithTips: profit + tipsCents, costPerDrink: d.drinks ? Math.round(d.costs / d.drinks) : null };
}

// Every day together.
export function eventTotals(rows) {
  const t = { day: "total", drinks: 0, costs: 0, income: 0, byCategory: {}, tipsMicro: 0, tips: 0, bagsMicro: 0, bagsCount: 0, tipsCents: 0, bagsCents: 0, profit: 0, profitWithTips: 0 };
  for (const r of rows) {
    for (const k of ["drinks", "costs", "income", "tipsMicro", "tips", "bagsMicro", "bagsCount", "tipsCents", "bagsCents", "profit", "profitWithTips"]) t[k] += r[k];
    for (const [k, v] of Object.entries(r.byCategory)) t.byCategory[k] = (t.byCategory[k] || 0) + v;
  }
  return { ...t, days: rows.length, costPerDrink: t.drinks ? Math.round(t.costs / t.drinks) : null };
}

export const brl = cents => (cents < 0 ? "−" : "") + "R$ " + (Math.abs(cents) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usdcText = micro => `${+(micro / 1e6).toFixed(2)} USDC`;

function categoryLines(byCategory, kind, labels) {
  return Object.entries(labels)
    .filter(([id]) => byCategory[`${kind}:${id}`])
    .map(([id, name]) => `   ${name}: ${brl(byCategory[`${kind}:${id}`])}`);
}

// The finance block of one day (or the whole event), as Telegram HTML lines.
export function financeLines(row, rate) {
  return [
    `☕ Drinks: <b>${row.drinks}</b>${row.costPerDrink !== null && row.costs ? ` · cost per drink ${brl(row.costPerDrink)}` : ""}`,
    `🧾 Costs: <b>${brl(row.costs)}</b>`,
    ...categoryLines(row.byCategory, "cost", COST_CATEGORIES),
    `💵 Income: <b>${brl(row.income + row.bagsCents)}</b>`,
    ...categoryLines(row.byCategory, "income", INCOME_CATEGORIES),
    ...(row.bagsMicro ? [`   Coffee bags in the app: ${row.bagsCount} · ${usdcText(row.bagsMicro)} ≈ ${brl(row.bagsCents)}`] : []),
    `${row.profit >= 0 ? "📈" : "📉"} Profit: <b>${brl(row.profit)}</b>`,
    `💛 Tips: ${row.tips} · ${usdcText(row.tipsMicro)} ≈ ${brl(row.tipsCents)}`,
    `🏝️ Profit + tips: <b>${brl(row.profitWithTips)}</b>`,
    ...(row.tipsMicro || row.bagsMicro ? [`<i>1 USDC = ${brl(Math.round(rate * 100))}</i>`] : []),
  ];
}

export function hasFinance(row) {
  return !!(row && (row.costs || row.income));
}

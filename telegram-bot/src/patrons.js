// Top patrons: guests by USDC tipped (a separate board; tips never move the coffee race).
//
// Three sources: tips paid in the app by Telegram guests (payments), tips that reached the wallet
// outside the app (direct_transfers) once the bar team credits them to someone in Âncora, and tips
// the bot never saw, typed by hand (patron_tips, source 'manual'). A wallet credited once is
// remembered: its other transfers count for the same person.

const isDay = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
const isSignature = s => /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(s || "");

// "12", "2,5", "2.50" USDC → micro. null when it isn't a positive amount up to 100,000 USDC.
export function parseUsdc(value) {
  const s = String(value ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d{1,6})?$/.test(s)) return null;
  const micro = Math.round(Number(s) * 1e6);
  return micro > 0 && micro <= 100_000 * 1e6 ? micro : null;
}

// A Solscan link or a bare signature → the signature (or "" when there's none, null when it's wrong).
function signatureFrom(link) {
  const s = String(link || "").trim();
  if (!s) return "";
  const sig = s.includes("/tx/") ? s.split("/tx/")[1].split(/[?#/]/)[0] : s;
  return isSignature(sig) ? sig : null;
}

async function credits(env) {
  const { results } = await env.DB.prepare("SELECT * FROM patron_tips ORDER BY id").all();
  return results;
}

// Every tip that counts for the board, with who it belongs to: { key, chat, name, micro }.
async function patronTips(env) {
  const { results: paid } = await env.DB.prepare(
    "SELECT customer_chat AS chat, customer_name AS name, amount_micro AS micro, payer FROM payments WHERE kind = 'tip' AND status = 'paid' AND customer_chat != 0"
  ).all();
  const { results: direct } = await env.DB.prepare("SELECT * FROM direct_transfers").all();
  const all = await credits(env);
  const bySignature = new Map(all.filter(c => c.source === "transfer").map(c => [c.signature, c]));
  const who = c => ({ key: c.customer_chat ? `c${c.customer_chat}` : `n${c.name.trim().toLowerCase()}`, chat: c.customer_chat, name: c.name });
  // Wallets the team has credited, so the same wallet's other transfers go to the same person.
  const byWallet = new Map();
  for (const t of direct) { const c = bySignature.get(t.signature); if (c && t.payer) byWallet.set(t.payer, c); }
  for (const p of paid) if (p.payer && !byWallet.has(p.payer)) byWallet.set(p.payer, { customer_chat: p.chat, name: p.name });

  const tips = paid.map(p => ({ key: `c${p.chat}`, chat: p.chat, name: p.name, micro: p.micro }));
  for (const t of direct) {
    const c = bySignature.get(t.signature) || (t.payer && byWallet.get(t.payer));
    if (c) tips.push({ ...who(c), micro: t.amount_micro });
  }
  for (const c of all.filter(c => c.source === "manual")) tips.push({ ...who(c), micro: c.amount_micro });
  return { tips, direct, all, bySignature, byWallet };
}

export async function patrons(env, limit = 10) {
  const { tips } = await patronTips(env);
  const board = new Map();
  for (const t of tips) {
    const p = board.get(t.key) || { chat: t.chat, name: t.name, micro: 0, n: 0 };
    p.micro += t.micro; p.n += 1;
    if (t.chat && !p.chat) p.chat = t.chat;
    board.set(t.key, p);
  }
  return [...board.values()].sort((a, b) => b.micro - a.micro).slice(0, limit).map((p, i) => ({ rank: i + 1, ...p }));
}

// What Âncora shows to edit the board: the board, every transfer from outside the app (credited,
// remembered by wallet, or not yet), the tips typed by hand, and Telegram guests to pick from.
export async function patronsPanel(env) {
  const { direct, all, bySignature, byWallet } = await patronTips(env);
  const { results: guests } = await env.DB.prepare(
    "SELECT customer_chat AS chat, MAX(customer_name) AS name FROM orders WHERE customer_chat != 0 GROUP BY customer_chat ORDER BY name"
  ).all();
  return {
    patrons: (await patrons(env, 50)).map(p => ({ rank: p.rank, name: p.name, usdc: p.micro / 1e6, n: p.n, telegram: !!p.chat })),
    transfers: [...direct].sort((a, b) => b.at.localeCompare(a.at)).map(t => {
      const c = bySignature.get(t.signature), remembered = !c && t.payer && byWallet.get(t.payer);
      return { signature: t.signature, payer: t.payer, usdc: t.amount_micro / 1e6, day: t.day, at: t.at,
        credit: c ? { id: c.id, name: c.name } : remembered ? { name: remembered.name, wallet: true } : null };
    }),
    manual: all.filter(c => c.source === "manual").reverse().map(c => ({ id: c.id, name: c.name, usdc: c.amount_micro / 1e6, day: c.day, signature: c.signature || "" })),
    guests,
  };
}

// Credit a transfer from outside the app ({ signature, name, chat }) or add a tip by hand
// ({ name, amount, day, link, chat }). chat must be a Telegram guest who has ordered; their name is used.
export async function savePatronTip(env, body, today) {
  let name = String(body.name || "").trim().slice(0, 60), chat = 0;
  if (Number(body.chat)) {
    const guest = await env.DB.prepare("SELECT customer_chat AS chat, MAX(customer_name) AS name FROM orders WHERE customer_chat = ? GROUP BY customer_chat")
      .bind(Number(body.chat)).first();
    if (guest) { chat = guest.chat; name = guest.name; }
  }
  if (!name) return { error: "Type who it was." };
  const now = new Date().toISOString();

  if (body.signature) {
    const t = await env.DB.prepare("SELECT * FROM direct_transfers WHERE signature = ?").bind(body.signature).first();
    if (!t) return { error: "That transfer isn't in the list." };
    await env.DB.prepare(
      `INSERT INTO patron_tips (source, signature, customer_chat, name, amount_micro, day, created_at) VALUES ('transfer', ?, ?, ?, ?, ?, ?)
       ON CONFLICT(signature) DO UPDATE SET customer_chat = excluded.customer_chat, name = excluded.name`
    ).bind(t.signature, chat, name, t.amount_micro, t.day, now).run();
    return { ok: true };
  }

  const micro = parseUsdc(body.amount);
  if (!micro) return { error: "Type the amount in USDC, like 5 or 2.5." };
  const signature = signatureFrom(body.link);
  if (signature === null) return { error: "That doesn't look like a Solscan link." };
  if (signature) {
    const seen = await env.DB.prepare(
      "SELECT 1 FROM payments WHERE signature = ?1 UNION ALL SELECT 1 FROM direct_transfers WHERE signature = ?1 UNION ALL SELECT 1 FROM patron_tips WHERE signature = ?1"
    ).bind(signature).first();
    if (seen) return { error: "The bot already has that transaction: credit it in the list above instead." };
  }
  await env.DB.prepare(
    "INSERT INTO patron_tips (source, signature, customer_chat, name, amount_micro, day, created_at) VALUES ('manual', ?, ?, ?, ?, ?, ?)"
  ).bind(signature || null, chat, name, micro, isDay(body.day) ? body.day : today, now).run();
  return { ok: true };
}

export async function deletePatronTip(env, id) {
  return !!(await env.DB.prepare("DELETE FROM patron_tips WHERE id = ? RETURNING id").bind(id).first());
}

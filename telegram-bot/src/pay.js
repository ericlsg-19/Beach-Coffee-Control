// USDC payments on Solana for tips and the Island DAO coffee bag (drinks are free).
//
// Each payment gets a random "reference" key (Solana Pay). The wallet adds it to the
// transfer, so the worker finds the transaction with getSignaturesForAddress(reference)
// and checks that the recipient really received the amount in USDC.

import qrcode from "./vendor/qrcode.mjs";

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
// Public RPCs, tried in order after SOLANA_RPC_URL (set it, e.g. a free Helius URL, for the most
// reliable service). api.mainnet-beta.solana.com answers 403 "Access forbidden" to Cloudflare
// Workers and to web pages, so it's only the last resort.
export const PUBLIC_RPCS = ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];
const rpcUrls = env => [...new Set([env.SOLANA_RPC_URL, ...PUBLIC_RPCS].filter(Boolean))];
const hostOf = url => { try { return new URL(url).host; } catch (e) { return "rpc"; } };

export const TIP_PRESETS = [2, 5, 10];
const TIP_MIN = 1, TIP_MAX = 500;

export const PRODUCTS = {
  tip: { title: "Tip the barista", short: "Tip" },
  bag: { title: "Island DAO Limited Edition coffee bag", short: "Coffee bag", detail: "250 g arabica · special edition" },
};

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function base58(bytes) {
  let n = 0n;
  for (const b of bytes) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n; }
  for (const b of bytes) { if (b) break; out = "1" + out; }
  return out;
}
export const isAddress = s => typeof s === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
export const newReference = () => base58(crypto.getRandomValues(new Uint8Array(32)));

// USDC has 6 decimals; amounts are stored as integers ("micro") to avoid float errors.
export function toMicro(value) {
  const m = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(String(value ?? "").trim());
  return m ? Number(m[1]) * 1e6 + Number((m[2] || "").padEnd(2, "0")) * 1e4 : null;
}
export const fromMicro = micro => String(micro / 1e6);

// Validates what the customer picked. Returns { kind, micro } or { error }.
export function priceFor(env, kind, amount) {
  if (kind === "bag") {
    const micro = toMicro(env.BAG_PRICE_USDC || "10");
    return micro ? { kind, micro } : { error: "The coffee bag isn't for sale right now." };
  }
  if (kind === "tip") {
    const micro = toMicro(amount);
    if (!micro || micro < TIP_MIN * 1e6 || micro > TIP_MAX * 1e6) return { error: `Pick a tip between ${TIP_MIN} and ${TIP_MAX} USDC.` };
    return { kind, micro };
  }
  return { error: "Pick a tip or the coffee bag." };
}

// Solana Pay transfer request: what wallet apps read from the QR code.
export function solanaPayUrl(recipient, p) {
  const q = new URLSearchParams({
    amount: fromMicro(p.amount_micro), "spl-token": USDC_MINT, reference: p.reference,
    label: "Beach Coffee Co.", message: PRODUCTS[p.kind].title,
  });
  return `solana:${recipient}?${q.toString().replace(/\+/g, "%20")}`;
}

// Opens our payment page inside the wallet app's browser, where the page can ask the wallet to pay.
export function walletLinks(pageUrl, origin) {
  const u = encodeURIComponent(pageUrl), ref = encodeURIComponent(origin);
  return {
    phantom: `https://phantom.app/ul/browse/${u}?ref=${ref}`,
    solflare: `https://solflare.com/ul/v1/browse/${u}?ref=${ref}`,
  };
}

export function qrSvg(text) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#071110"/></svg>`;
}

// ---------- Checking the chain ----------

async function rpcAt(url, method, params) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error || !("result" in data)) throw new Error(`rpc ${method} ${hostOf(url)}: ${res.status} ${JSON.stringify(data.error || "")}`);
  return data.result;
}

// Asks each RPC in turn until one answers.
async function rpc(env, method, params) {
  const errors = [];
  for (const url of rpcUrls(env)) {
    try { return await rpcAt(url, method, params); } catch (e) { errors.push(String(e && e.message || e)); }
  }
  throw new Error(errors.join(" | "));
}

// For /health?rpc=1: which RPCs answer right now (hosts only; a key in the URL stays hidden).
export async function rpcStatus(env) {
  const out = [];
  for (const url of rpcUrls(env)) {
    // Both calls a payment needs: the blockhash (to build it) and the signature lookup (to confirm it).
    try {
      await rpcAt(url, "getLatestBlockhash", [{ commitment: "confirmed" }]);
      await rpcAt(url, "getSignaturesForAddress", [env.SOLANA_ADDRESS, { limit: 1, commitment: "confirmed" }]);
      out.push({ host: hostOf(url), ok: true });
    }
    catch (e) { out.push({ host: hostOf(url), ok: false, error: String(e && e.message || e).slice(0, 160) }); }
  }
  return out;
}

export const latestBlockhash = async env =>
  (await rpc(env, "getLatestBlockhash", [{ commitment: "confirmed" }])).value;

// USDC the recipient gained in this transaction, in micro units.
function received(meta, owner) {
  const sum = list => (list || [])
    .filter(b => b.owner === owner && b.mint === USDC_MINT)
    .reduce((n, b) => n + BigInt(b.uiTokenAmount.amount), 0n);
  return sum(meta.postTokenBalances) - sum(meta.preTokenBalances);
}

// Looks for a confirmed transaction carrying the payment's reference that paid the full amount.
// Returns { signature, payer } or null. `trace` collects why each transaction was skipped.
export async function findPayment(env, p, trace = []) {
  const sigs = await rpc(env, "getSignaturesForAddress", [p.reference, { limit: 10, commitment: "confirmed" }]);
  if (!sigs.length) trace.push("no transaction with this reference yet");
  for (const s of sigs) {
    const short = s.signature.slice(0, 12);
    if (s.err) { trace.push(`${short}: failed on chain`); continue; }
    const tx = await rpc(env, "getTransaction", [s.signature, { commitment: "confirmed", encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]);
    if (!tx || !tx.meta) { trace.push(`${short}: not readable yet`); continue; }
    if (tx.meta.err) { trace.push(`${short}: failed on chain`); continue; }
    const got = received(tx.meta, env.SOLANA_ADDRESS);
    if (got < BigInt(p.amount_micro)) trace.push(`${short}: received ${got} of ${p.amount_micro} micro-USDC`);
    if (got >= BigInt(p.amount_micro)) {
      const key = tx.transaction.message.accountKeys[0];
      return { signature: s.signature, payer: typeof key === "string" ? key : key.pubkey };
    }
  }
  return null;
}

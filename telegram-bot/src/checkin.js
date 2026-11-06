// Coffee check-in onchain, like the Island DAO check-in: the guest's wallet signs a small Solana
// transaction that only carries a memo ("Beach Coffee check-in | Latte | #12 | 2026-11-07"). No
// tokens move. The bar's check-in wallet (CHECKIN_KEY, a Cloudflare secret) is the fee payer, so the
// guest needs no SOL and pays nothing.
//
// Flow: the server builds the transaction and signs it as fee payer → the guest's wallet signs it
// (signTransaction) → the server checks it is exactly the transaction it built and sends it.

import { base58, isAddress, rpc } from "./pay.js";

export const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function base58Decode(s) {
  let n = 0n;
  for (const c of String(s)) {
    const i = B58.indexOf(c);
    if (i < 0) throw new Error("not base58");
    n = n * 58n + BigInt(i);
  }
  const bytes = [];
  while (n > 0n) { bytes.unshift(Number(n % 256n)); n /= 256n; }
  for (const c of String(s)) { if (c !== "1") break; bytes.unshift(0); }
  return Uint8Array.from(bytes);
}

const b64 = bytes => btoa(String.fromCharCode(...bytes));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const b64url = bytes => b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const equal = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
export { b64, unb64 };

// CHECKIN_KEY: the check-in wallet's secret key as wallets export it (base58, 64 bytes: seed + public key).
// Returns { address, sign(bytes) } or null when it isn't set or isn't valid.
const keyCache = new Map();
export async function checkinSigner(env) {
  const secret = String(env.CHECKIN_KEY || "").trim();
  if (!secret) return null;
  if (keyCache.has(secret)) return keyCache.get(secret);
  let signer = null;
  try {
    const raw = base58Decode(secret);
    if (raw.length !== 64) throw new Error("CHECKIN_KEY must be a 64-byte secret key");
    const seed = raw.slice(0, 32), pub = raw.slice(32);
    const jwk = { kty: "OKP", crv: "Ed25519", d: b64url(seed), x: b64url(pub) };
    let key;
    try { key = await crypto.subtle.importKey("jwk", jwk, { name: "Ed25519" }, false, ["sign"]); }
    catch (e) { key = await crypto.subtle.importKey("jwk", jwk, { name: "NODE-ED25519", namedCurve: "NODE-ED25519" }, false, ["sign"]); }
    const algo = key.algorithm && key.algorithm.name === "NODE-ED25519" ? "NODE-ED25519" : "Ed25519";
    const sign = async bytes => new Uint8Array(await crypto.subtle.sign(algo, key, bytes));
    // The public key in the secret must match the seed: sign once and verify.
    const probe = new Uint8Array([1, 2, 3]);
    if (!(await verifySignature(pub, await sign(probe), probe))) throw new Error("CHECKIN_KEY's public half doesn't match");
    signer = { address: base58(pub), publicKey: pub, sign };
  } catch (e) {
    console.log("checkin key invalid", String(e && e.message || e));
  }
  keyCache.set(secret, signer);
  return signer;
}

export async function verifySignature(publicKey, signature, message) {
  try {
    let key;
    try { key = await crypto.subtle.importKey("raw", publicKey, { name: "Ed25519" }, false, ["verify"]); }
    catch (e) { key = await crypto.subtle.importKey("raw", publicKey, { name: "NODE-ED25519", namedCurve: "NODE-ED25519" }, false, ["verify"]); }
    const algo = key.algorithm && key.algorithm.name === "NODE-ED25519" ? "NODE-ED25519" : "Ed25519";
    return await crypto.subtle.verify(algo, key, signature, message);
  } catch (e) { return false; }
}

function compactU16(n) {
  const out = [];
  for (;;) { let b = n & 0x7f; n >>= 7; if (n) { out.push(b | 0x80); } else { out.push(b); return out; } }
}
function readCompactU16(bytes, at) {
  let n = 0, shift = 0, i = at;
  for (;;) { const b = bytes[i++]; n |= (b & 0x7f) << shift; if (!(b & 0x80)) return [n, i]; shift += 7; if (shift > 14) throw new Error("bad length"); }
}

// A legacy transaction message: fee payer (writable signer), guest (read-only signer), memo program.
export function memoMessage(feePayer, guest, blockhash, memo) {
  const data = new TextEncoder().encode(memo);
  const keys = [base58Decode(feePayer), base58Decode(guest), base58Decode(MEMO_PROGRAM)];
  if (keys.some(k => k.length !== 32)) throw new Error("bad key");
  const hash = base58Decode(blockhash);
  if (hash.length !== 32) throw new Error("bad blockhash");
  return Uint8Array.from([
    2, 1, 1,                         // 2 signatures; 1 read-only signer (the guest); 1 read-only account (the program)
    ...compactU16(3), ...keys.flatMap(k => [...k]),
    ...hash,
    ...compactU16(1), 2, ...compactU16(1), 1, ...compactU16(data.length), ...data,
  ]);
}

// Wire format: compact count of signatures, the signatures, the message.
export function transactionBytes(signatures, message) {
  return Uint8Array.from([...compactU16(signatures.length), ...signatures.flatMap(s => [...s]), ...message]);
}
export function parseTransaction(bytes) {
  const [count, at] = readCompactU16(bytes, 0);
  if (count < 1 || count > 4) throw new Error("bad signature count");
  const signatures = [];
  for (let i = 0; i < count; i++) signatures.push(bytes.slice(at + i * 64, at + (i + 1) * 64));
  return { signatures, message: bytes.slice(at + count * 64) };
}

export const memoText = (drinkName, num, day) =>
  `Beach Coffee check-in | ${String(drinkName).replace(/[^\x20-\x7e]/g, "")} | #${num} | ${day}`;

export { isAddress };
export const latestFinalizedBlockhash = async env => (await rpc(env, "getLatestBlockhash", [{ commitment: "finalized" }])).value;
export const sendRaw = (env, bytes) => rpc(env, "sendTransaction", [b64(bytes), { encoding: "base64", preflightCommitment: "confirmed" }]);
export const signatureStatus = async (env, signature) => (await rpc(env, "getSignatureStatuses", [[signature], { searchTransactionHistory: true }])).value[0];
export const solBalance = async (env, address) => (await rpc(env, "getBalance", [address, { commitment: "confirmed" }])).value;

// The public payment page: /pay (pick a tip or the coffee bag, opened from the printed QR)
// and /pay/<reference> (checkout). Inside a wallet app's browser (Phantom, Solflare) it asks the
// wallet to send the USDC; anywhere else it offers to open a wallet, a Solana Pay QR and the
// plain address to copy (never with "solana:" in front, which wallets and exchanges reject).
import { WORDMARK_SVG } from "./wordmark.js";
import { USDC_MINT, TIP_PRESETS, PRODUCTS, PUBLIC_RPCS } from "./pay.js";

export function payPageHtml({ recipient, bagPrice, bagStock, bagsLeft, payment }) {
  const config = JSON.stringify({ recipient, mint: USDC_MINT, presets: TIP_PRESETS, bagPrice, bagStock, bagsLeft, products: PRODUCTS, rpcs: PUBLIC_RPCS, payment })
    .replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Tip & coffee bag · Beach Coffee Co.</title>
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#071110">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
  :root {
    --bg: #071110; --card: #0c1a17; --card-2: #11231f; --line: rgba(168,230,184,.14);
    --text: #eef3ee; --muted: #7f9a8c; --faint: #4f685d; --mint: #a8e6b8; --gold: #e8b86a; --gold-ink: #1d1407;
    --display: "Archivo", "Arial Black", sans-serif; --body: "Figtree", system-ui, sans-serif; --mono: "JetBrains Mono", ui-monospace, monospace;
    color-scheme: dark;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.45 var(--body); }
  .wrap { max-width: 520px; margin: 0 auto; padding: 18px 16px 48px; display: grid; gap: 18px; }
  header { display: flex; align-items: center; gap: 14px; }
  .wordmark { height: 34px; width: auto; display: block; }
  header span { font: 600 .72rem/1 var(--body); letter-spacing: .2em; color: var(--muted); padding-left: 14px; border-left: 1px solid var(--line); }
  .eyebrow { margin: 0; font: 600 .76rem/1.3 var(--body); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
  h1 { margin: 0; font: 900 clamp(2rem, 9vw, 2.6rem)/.95 var(--display); font-stretch: 125%; text-transform: uppercase; }
  h1 b { display: block; color: var(--mint); }
  .card { border: 1px solid var(--line); border-radius: 22px; background: var(--card); padding: 18px; display: grid; gap: 12px; }
  .card h2 { margin: 0; font: 800 1.05rem/1.2 var(--display); font-stretch: 125%; letter-spacing: .02em; }
  .note { color: var(--muted); font-size: .92rem; margin: 0; }
  .chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .chip { height: 46px; border-radius: 14px; border: 1px solid var(--line); background: var(--card-2); color: var(--text); font: 600 1rem/1 var(--body); cursor: pointer; }
  .chip.on { border-color: var(--mint); color: var(--mint); box-shadow: 0 0 0 1px var(--mint) inset; }
  input { height: 46px; border-radius: 14px; border: 1px solid var(--line); background: var(--card-2); color: var(--text); padding: 0 14px; font: 500 1rem/1 var(--body); width: 100%; }
  .bag { background: radial-gradient(120% 120% at 100% 0%, rgba(232,184,106,.18), transparent 60%), var(--card); }
  .bag.on { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold) inset; }
  .bag.soldout { opacity: .55; cursor: default; }
  .tag { justify-self: start; font: 600 .7rem/1 var(--body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-ink); background: var(--gold); padding: 6px 10px; border-radius: 999px; }
  .price { font: 500 1.1rem/1 var(--mono); color: var(--gold); }
  .btn { height: 52px; width: 100%; border-radius: 999px; border: 0; background: var(--gold); color: var(--gold-ink); font: 600 1.02rem/1 var(--body); cursor: pointer; display: grid; place-items: center; text-decoration: none; }
  .btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
  /* Each wallet in its own colors: Solflare yellow and black, Phantom lavender and white. */
  .btn.solflare { background: #fbee64; color: #111; }
  .btn.phantom { background: #a99eec; color: #fff; }
  .btn[disabled] { opacity: .5; cursor: default; }
  .amount { font: 900 2.6rem/1 var(--display); font-stretch: 125%; color: var(--gold); }
  .amount small { font: 600 1rem/1 var(--body); color: var(--muted); letter-spacing: .1em; margin-left: 6px; }
  .field { display: grid; gap: 6px; }
  .field label { font: 600 .72rem/1 var(--body); letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
  .copy { display: flex; gap: 8px; align-items: center; background: var(--card-2); border: 1px solid var(--line); border-radius: 14px; padding: 10px 10px 10px 14px; }
  .copy code { flex: 1; font: 500 .86rem/1.35 var(--mono); word-break: break-all; color: var(--text); }
  .copy button { flex: none; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--mint); font: 600 .85rem/1 var(--body); cursor: pointer; }
  details summary { cursor: pointer; color: var(--muted); font-weight: 600; }
  .qr { width: 220px; max-width: 70vw; margin: 14px auto 4px; display: block; border-radius: 14px; overflow: hidden; }
  .qr svg { display: block; width: 100%; height: auto; }
  .status { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: .92rem; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); animation: pulse 1.4s infinite; }
  @keyframes pulse { 50% { opacity: .3; } }
  .done { text-align: center; justify-items: center; padding: 28px 18px; }
  .done .big { font-size: 3rem; line-height: 1; }
  .err { color: #f0a39a; font-size: .92rem; margin: 0; }
  [hidden] { display: none !important; }
</style>
</head><body>
<div class="wrap">
  <header>${WORDMARK_SVG}<span>@ ISLAND DAO</span></header>

  <section id="choose" hidden>
    <div style="display:grid;gap:10px;margin-bottom:18px">
      <p class="eyebrow">Drinks are on the house ☕</p>
      <h1>Say thanks<b>in USDC</b></h1>
    </div>
    <div style="display:grid;gap:12px">
      <div class="card" id="tipCard">
        <h2>💛 Tip the barista</h2>
        <div class="chips" id="chips"></div>
        <input id="custom" inputmode="decimal" placeholder="Other amount (USDC)" hidden>
      </div>
      <div class="card bag" id="bagCard" role="button" tabindex="0">
        <span class="tag">Limited edition</span>
        <h2>🛍️ Island DAO coffee bag</h2>
        <p class="note" id="bagDetail"></p>
        <span class="price" id="bagPrice"></span>
      </div>
      <input id="name" maxlength="40" placeholder="Your name (optional)" autocomplete="given-name">
      <button class="btn" id="continue" disabled>Choose a tip or the bag</button>
      <p class="err" id="chooseErr"></p>
    </div>
  </section>

  <section id="checkout" hidden style="display:grid;gap:14px">
    <div class="card">
      <p class="eyebrow" id="item"></p>
      <div class="amount" id="amount"></div>
      <p class="note">Paid in <b>USDC</b> on the <b>Solana</b> network.</p>
    </div>

    <div id="inWallet" hidden style="display:grid;gap:10px">
      <button class="btn" id="payNow"></button>
      <p class="note">You'll confirm it in your wallet. A tiny bit of SOL pays the network fee.</p>
      <a class="btn ghost" id="solanaPayIn" rel="noopener">Blocked? Pay with Solana Pay</a>
    </div>

    <div id="openWallet" hidden style="display:grid;gap:10px">
      <a class="btn solflare" id="solflare" rel="noopener">Pay with Solflare</a>
      <a class="btn phantom" id="phantom" rel="noopener">Pay with Phantom</a>
      <a class="btn ghost" id="solanaPay" rel="noopener">Open my wallet app (Solana Pay)</a>
      <p class="note">If your wallet blocks the payment, use Solana Pay: your wallet opens with the tip filled in, you just confirm.</p>
    </div>

    <div class="card">
      <h2>Any other wallet or exchange</h2>
      <p class="note">Send exactly this amount of <b>USDC</b> on <b>Solana</b> to this address:</p>
      <div class="field"><label>Address</label><div class="copy"><code id="addr"></code><button data-copy="addr">Copy</button></div></div>
      <div class="field"><label>Amount (USDC)</label><div class="copy"><code id="amt"></code><button data-copy="amt">Copy</button></div></div>
      <p class="note">No Solana wallet? Any exchange works (Binance, Coinbase…): withdraw USDC, pick the <b>Solana</b> network. When it arrives the barista gets a message; it can take a few minutes.</p>
      <details id="qrBox">
        <summary>Scan with a wallet app</summary>
        <div class="qr" id="qr"></div>
        <p class="note" style="text-align:center">Open the scanner inside Solflare or Phantom, not the phone camera.</p>
      </details>
    </div>

    <div class="status" id="status"><span class="dot"></span><span>Waiting for the payment…</span></div>
    <p class="err" id="payErr"></p>
  </section>

  <section id="paid" class="card done" hidden></section>
</div>
<script src="/vendor/web3.js" defer></script>
<script src="/vendor/mwa.js" defer></script>
<script>
  const C = ${config};
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let pick = null, polling = null;
  // Tells the bot what happened (wallet buttons, wallet errors), so /payments shows where checkouts get stuck.
  function track(step, detail) {
    if (!C.payment) return;
    try {
      fetch("/api/pay/" + C.payment.ref + "/event", { method: "POST", keepalive: true, headers: { "content-type": "application/json" },
        body: JSON.stringify({ step, detail: String(detail || "").slice(0, 300) }) }).catch(() => {});
    } catch (e) {}
  }
  // Android (the Seeker included), no wallet browser: the Mobile Wallet Adapter asks the phone's wallet app.
  function mwaWallet() {
    try { return /Android/i.test(navigator.userAgent) && window.BeachMWA ? window.BeachMWA.get() : null; } catch (e) { return null; }
  }
  function walletName() {
    const w = window;
    if (w.phantom && w.phantom.solana) return "phantom";
    if (w.solflare && w.solflare.isSolflare) return "solflare";
    if (w.backpack && w.backpack.solana) return "backpack";
    if (w.solana) return "wallet";
    if (mwaWallet()) return "mwa";
    return /Telegram/i.test(navigator.userAgent) || (w.TelegramWebviewProxy) ? "telegram" : "browser";
  }
  const platform = () => /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "desktop";

  function provider() {
    const w = window;
    return (w.phantom && w.phantom.solana) || (w.solflare && w.solflare.isSolflare && w.solflare) || (w.backpack && w.backpack.solana) || (w.solana && w.solana.signAndSendTransaction && w.solana) || null;
  }

  // ----- Choose -----
  function renderChoose() {
    $("chips").innerHTML = C.presets.map(v => '<button class="chip" data-v="' + v + '">' + v + '</button>').join("") + '<button class="chip" data-v="other">Other</button>';
    $("bagDetail").textContent = C.products.bag.detail;
    const soldOut = C.bagsLeft === 0;
    $("bagPrice").textContent = soldOut ? "Sold out" : C.bagPrice + " USDC" + (C.bagsLeft != null ? " · " + C.bagsLeft + " of " + C.bagStock + " left" : "");
    $("bagCard").classList.toggle("soldout", soldOut);
    $("choose").hidden = false;
  }
  function amountPicked() {
    if (!pick) return null;
    if (pick.kind === "bag") return C.bagPrice;
    return pick.v === "other" ? $("custom").value.trim().replace(",", ".") : pick.v;
  }
  function updateContinue() {
    const a = amountPicked();
    const ok = pick && a && Number(a) > 0;
    $("continue").disabled = !ok;
    $("continue").textContent = !pick ? "Choose a tip or the bag" : ok ? "Continue · " + a + " USDC" : "Type an amount";
    document.querySelectorAll(".chip").forEach(b => b.classList.toggle("on", !!pick && pick.kind === "tip" && String(pick.v) === b.dataset.v));
    $("bagCard").classList.toggle("on", !!pick && pick.kind === "bag");
    $("custom").hidden = !(pick && pick.v === "other");
  }
  $("chips").addEventListener("click", e => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    pick = { kind: "tip", v: b.dataset.v }; updateContinue();
    if (pick.v === "other") $("custom").focus();
  });
  $("custom").addEventListener("input", updateContinue);
  const chooseBag = () => { if (C.bagsLeft === 0) return; pick = { kind: "bag" }; updateContinue(); };
  $("bagCard").addEventListener("click", chooseBag);
  $("bagCard").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chooseBag(); } });
  $("continue").addEventListener("click", async () => {
    $("continue").disabled = true; $("chooseErr").textContent = "";
    const r = await fetch("/api/pay", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: pick.kind, amount: amountPicked(), name: $("name").value.trim() }) }).then(r => r.json()).catch(() => ({}));
    if (!r.ok) { $("chooseErr").textContent = r.error || "Something went wrong. Try again."; updateContinue(); return; }
    location.href = r.payment.page;
  });

  // ----- Checkout -----
  function renderCheckout(p) {
    $("item").textContent = p.kind === "bag" ? "🛍️ " + C.products.bag.title : p.kind === "boost" ? "⚡ " + C.products.boost.title : "💛 " + C.products.tip.title;
    $("amount").innerHTML = esc(p.amount) + "<small>USDC</small>";
    $("addr").textContent = C.recipient;
    $("amt").textContent = p.amount;
    $("qr").innerHTML = p.qr;
    $("qrBox").open = matchMedia("(min-width: 760px)").matches;
    $("phantom").href = p.phantom;
    $("solflare").href = p.solflare;
    // Solana Pay: the wallet builds the transfer itself (with the reference), so no web page asks it to sign.
    $("solanaPay").href = $("solanaPayIn").href = p.solanaPay;
    $("payNow").textContent = "Pay " + p.amount + " USDC";
    $("checkout").hidden = false;
    const showWallet = () => {
      const inside = !!provider(), mwa = !inside && !!mwaWallet();
      $("inWallet").hidden = !(inside || mwa); $("openWallet").hidden = inside || mwa;
      $("payNow").textContent = "Pay " + p.amount + " USDC" + (mwa ? " with my wallet" : "");
    };
    showWallet();
    setTimeout(showWallet, 600); // some wallets inject their provider a moment after load
    if (p.status !== "paid") setTimeout(() => track("open", walletName() + " " + platform()), 700);
    [["solflare", "solflare"], ["phantom", "phantom"], ["solanaPay", "solanapay"], ["solanaPayIn", "solanapay"]]
      .forEach(([id, name]) => $(id).addEventListener("click", () => track("tap", name + " web")));
    if (p.status === "paid") return renderPaid(p);
    poll(p.ref);
  }

  function poll(ref) {
    clearInterval(polling);
    polling = setInterval(async () => {
      const r = await fetch("/api/pay/" + ref).then(r => r.json()).catch(() => null);
      if (r && r.ok && r.payment.status === "paid") renderPaid(r.payment);
    }, 3000);
  }

  function renderPaid(p) {
    clearInterval(polling);
    $("checkout").hidden = true;
    $("paid").innerHTML = p.kind === "bag"
      ? '<div class="big">🛍️</div><h1>Bag #' + p.bagNo + '<b>is yours</b></h1><p class="note">Show this screen at the bar to pick up your Island DAO Limited Edition bag.</p>'
      : p.kind === "boost"
      ? '<div class="big">⚡</div><h1>Boost<b>in!</b></h1><p class="note">Your coffee moved up the queue, and points are on the way. Head back to Telegram ☕</p>'
      : '<div class="big">💛</div><h1>Thank<b>you!</b></h1><p class="note">Your ' + esc(p.amount) + ' USDC tip reached the barista. See you at the bar ☕</p>';
    $("paid").hidden = false;
  }

  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const text = $(b.dataset.copy).textContent;
    track("tap", "copy-" + b.dataset.copy + " web");
    try { await navigator.clipboard.writeText(text); }
    catch (err) { const r = document.createRange(); r.selectNodeContents($(b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy"); }
    b.textContent = "Copied ✓"; setTimeout(() => { b.textContent = "Copy"; }, 1600);
  });

  // Every transaction needs a recent blockhash: from the bot first, then straight from a public RPC.
  async function recentBlockhash() {
    const viaBot = await fetch("/api/pay/blockhash").then(r => r.json()).catch(() => null);
    if (viaBot && viaBot.ok) return viaBot;
    for (const url of C.rpcs) {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestBlockhash", params: [{ commitment: "finalized" }] }) })
        .then(r => r.json()).catch(() => null);
      if (r && r.result && r.result.value) return r.result.value;
    }
    throw Object.assign(new Error("no blockhash"), { network: true });
  }

  // One JSON-RPC call against the public RPCs, first answer wins. Returns the whole reply (result or error), or null.
  async function rpcCall(method, params) {
    for (const url of C.rpcs) {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) }).then(r => r.json()).catch(() => null);
      if (r && (r.result !== undefined || r.error)) return r;
    }
    return null;
  }
  // Whether the barista's USDC account already exists; unknown counts as no.
  async function accountExists(address) {
    const r = await rpcCall("getAccountInfo", [address, { encoding: "base64", commitment: "finalized" }]);
    return !!(r && r.result && r.result.value);
  }
  // Before the wallet opens: a clear message when this wallet can't pay (no USDC, or no SOL for the fee).
  // Unknown (RPC down) lets the wallet decide.
  async function checkFunds(payer, from, micro, needsRent) {
    const [usdc, sol] = await Promise.all([
      rpcCall("getTokenAccountBalance", [from, { commitment: "confirmed" }]),
      rpcCall("getBalance", [payer, { commitment: "confirmed" }]),
    ]);
    const amount = C.payment.amount;
    // Only "this account doesn't exist" means no USDC; a busy RPC (rate limit) lets the wallet decide.
    if (usdc && usdc.error && /could not find account|invalid param/i.test(usdc.error.message || "")) throw { friendly: "This wallet has no USDC on Solana yet. Add at least " + amount + " USDC (Solana network) and try again." };
    if (usdc && usdc.result && Number(usdc.result.value.amount) < micro) {
      throw { friendly: "This wallet has " + usdc.result.value.uiAmountString + " USDC on Solana; you need " + amount + "." };
    }
    if (sol && sol.result && sol.result.value < (needsRent ? 2100000 : 10000)) {
      throw { friendly: "This wallet needs a little SOL for the network fee (" + (needsRent ? "about 0.0021 SOL" : "0.0001 SOL is plenty") + ")." };
    }
  }
  const b64 = bytes => btoa(String.fromCharCode.apply(null, bytes));
  const rejected = err => err && (err.code === 4001 || /reject|cancel|denied|declined|closed/i.test(String(err.message || "")));

  const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  function b58(bytes) {
    let n = 0n, out = "";
    for (const b of bytes) n = n * 256n + BigInt(b);
    while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n; }
    for (const b of bytes) { if (b) break; out = "1" + out; }
    return out;
  }

  // The wallet that pays: the one injected by a wallet's browser, or the Mobile Wallet Adapter.
  // Returns { address, signAndSend(tx) → signature, sign(tx) → signed bytes, or null }.
  async function signer() {
    const injected = provider();
    if (injected) {
      const res = await injected.connect();
      return {
        address: String((res && res.publicKey) || injected.publicKey),
        signAndSend: async tx => { const sent = await injected.signAndSendTransaction(tx); return typeof sent === "string" ? sent : sent && sent.signature; },
        sign: injected.signTransaction ? async tx => (await injected.signTransaction(tx)).serialize({ verifySignatures: false }) : null,
      };
    }
    const mwa = mwaWallet();
    if (!mwa) throw new Error("Open this page in your wallet app.");
    const { accounts } = await mwa.features["standard:connect"].connect();
    const account = accounts && accounts[0];
    if (!account) throw new Error("The wallet didn't share an account.");
    const bytes = tx => tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    const send = mwa.features["solana:signAndSendTransaction"], sign = mwa.features["solana:signTransaction"];
    return {
      address: account.address,
      signAndSend: async tx => {
        if (!send) throw new Error("this wallet only signs");
        const [r] = await send.signAndSendTransaction({ account, chain: "solana:mainnet", transaction: bytes(tx) });
        return b58(r.signature);
      },
      sign: sign ? async tx => (await sign.signTransaction({ account, chain: "solana:mainnet", transaction: bytes(tx) }))[0].signedTransaction : null,
    };
  }

  // Builds the USDC transfer with the payment's reference attached and asks the wallet to send it.
  async function payInWallet(p) {
    const W = window.solanaWeb3;
    if (!W) throw Object.assign(new Error("no web3"), { network: true });
    const wallet = await signer();
    const payer = new W.PublicKey(wallet.address);
    const TOKEN = new W.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const ATA = new W.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    const mint = new W.PublicKey(C.mint), owner = new W.PublicKey(C.recipient), reference = new W.PublicKey(p.ref);
    const ata = who => W.PublicKey.findProgramAddressSync([who.toBuffer(), TOKEN.toBuffer(), mint.toBuffer()], ATA)[0];
    const from = ata(payer), to = ata(owner);
    const key = (pubkey, isSigner, isWritable) => ({ pubkey, isSigner, isWritable });
    // Creates the barista's USDC account if it doesn't exist yet (no-op otherwise).
    const create = new W.TransactionInstruction({ programId: ATA, data: Uint8Array.of(1), keys: [
      key(payer, true, true), key(to, false, true), key(owner, false, false), key(mint, false, false),
      key(W.SystemProgram.programId, false, false), key(TOKEN, false, false)] });
    // SPL Token TransferChecked: [12, amount u64 LE, decimals].
    const data = new Uint8Array(10); data[0] = 12; new DataView(data.buffer).setBigUint64(1, BigInt(p.micro), true); data[9] = 6;
    const transfer = new W.TransactionInstruction({ programId: TOKEN, data, keys: [
      key(from, false, true), key(mint, false, false), key(to, false, true), key(payer, true, false), key(reference, false, false)] });
    // Only the transfer when the account is there: a plain "send USDC" is what wallets simulate best.
    const [bh, exists] = await Promise.all([recentBlockhash(), accountExists(to.toBase58())]);
    await checkFunds(payer.toBase58(), from.toBase58(), p.micro, !exists);
    const tx = new W.Transaction({ feePayer: payer, blockhash: bh.blockhash, lastValidBlockHeight: bh.lastValidBlockHeight });
    if (!exists) tx.add(create);
    tx.add(transfer);
    try {
      return { signature: await wallet.signAndSend(tx), lastValid: bh.lastValidBlockHeight };
    } catch (err) {
      // Some wallets (Solflare in its browser) fail on sign-and-send but can sign; then the page sends it.
      if (rejected(err) || !wallet.sign) throw err;
      const signed = await wallet.sign(tx);
      const r = await rpcCall("sendTransaction", [b64(signed), { encoding: "base64", preflightCommitment: "confirmed" }]);
      if (!r) throw Object.assign(new Error("no RPC"), { network: true });
      if (r.error) throw new Error(r.error.message || "the network refused the transaction");
      return { signature: r.result, lastValid: bh.lastValidBlockHeight, raw: b64(signed) };
    }
  }
  // What the wallet's error means, in words a guest can act on.
  function explain(err) {
    const msg = String(err && err.message || err || "");
    if (err && err.friendly) return err.friendly;
    if (err && err.network) return "The Solana network didn't answer. Wait a few seconds and tap Pay again.";
    if (rejected(err)) return "Payment cancelled.";
    if (/insufficient|not enough|0x1\\b/i.test(msg)) return "Not enough funds: you need " + C.payment.amount + " USDC on Solana and a little SOL for the fee.";
    if (/blockhash/i.test(msg)) return "That took a bit long and the network let it expire. Nothing was charged: tap Pay again.";
    if (/simulat|malicious|unsafe|blocked/i.test(msg)) return "Your wallet wouldn't run it here. Use “Blocked? Pay with Solana Pay” below: the wallet builds the payment itself.";
    return "Couldn't send: " + (msg || "unknown error") + ". Check you have " + C.payment.amount + " USDC on Solana and a little SOL for the fee, or use Solana Pay below.";
  }

  // After the wallet sends: watch the reference on chain. A transaction can still be dropped by a busy
  // network (or never reach it); once its blockhash has surely expired with nothing on chain, say so,
  // because the guest was not charged and can simply pay again.
  async function watch(sent) {
    const started = Date.now();
    for (;;) {
      await new Promise(r => setTimeout(r, 2500));
      if ($("checkout").hidden) return; // paid: the poll already showed the thank-you
      if (sent.raw) rpcCall("sendTransaction", [sent.raw, { encoding: "base64", skipPreflight: true, maxRetries: 0 }]);
      const onChain = await rpcCall("getSignaturesForAddress", [C.payment.ref, { limit: 5, commitment: "confirmed" }]);
      const list = onChain && onChain.result || [];
      if (list.some(s => !s.err)) { $("payNow").textContent = "Paid ✓ confirming…"; return; }
      const mine = list.find(s => s.signature === sent.signature);
      if (mine && mine.err) {
        track("error", "failed on chain");
        $("payErr").textContent = "The network rejected that transaction (nothing was sent). Tap Pay again, or use Solana Pay below.";
        $("payNow").disabled = false; $("payNow").textContent = "Pay " + C.payment.amount + " USDC";
        return;
      }
      const height = await rpcCall("getBlockHeight", [{ commitment: "confirmed" }]);
      // 150 extra blocks (about a minute) in case the wallet refreshed the blockhash before sending.
      const expired = height && height.result > (sent.lastValid || 0) + 150;
      if (expired || Date.now() - started > 4 * 60 * 1000) {
        track("dropped", (sent.signature || "").slice(0, 20));
        $("payErr").textContent = "The network dropped that payment, so nothing was charged. Tap Pay again.";
        $("payNow").disabled = false; $("payNow").textContent = "Pay " + C.payment.amount + " USDC";
        return;
      }
    }
  }

  $("payNow").addEventListener("click", async () => {
    $("payNow").disabled = true; $("payErr").textContent = "";
    track("pay", walletName());
    try {
      const sent = await payInWallet(C.payment);
      track("sent", sent.signature || "");
      $("payNow").textContent = "Sent ✓ confirming…";
      watch(sent);
    } catch (err) {
      track(err && err.friendly ? "funds" : rejected(err) ? "cancel" : "error",
        err && err.friendly ? err.friendly : String(err && (err.message || err.code) || err));
      $("payErr").textContent = explain(err);
      $("payNow").disabled = false;
    }
  });

  if (C.payment) renderCheckout(C.payment); else renderChoose();
  updateContinue();
</script>
</body></html>`;
}

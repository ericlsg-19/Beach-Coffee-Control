// /checkin/<token>: check a coffee in onchain. Opened in the wallet's browser (Solflare, Phantom),
// or on Android/Seeker with the Mobile Wallet Adapter. The wallet signs a memo transaction that the
// server built; the bar's check-in wallet pays the fee.
import { WORDMARK_SVG } from "./wordmark.js";

export function checkinPageHtml(c) {
  const config = JSON.stringify(c).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Coffee check-in · Beach Coffee Co.</title>
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#071110">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
  :root {
    --bg: #071110; --card: #0c1a17; --card-2: #11231f; --line: rgba(168,230,184,.14);
    --text: #eef3ee; --muted: #7f9a8c; --mint: #a8e6b8; --gold: #e8b86a; --gold-ink: #1d1407;
    --display: "Archivo", "Arial Black", sans-serif; --body: "Figtree", system-ui, sans-serif; --mono: "JetBrains Mono", ui-monospace, monospace;
    color-scheme: dark;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; background: radial-gradient(120% 70% at 85% 0%, #1b3a30 0%, transparent 60%), var(--bg); color: var(--text); font: 16px/1.45 var(--body); min-height: 100%; }
  .wrap { max-width: 520px; margin: 0 auto; padding: 18px 16px 48px; display: grid; gap: 18px; }
  header { display: flex; align-items: center; gap: 14px; }
  .wordmark { height: 34px; width: auto; display: block; }
  header span { font: 600 .72rem/1 var(--body); letter-spacing: .2em; color: var(--muted); padding-left: 14px; border-left: 1px solid var(--line); }
  .eyebrow { margin: 0; font: 600 .76rem/1.3 var(--body); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
  h1 { margin: 0; font: 900 clamp(2rem, 9vw, 2.6rem)/.95 var(--display); font-stretch: 125%; text-transform: uppercase; }
  h1 b { display: block; color: var(--mint); }
  .card { border: 1px solid var(--line); border-radius: 22px; background: var(--card); padding: 18px; display: grid; gap: 12px; }
  .note { color: var(--muted); font-size: .92rem; margin: 0; }
  .steps { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
  .steps li { display: flex; gap: 12px; align-items: flex-start; color: var(--text); font-size: .95rem; }
  .steps b { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--card-2); color: var(--mint); font: 600 .8rem/1 var(--mono); }
  .memo { font: 500 .82rem/1.4 var(--mono); color: var(--mint); background: var(--card-2); border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; word-break: break-word; }
  .btn { height: 52px; width: 100%; border-radius: 999px; border: 0; background: var(--gold); color: var(--gold-ink); font: 600 1.02rem/1 var(--body); cursor: pointer; display: grid; place-items: center; text-decoration: none; }
  .btn.solflare { background: #fbee64; color: #111; }
  .btn.phantom { background: #a99eec; color: #fff; }
  .btn[disabled] { opacity: .5; cursor: default; }
  .free { display: inline-flex; gap: 6px; align-items: center; justify-self: start; font: 600 .74rem/1 var(--body); letter-spacing: .14em; text-transform: uppercase; color: #08201a; background: var(--mint); padding: 6px 10px; border-radius: 999px; }
  .status { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: .92rem; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); animation: pulse 1.4s infinite; }
  @keyframes pulse { 50% { opacity: .3; } }
  .err { color: #f0a39a; font-size: .92rem; margin: 0; }
  .done { text-align: center; justify-items: center; padding: 28px 18px; }
  .done .big { font-size: 3.2rem; line-height: 1; }
  .done a { color: var(--gold); }
  [hidden] { display: none !important; }
</style>
</head><body>
<div class="wrap">
  <header>${WORDMARK_SVG}<span>COFFEE CHECK-IN</span></header>

  <section id="start" style="display:grid;gap:14px">
    <div style="display:grid;gap:10px">
      <p class="eyebrow" id="order"></p>
      <h1>Check in<b>onchain</b></h1>
    </div>
    <div class="card">
      <span class="free">Free · the bar pays the fee</span>
      <ul class="steps">
        <li><b>1</b><span>Your wallet signs a check-in for this coffee on Solana. It's just like the event check-in.</span></li>
        <li><b>2</b><span>No tokens move. Your wallet may say <i>"no balance changes"</i>: that's right.</span></li>
        <li><b>3</b><span>It's yours onchain: proof you had a coffee here.</span></li>
      </ul>
      <div class="memo" id="memo"></div>
    </div>

    <div id="inWallet" hidden style="display:grid;gap:10px">
      <button class="btn" id="go">Check in with my wallet</button>
    </div>
    <div id="openWallet" hidden style="display:grid;gap:10px">
      <a class="btn solflare" id="solflare" rel="noopener">Check in with Solflare</a>
      <a class="btn phantom" id="phantom" rel="noopener">Check in with Phantom</a>
      <p class="note">Opens this page inside your wallet app, where you confirm the check-in.</p>
    </div>
    <div class="status" id="status" hidden><span class="dot"></span><span id="statusText">Checking in…</span></div>
    <p class="err" id="err"></p>
  </section>

  <section id="done" class="card done" hidden></section>
</div>
<script src="/vendor/web3.js" defer></script>
<script src="/vendor/mwa.js" defer></script>
<script>
  const C = ${config};
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const b64 = bytes => btoa(String.fromCharCode.apply(null, bytes));
  const unb64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
  const rejected = err => err && (err.code === 4001 || /reject|cancel|denied|declined|closed/i.test(String(err.message || "")));

  function injected() {
    const w = window;
    return (w.phantom && w.phantom.solana) || (w.solflare && w.solflare.isSolflare && w.solflare) || (w.backpack && w.backpack.solana) || (w.solana && w.solana.signTransaction && w.solana) || null;
  }
  function mwaWallet() {
    try { return /Android/i.test(navigator.userAgent) && window.BeachMWA ? window.BeachMWA.get() : null; } catch (e) { return null; }
  }

  // The guest's wallet: { address, sign(bytes) → signed bytes }.
  async function wallet() {
    const w = injected();
    if (w) {
      const res = await w.connect();
      return {
        address: String((res && res.publicKey) || w.publicKey),
        sign: async bytes => (await w.signTransaction(window.solanaWeb3.Transaction.from(bytes))).serialize(),
      };
    }
    const m = mwaWallet();
    if (!m) throw new Error("Open this page in your wallet app.");
    const { accounts } = await m.features["standard:connect"].connect();
    const account = accounts && accounts[0];
    const signF = m.features["solana:signTransaction"];
    if (!account || !signF) throw new Error("This wallet can't sign the check-in.");
    return {
      address: account.address,
      sign: async bytes => (await signF.signTransaction({ account, chain: "solana:mainnet", transaction: bytes }))[0].signedTransaction,
    };
  }

  const post = (path, body) => fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .then(r => r.json()).catch(() => ({ ok: false, error: "No connection. Try again." }));

  function showDone(signature) {
    $("start").hidden = true;
    $("done").innerHTML = '<div class="big">☕</div><h1>Checked<b>in!</b></h1>' +
      '<p class="note">Your ' + esc(C.drink) + ' #' + C.num + ' is on Solana. Thanks for coming by.</p>' +
      (signature ? '<p class="note"><a href="https://solscan.io/tx/' + encodeURIComponent(signature) + '" target="_blank" rel="noopener">View on Solscan →</a></p>' : '');
    $("done").hidden = false;
  }

  async function waitForIt() {
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const r = await fetch("/api/checkin/" + C.token).then(r => r.json()).catch(() => null);
      if (r && r.status === "done") return showDone(r.signature);
      if (r && r.status === "failed") throw new Error("Solana didn't accept it. Tap Check in again.");
    }
    $("statusText").textContent = "Still confirming. You'll get a message in Telegram when it's in.";
  }

  $("go").addEventListener("click", async () => {
    $("go").disabled = true; $("err").textContent = "";
    try {
      const w = await wallet();
      const built = await post("/api/checkin/" + C.token + "/tx", { wallet: w.address });
      if (built.status === "done") return showDone(built.signature);
      if (!built.ok) throw new Error(built.error);
      const signed = await w.sign(unb64(built.tx));
      $("status").hidden = false;
      const sent = await post("/api/checkin/" + C.token + "/send", { tx: b64(signed) });
      if (sent.status === "done") return showDone(sent.signature);
      if (!sent.ok) throw new Error(sent.error);
      await waitForIt();
    } catch (err) {
      $("status").hidden = true;
      $("err").textContent = rejected(err) ? "Check-in cancelled." : String(err && err.message || err);
      $("go").disabled = false;
    }
  });

  $("order").textContent = "Order #" + C.num + " · " + C.drink;
  $("memo").textContent = "Beach Coffee check-in | " + C.drink + " | #" + C.num + " | " + C.day;
  $("solflare").href = C.solflare; $("phantom").href = C.phantom;
  if (C.status === "done") showDone(C.signature);
  const showWallet = () => { const inside = !!injected() || !!mwaWallet(); $("inWallet").hidden = !inside; $("openWallet").hidden = inside; };
  showWallet(); setTimeout(showWallet, 600);
</script>
</body></html>`;
}

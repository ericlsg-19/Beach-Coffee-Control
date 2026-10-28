// The Telegram Mini App: a drink menu in the Âncora / Island DAO look, opened from the bot.
import { WORDMARK_SVG } from "./wordmark.js";

const ICONS = {
  espresso:   '<path d="M6 10h9v3a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4z"/><path d="M15 11h1.5a2 2 0 0 1 0 4H15M4 20h14"/>',
  double:     '<path d="M3 10h7v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M13 10h7v3a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3z"/><path d="M3 20h17"/>',
  freddo:     '<path d="M6 6h12l-1.6 14a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8z"/><path d="M15 2l-2 9"/><rect x="8.5" y="10" width="3.5" height="3.5" rx=".6"/><rect x="11.8" y="14" width="3.2" height="3.2" rx=".6"/>',
  americano:  '<path d="M6 7h11v9a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z"/><path d="M17 9h1a2.5 2.5 0 0 1 0 5h-1M9 3v2M13 3v2"/>',
  carioca:    '<path d="M5 11h11v2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 12h1.5a2 2 0 0 1 0 4H16M10.5 3.5c1.2 1.6 2 2.7 2 3.6a2 2 0 0 1-4 0c0-.9.8-2 2-3.6zM4 21h14"/>',
  cappuccino: '<path d="M4 11h13v2a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H16M7 8c0-1.5 2-1.5 2-3M11 8c0-1.5 2-1.5 2-3"/>',
  flatwhite:  '<path d="M3 10h14v1a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/><path d="M17 11h1a2 2 0 0 1 0 4h-2M10 13.5c-1.2-.9-2-1.5-2-2.3a1 1 0 0 1 2-.4 1 1 0 0 1 2 .4c0 .8-.8 1.4-2 2.3zM3 20h15"/>',
  latte:      '<path d="M7 4h10l-1.5 16h-7z"/><path d="M7.6 10h8.8"/>',
  icedlatte:  '<path d="M7 4h10l-1.5 16h-7z"/><path d="M7.5 8.5h9"/><rect x="9" y="11" width="3" height="3" rx=".5"/><rect x="12.2" y="14.4" width="2.8" height="2.8" rx=".5"/>',
  mocha:      '<path d="M7 10h10l-1.5 10h-7z"/><path d="M6.5 10c0-2 1.5-3 3-3 .4-1.6 1.4-2.5 2.5-2.5s2.1.9 2.5 2.5c1.5 0 3 1 3 3M8 14h8"/>',
  matcha:     '<path d="M12 21c-5-2-7-6-7-10 4 0 7 2 7 6 0-4 3-6 7-6 0 4-2 8-7 10z"/><path d="M12 17V5"/>',
  chocolate:  '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12M6 15h12M12 3v18"/>',
};

export function miniAppHtml(drinks) {
  const menu = JSON.stringify(drinks.map(d => ({ ...d, icon: ICONS[d.id] || "" })));
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Beach Coffee Co.</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
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
  .wrap { max-width: 560px; margin: 0 auto; padding: 18px 16px 120px; display: grid; gap: 22px; }
  header { display: flex; align-items: center; gap: 14px; }
  .wordmark { height: 34px; width: auto; display: block; }
  header span { font: 600 .72rem/1 var(--body); letter-spacing: .2em; color: var(--muted); padding-left: 14px; border-left: 1px solid var(--line); }
  .eyebrow { margin: 0; font: 600 .76rem/1.3 var(--body); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
  .hero { border: 1px solid var(--line); border-radius: 26px; padding: 22px 20px;
    background: radial-gradient(120% 90% at 100% 0%, rgba(160,190,170,.22), transparent 55%), radial-gradient(90% 80% at 0% 100%, rgba(30,80,90,.35), transparent 60%), var(--card);
    display: grid; gap: 12px; }
  .hero .live { margin: -6px 0 0; font: 600 .76rem/1.3 var(--body); letter-spacing: .22em; text-transform: uppercase; color: var(--mint); }
  .hero h1 { margin: 0; font: 900 clamp(2.1rem, 10vw, 3rem)/.95 var(--display); font-stretch: 125%; text-transform: uppercase; }
  .hero h1 b { display: block; color: var(--mint); }
  .card { border: 1px solid var(--line); border-radius: 22px; background: var(--card); padding: 6px 18px; }
  .order { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .order:last-child { border-bottom: 0; }
  .order .num { font: 500 .85rem/1 var(--mono); color: var(--muted); width: 34px; }
  .order .name { flex: 1; font-weight: 500; }
  .pill { font: 600 .75rem/1 var(--body); padding: 6px 10px; border-radius: 999px; }
  .pill.pending { background: rgba(232,184,106,.16); color: var(--gold); }
  .pill.ready { background: rgba(168,230,184,.16); color: var(--mint); }
  .pill.cancelled { background: rgba(255,255,255,.06); color: var(--faint); }
  .drinks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .drink { border: 1px solid var(--line); border-radius: 20px; background: var(--card); color: var(--text); padding: 12px;
    display: grid; grid-template-columns: 44px minmax(0, 1fr); column-gap: 12px; align-items: center; text-align: left;
    font: inherit; cursor: pointer; transition: transform .06s, border-color .15s, background .15s; }
  .drink:active { transform: scale(.97); }
  .drink.selected { border-color: var(--mint); background: var(--card-2); box-shadow: 0 0 0 1px var(--mint) inset; }
  .drink .ico { width: 44px; height: 44px; border-radius: 14px; background: var(--card-2); display: grid; place-items: center; }
  .drink.selected .ico { background: rgba(168,230,184,.16); }
  .drink svg { width: 26px; height: 26px; stroke: var(--mint); fill: none; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .drink .name { font: 600 .95rem/1.2 var(--body); }
  .note { color: var(--muted); font-size: .9rem; margin: 0; }
  .center { text-align: center; padding: 40px 10px; display: grid; gap: 10px; justify-items: center; }
  .center h2 { margin: 0; font: 800 1.4rem/1.1 var(--display); font-stretch: 125%; text-transform: uppercase; }
  .center h2 b { color: var(--mint); }
  .btn { height: 48px; padding: 0 24px; border-radius: 999px; border: 0; background: var(--gold); color: var(--gold-ink); font: 600 1rem/1 var(--body); cursor: pointer; }
  .btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
  .fallback { position: fixed; left: 16px; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
  .fallback .btn { width: 100%; }
  .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 5px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); }
  .tab { height: 42px; border: 0; border-radius: 999px; background: transparent; color: var(--muted); font: 600 .95rem/1 var(--body); cursor: pointer; }
  .tab.active { background: var(--card-2); color: var(--mint); box-shadow: 0 0 0 1px var(--line) inset; }
  .me-card { border: 1px solid var(--line); border-radius: 22px; padding: 18px 20px; margin-bottom: 12px;
    background: radial-gradient(120% 120% at 100% 0%, rgba(232,184,106,.16), transparent 60%), var(--card); display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .me-card b { font: 900 2.2rem/1 var(--display); font-stretch: 125%; color: var(--gold); }
  .me-card span { color: var(--muted); font-size: .95rem; text-align: right; }
  .rank { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .rank:last-child { border-bottom: 0; }
  .rank .pos { width: 34px; font: 500 .95rem/1 var(--mono); color: var(--muted); text-align: center; }
  .rank .pos.medal { font-size: 1.4rem; }
  .rank .who { flex: 1; font-weight: 500; }
  .rank .n { font: 500 .95rem/1 var(--mono); color: var(--text); }
  .rank.me .who { color: var(--mint); }
  .rank.me .who::after { content: " · you"; color: var(--muted); font-weight: 400; }
  [hidden] { display: none !important; }
</style>
</head><body>
<div class="wrap">
  <header>${WORDMARK_SVG}<span>@ ISLAND DAO</span></header>
  <div class="hero">
    <p class="eyebrow" id="greet">Welcome to the bar</p>
    <p class="live" id="live">Live · Floripa</p>
    <h1>What's your<b>coffee?</b></h1>
  </div>
  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" data-tab="menu">Menu</button>
    <button class="tab" role="tab" data-tab="rank">Ranking 🏆</button>
  </div>
  <div id="tab-menu">
  <section id="mine" hidden>
    <p class="eyebrow" style="margin-bottom:10px">Your orders today</p>
    <div class="card" id="orders"></div>
  </section>
  <section id="pick">
    <p class="eyebrow" style="margin-bottom:10px">Menu</p>
    <div class="drinks" id="drinks"></div>
  </section>
  <section id="done" class="center" hidden></section>
  <p class="note" id="msg"></p>
  </div>
  <section id="tab-rank" hidden>
    <p class="eyebrow" style="margin-bottom:10px">Top coffee lovers · Island DAO</p>
    <div class="me-card" id="meRank"></div>
    <div class="card" id="rankList"></div>
    <p class="note" style="margin-top:12px">Every drink you order here in Telegram counts. Keep ordering to climb 🏝️</p>
  </section>
</div>
<div class="fallback" id="fallback" hidden><button class="btn" id="fallbackBtn">Order</button></div>
<script>
  const MENU = ${menu};
  const tg = window.Telegram && window.Telegram.WebApp;
  const initData = tg ? tg.initData : "";
  const $ = id => document.getElementById(id);
  let selected = null, busy = false, open = true, tab = "menu";

  if (tg) {
    tg.ready(); tg.expand();
    try { tg.setHeaderColor("#071110"); tg.setBackgroundColor("#071110"); tg.setBottomBarColor && tg.setBottomBarColor("#071110"); } catch (e) {}
  }
  const main = tg && tg.MainButton;

  const drinkName = id => (MENU.find(d => d.id === id) || { name: id }).name;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function greeting(name) {
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return name ? g + ", " + name : g;
  }

  function renderDrinks() {
    $("drinks").innerHTML = MENU.map(d =>
      '<button class="drink' + (selected === d.id ? " selected" : "") + '" data-id="' + d.id + '">' +
      '<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + d.icon + '</svg></span>' +
      '<span class="name">' + esc(d.name) + '</span></button>').join("");
  }

  function renderOrders(list) {
    if (!list || !list.length) { $("mine").hidden = true; return; }
    const label = { pending: "Preparing", ready: "Ready", cancelled: "Cancelled" };
    $("orders").innerHTML = list.map(o =>
      '<div class="order"><span class="num">#' + o.num + '</span><span class="name">' + esc(drinkName(o.drink)) + '</span>' +
      '<span class="pill ' + o.status + '">' + (label[o.status] || o.status) + '</span></div>').join("");
    $("mine").hidden = false;
  }

  function renderRanking(r) {
    if (!r) return;
    $("meRank").innerHTML = r.me
      ? '<b>#' + r.me.rank + '</b><span>' + r.me.drinks + ' drink' + (r.me.drinks === 1 ? '' : 's') + '<br>out of ' + r.total + ' coffee lovers</span>'
      : '<span style="text-align:left">Order your first drink to join the ranking ☕</span>';
    const medal = n => ["🥇", "🥈", "🥉"][n - 1];
    $("rankList").innerHTML = r.top.length
      ? r.top.map(x => '<div class="rank' + (x.me ? ' me' : '') + '"><span class="pos' + (medal(x.rank) ? ' medal' : '') + '">' +
          (medal(x.rank) || '#' + x.rank) + '</span><span class="who">' + esc(x.name) + '</span><span class="n">' + x.drinks + '</span></div>').join("")
      : '<div class="rank"><span class="who" style="color:var(--muted)">No orders yet. Be the first!</span></div>';
  }

  function showTab(name) {
    tab = name;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    $("tab-menu").hidden = name !== "menu";
    $("tab-rank").hidden = name !== "rank";
    tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged();
    if (name === "rank") refreshRanking();
    updateButton();
  }

  async function refreshRanking() {
    const s = await api("/api/session", {});
    if (s.ok) renderRanking(s.ranking);
  }

  function updateButton() {
    const text = selected ? "Order " + drinkName(selected) : "Pick a drink";
    if (main) {
      main.setParams({ text, color: "#e8b86a", text_color: "#1d1407", is_active: !!selected && open && !busy, is_visible: open && tab === "menu" });
      if (busy) main.showProgress(); else main.hideProgress();
    } else {
      $("fallback").hidden = !open || tab !== "menu";
      $("fallbackBtn").textContent = text;
      $("fallbackBtn").disabled = !selected || busy;
    }
  }

  async function api(path, body) {
    const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData, ...body }) });
    return res.json().catch(() => ({ ok: false, error: "Something went wrong. Try again." }));
  }

  async function load() {
    if (!initData) {
      $("pick").hidden = true;
      $("msg").innerHTML = 'Open this menu from <b>@BeachCoffeeIslandBot</b> in Telegram to order.';
      return;
    }
    const s = await api("/api/session", {});
    if (!s.ok) { $("msg").textContent = s.error || "Couldn't load the menu."; return; }
    $("greet").textContent = greeting(s.user && s.user.first_name);
    open = s.open;
    if (!open) {
      $("live").textContent = "Closed for now";
      $("pick").hidden = true;
      $("msg").textContent = "The bar is closed right now 🌙 Come back soon!";
    }
    renderOrders(s.orders);
    renderRanking(s.ranking);
    updateButton();
  }

  async function order() {
    if (!selected || busy) return;
    busy = true; updateButton();
    const r = await api("/api/order", { drink: selected });
    busy = false;
    if (!r.ok) {
      tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("error");
      $("msg").textContent = r.error || "Couldn't place the order. Try again.";
      updateButton();
      return;
    }
    tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("success");
    $("pick").hidden = true; $("msg").textContent = "";
    if (main) main.hide(); else $("fallback").hidden = true;
    $("done").innerHTML =
      '<p class="eyebrow">Order #' + r.order.num + '</p>' +
      '<h2>' + esc(drinkName(r.order.drink)) + '<br><b>on the way</b></h2>' +
      '<p class="note">We\\'ll message you in the chat when it\\'s ready ☕</p>' +
      '<div style="display:flex;gap:10px;margin-top:8px"><button class="btn" id="close">Back to chat</button><button class="btn ghost" id="again">Order another</button></div>';
    $("done").hidden = false;
    $("close").onclick = () => tg ? tg.close() : null;
    $("again").onclick = () => { selected = null; $("done").hidden = true; $("pick").hidden = false; renderDrinks(); load(); };
    renderOrders(r.orders);
    refreshRanking();
  }

  $("drinks").addEventListener("click", e => {
    const b = e.target.closest("[data-id]");
    if (!b) return;
    selected = selected === b.dataset.id ? null : b.dataset.id;
    tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged();
    $("msg").textContent = "";
    renderDrinks(); updateButton();
  });
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
  if (main) main.onClick(order); else $("fallbackBtn").addEventListener("click", order);

  renderDrinks();
  load();
</script>
</body></html>`;
}

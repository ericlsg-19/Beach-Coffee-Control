// /eventos: one page to sell the coffee bar for weddings, birthdays and private events (Portuguese,
// for Instagram). A quick estimate from the event type, guests and hours, then the request goes out as a
// ready-made WhatsApp message, or is copied for an Instagram DM.
import { WORDMARK_SVG } from "./wordmark.js";

export const CONTACT = { whatsapp: "5548998300443", instagram: "beachcoffee.co" };

// Prices in R$ for the estimate: change them here. The page shows a range (± range around the value),
// never a closed price: the final quote comes in the chat.
// Cost basis measured at Island DAO (Oct 2026): R$ 2.14 per drink in supplies, R$ 60/h of the barista's
// time, R$ 40 travel in Floripa. perGuest assumes 1.5 drinks per guest: check it after the first event.
export const PRICING = {
  base: 500,          // set-up and travel in Floripa: the same for 2 h or 5 h, so hours don't scale it
  perGuest: 15,       // per guest, for a 3-hour service
  hours: { 2: 0.85, 3: 1, 4: 1.15, 5: 1.3 },   // applied to the per-guest part only
  minimum: 1500,
  favor: 50,          // per 250 g bag of coffee as a party favor (lembrancinha)
  range: 0.1,
};

const EVENT_TYPES = [
  ["casamento", "Casamento"],
  ["aniversario", "Aniversário"],
  ["corporativo", "Corporativo"],
  ["outro", "Outro evento"],
];

// The estimate the page shows (same formula as the page's script), for tests and checks.
export function estimate({ guests, hours, favors = 0 }) {
  const p = PRICING;
  const total = Math.max(p.minimum, p.base + p.perGuest * guests * p.hours[hours]) + favors * p.favor;
  const round50 = n => Math.round(n / 50) * 50;
  return { total, low: round50(total * (1 - p.range)), high: round50(total * (1 + p.range)) };
}

export function eventsHtml() {
  const config = JSON.stringify({ pricing: PRICING, contact: CONTACT, types: EVENT_TYPES });
  const wordmark = WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#4d2e17"');
  return PAGE.replaceAll("<!--WORDMARK-->", wordmark).replace("/*CONFIG*/null", config);
}

const PAGE = String.raw`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Coffee bar para eventos · Beach Coffee Co.</title>
<meta name="description" content="Coffee bar de café especial para casamentos, aniversários e eventos corporativos em Florianópolis. Simule o orçamento e fale com a gente pelo WhatsApp.">
<meta property="og:title" content="Coffee bar para eventos · Beach Coffee Co.">
<meta property="og:description" content="Café especial, barista e estrutura completa para casamentos, aniversários e eventos corporativos em Florianópolis.">
<meta name="theme-color" content="#f6efe4">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Figtree:wght@400;500;600;700&display=swap">
<style>
  :root { --bg: #f6efe4; --card: #fffaf2; --ink: #3a2412; --brown: #4d2e17; --muted: #7a6450; --line: #e6d6bf;
    --gold: #b8792b; --gold-soft: #f1dfc0; --wa: #1f9d55; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 400 16px/1.55 Figtree, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  a { color: inherit; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
  header svg { height: 40px; width: auto; display: block; }
  header a.ig { font: 600 14px/1 Figtree; color: var(--brown); text-decoration: none; border: 1px solid var(--line); border-radius: 999px; padding: 10px 14px; background: var(--card); }
  h1, h2, h3 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; color: var(--brown); margin: 0; letter-spacing: -.01em; }
  .hero { padding: 36px 0 28px; display: grid; gap: 28px; }
  .eyebrow { font: 700 12px/1 Figtree; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin: 0 0 14px; }
  .hero h1 { font-size: clamp(42px, 9vw, 72px); line-height: .98; }
  .hero h1 em { font-style: italic; color: var(--gold); }
  .hero p.lead { font-size: 18px; color: var(--muted); margin: 18px 0 0; max-width: 34em; }
  .ctas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 22px; border-radius: 999px; border: 0;
    font: 700 16px/1.2 Figtree; text-align: center; text-decoration: none; cursor: pointer; }
  .btn.primary { background: var(--brown); color: #fff8ec; }
  .btn.wa { background: var(--wa); color: #fff; }
  .btn.ghost { background: transparent; color: var(--brown); border: 1.5px solid var(--brown); }
  .btn.full { width: 100%; }
  .proof { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .proof div { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px 14px; }
  .proof b { display: block; font: 600 30px/1 "Cormorant Garamond", serif; color: var(--brown); }
  .proof span { display: block; margin-top: 6px; font-size: 13px; color: var(--muted); line-height: 1.35; }
  section { padding: 34px 0; }
  section h2 { font-size: clamp(32px, 6vw, 44px); line-height: 1.05; }
  section > .wrap > p.sub, .simwrap p.sub { color: var(--muted); margin: 10px 0 22px; }
  .grid { display: grid; gap: 12px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 22px; }
  .card h3 { font-size: 26px; margin-bottom: 6px; }
  .card p { margin: 0; color: var(--muted); }
  .rule { width: 32px; height: 2px; background: var(--gold); margin-bottom: 16px; }
  .menu { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .menu span { background: var(--gold-soft); color: var(--brown); border-radius: 999px; padding: 8px 12px; font: 600 14px/1 Figtree; }
  /* Simulator */
  .sim { background: var(--card); border: 1px solid var(--line); border-radius: 26px; padding: 22px; display: grid; gap: 20px; box-shadow: 0 18px 50px rgba(77,46,23,.08); }
  .field > label, .field > .label { display: block; font: 700 13px/1 Figtree; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .types { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .types button, .hours button { border: 1.5px solid var(--line); background: #fff; color: var(--ink); border-radius: 16px; padding: 14px 10px; font: 600 15px/1.2 Figtree; cursor: pointer; }
  .types button.on, .hours button.on { border-color: var(--brown); background: var(--brown); color: #fff8ec; }
  .hours { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .guests { display: flex; align-items: center; gap: 14px; }
  .guests input[type=range] { flex: 1; accent-color: var(--brown); height: 28px; }
  .guests output { min-width: 64px; text-align: right; font: 600 28px/1 "Cormorant Garamond", serif; color: var(--brown); }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  input[type=date], input[type=text], input[type=number] { width: 100%; height: 50px; border-radius: 14px; border: 1.5px solid var(--line); background: #fff; padding: 0 14px; font: 500 16px Figtree; color: var(--ink); }
  .check { display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1.5px solid var(--line); border-radius: 16px; padding: 14px; cursor: pointer; }
  .check input { width: 22px; height: 22px; accent-color: var(--brown); margin: 2px 0 0; flex: none; }
  .check b { display: block; font-weight: 600; }
  .check small { color: var(--muted); font-size: 14px; }
  .result { background: var(--brown); color: #fff8ec; border-radius: 22px; padding: 22px; }
  .result .k { font: 700 12px/1 Figtree; letter-spacing: .18em; text-transform: uppercase; color: var(--gold-soft); }
  .result .v { font: 600 clamp(34px, 8vw, 46px)/1.05 "Cormorant Garamond", serif; margin: 10px 0 6px; }
  .result p { margin: 0; color: #e9d9c3; font-size: 14px; }
  .send { display: grid; gap: 10px; }
  .note { font-size: 13px; color: var(--muted); text-align: center; margin: 0; }
  .steps { counter-reset: s; display: grid; gap: 12px; }
  .steps .card { display: flex; gap: 16px; align-items: flex-start; }
  .steps .card::before { counter-increment: s; content: counter(s); flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
    background: var(--gold-soft); color: var(--brown); font: 600 22px/1 "Cormorant Garamond", serif; }
  details { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; }
  details + details { margin-top: 10px; }
  summary { cursor: pointer; font-weight: 600; list-style: none; display: flex; justify-content: space-between; gap: 10px; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: "+"; color: var(--gold); font-size: 22px; line-height: 1; }
  details[open] summary::after { content: "–"; }
  details p { margin: 10px 0 0; color: var(--muted); }
  footer { padding: 40px 0 150px; text-align: center; color: var(--muted); font-size: 14px; }
  footer svg { height: 34px; width: auto; display: block; margin: 0 auto 14px; }
  .float { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 5; width: 58px; height: 58px; border-radius: 50%;
    background: var(--wa); display: grid; place-items: center; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
  .float svg { width: 30px; height: 30px; }
  .toast { position: fixed; left: 50%; bottom: 90px; transform: translateX(-50%); background: var(--ink); color: #fff; padding: 12px 16px; border-radius: 14px;
    font-size: 14px; opacity: 0; transition: opacity .2s; pointer-events: none; z-index: 6; max-width: 90vw; text-align: center; }
  .toast.on { opacity: 1; }
  @media (min-width: 860px) {
    .hero { grid-template-columns: 1.15fr .85fr; align-items: end; padding-top: 56px; }
    .grid.three { grid-template-columns: repeat(3, 1fr); }
    .grid.two { grid-template-columns: repeat(2, 1fr); }
    .simwrap { display: grid; grid-template-columns: .8fr 1.2fr; gap: 40px; align-items: start; }
    .steps { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <!--WORDMARK-->
    <a class="ig" href="https://instagram.com/beachcoffee.co" target="_blank" rel="noopener">@beachcoffee.co</a>
  </header>

  <div class="hero">
    <div>
      <p class="eyebrow">Coffee bar para eventos · Florianópolis</p>
      <h1>Café especial no seu <em>grande dia</em></h1>
      <p class="lead">Coffee bar completo para casamentos, aniversários e eventos corporativos. Levamos barista, máquina de espresso e café especial, e cuidamos de tudo, da montagem ao último café.</p>
      <div class="ctas">
        <a class="btn primary" href="#orcamento">Simular orçamento</a>
        <a class="btn wa" id="heroWa" href="#" target="_blank" rel="noopener">Falar pelo WhatsApp</a>
      </div>
    </div>
    <div class="proof">
      <div><b>460+</b><span>cafés servidos em sete dias de um evento internacional em Florianópolis</span></div>
      <div><b>13</b><span>bebidas no cardápio, quentes e geladas</span></div>
      <div><b>100%</b><span>montagem, serviço e desmontagem por nossa conta</span></div>
    </div>
  </div>
</div>

<section>
  <div class="wrap">
    <p class="eyebrow">Eventos que atendemos</p>
    <h2>Um coffee bar à altura da sua celebração</h2>
    <p class="sub">Montamos, servimos e desmontamos. O serviço pode acompanhar a recepção, o pós-jantar ou a festa inteira.</p>
    <div class="grid three">
      <div class="card"><div class="rule"></div><h3>Casamentos</h3><p>Espresso, cappuccino e bebidas geladas para acompanhar a recepção, o bolo e a pista de dança.</p></div>
      <div class="card"><div class="rule"></div><h3>Aniversários</h3><p>Um bar de café especial que se adapta ao tema e ao estilo da festa, dos 15 aos 80 anos.</p></div>
      <div class="card"><div class="rule"></div><h3>Corporativos</h3><p>Lançamentos, workshops e confraternizações, com café de qualidade do início ao fim.</p></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">O que está incluído</p>
    <h2>Tudo o que o bar precisa</h2>
    <div class="grid two" style="margin-top:22px">
      <div class="card"><div class="rule"></div><h3>Equipe e equipamento</h3><p>Barista dedicado ao seu evento e máquina de espresso profissional.</p></div>
      <div class="card"><div class="rule"></div><h3>Insumos e descartáveis</h3><p>Café especial em grão, leite integral, açúcar e adoçante, copos, tampas, mexedores e guardanapos.</p></div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="rule"></div>
      <h3>Cardápio</h3>
      <p>Bebidas quentes e geladas, preparadas com leite integral. Leite sem lactose ou vegetal disponível com custo adicional.</p>
      <div class="menu"><span>Espresso</span><span>Espresso duplo</span><span>Americano</span><span>Carioca</span><span>Cappuccino</span><span>Latte</span><span>Flat white</span><span>Mocha</span><span>Chocolate quente</span><span>Matcha latte</span><span>Latte gelado</span><span>Café gelado</span><span>Freddo espresso</span></div>
    </div>
  </div>
</section>

<section id="orcamento">
  <div class="wrap simwrap">
    <div>
      <p class="eyebrow">Orçamento em 30 segundos</p>
      <h2>Simule o seu orçamento</h2>
      <p class="sub">Informe o tipo de evento, o número de convidados e a duração do serviço. A estimativa aparece na hora e pode ser enviada pelo WhatsApp para confirmarmos a data.</p>
    </div>
    <form class="sim" id="sim" onsubmit="return false">
      <div class="field">
        <span class="label">Tipo de evento</span>
        <div class="types" id="types"></div>
      </div>
      <div class="field">
        <label for="guests">Convidados</label>
        <div class="guests"><input type="range" id="guests" min="20" max="300" step="10" value="100"><output id="guestsOut">100</output></div>
      </div>
      <div class="field">
        <span class="label">Duração do serviço</span>
        <div class="hours" id="hours"></div>
      </div>
      <div class="row2">
        <div class="field"><label for="date">Data</label><input type="date" id="date"></div>
        <div class="field"><label for="city">Local</label><input type="text" id="city" placeholder="Florianópolis"></div>
      </div>
      <label class="check"><input type="checkbox" id="favors"><span><b>Lembrancinhas</b><small>Pacotes de café especial de 250 g para os convidados, sob encomenda.</small></span></label>
      <div class="field" id="favorsQtyWrap" hidden><label for="favorsQty">Quantidade de pacotes</label><input type="number" id="favorsQty" min="10" step="10" value="50"></div>
      <label class="check"><input type="checkbox" id="milk"><span><b>Leite sem lactose ou vegetal</b><small>Custo adicional, confirmado na proposta.</small></span></label>
      <div class="result">
        <div class="k">Estimativa</div>
        <div class="v" id="estimate">R$ –</div>
        <p id="estimateNote"></p>
      </div>
      <div class="send">
        <a class="btn wa full" id="sendWa" href="#" target="_blank" rel="noopener">Solicitar orçamento pelo WhatsApp</a>
        <button class="btn ghost full" id="sendIg" type="button">Prefiro o Instagram</button>
        <p class="note">Valor estimado. O orçamento final é confirmado na conversa, de acordo com a data e o local.</p>
      </div>
    </form>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Passo a passo</p>
    <h2>Como funciona</h2>
    <div class="steps" style="margin-top:22px">
      <div class="card"><div><h3>Simulação</h3><p>Escolha o tipo de evento, o número de convidados e a duração.</p></div></div>
      <div class="card"><div><h3>Solicitação</h3><p>Envie o pedido pelo WhatsApp, já com todos os detalhes.</p></div></div>
      <div class="card"><div><h3>Proposta</h3><p>Confirmamos a disponibilidade da data e enviamos a proposta final.</p></div></div>
      <div class="card"><div><h3>O evento</h3><p>No dia, montamos o bar e servimos durante todo o período contratado.</p></div></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Dúvidas</p>
    <h2>Perguntas frequentes</h2>
    <div style="margin-top:22px">
      <details><summary>O que é necessário no local?</summary><p>Precisamos de um ponto de energia próximo ao local do bar.</p></details>
      <details><summary>Vocês atendem fora de Florianópolis?</summary><p>Atendemos Florianópolis e região. Para outras cidades, o deslocamento é incluído no orçamento.</p></details>
      <details><summary>Há opção de leite sem lactose ou vegetal?</summary><p>Todas as bebidas são preparadas com leite integral. Leite sem lactose ou vegetal pode ser incluído, com custo adicional.</p></details>
      <details><summary>Como funcionam as lembrancinhas?</summary><p>São pacotes de 250 g de café especial, feitos sob encomenda. Informe a quantidade na sua solicitação para garantirmos a produção a tempo.</p></details>
      <details><summary>Com quanta antecedência devo reservar?</summary><p>Recomendamos reservar o quanto antes, principalmente para sábados e datas de alta temporada. Envie a data e confirmamos a disponibilidade.</p></details>
    </div>
  </div>
</section>

<footer class="wrap">
  <!--WORDMARK-->
  <p>Coffee bar para eventos · Florianópolis e região</p>
  <p><a href="https://instagram.com/beachcoffee.co" target="_blank" rel="noopener">@beachcoffee.co</a> · <a id="footWa" href="#" target="_blank" rel="noopener">WhatsApp</a></p>
</footer>

<a class="float" id="floatWa" href="#" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg viewBox="0 0 32 32" fill="#fff" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.7 5 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5l-.6-.3z"/></svg>
</a>
<div class="toast" id="toast"></div>

<script>
  const C = /*CONFIG*/null;
  const $ = id => document.getElementById(id);
  const brl = n => "R$ " + Math.round(n).toLocaleString("pt-BR");
  const round50 = n => Math.round(n / 50) * 50;
  const state = { type: "casamento", guests: 100, hours: 3 };
  const typeName = id => (C.types.find(t => t[0] === id) || [, "Evento"])[1];
  const hoursText = h => h === 5 ? "5 horas ou mais" : h + " horas";
  const wa = text => "https://wa.me/" + C.contact.whatsapp + "?text=" + encodeURIComponent(text);

  $("types").innerHTML = C.types.map(t => '<button type="button" data-type="' + t[0] + '">' + t[1] + "</button>").join("");
  $("hours").innerHTML = Object.keys(C.pricing.hours).map(h => '<button type="button" data-hours="' + h + '">' + h + (h === "5" ? "h+" : "h") + "</button>").join("");

  // Set-up and travel are fixed; the hours only scale the per-guest part.
  function estimate() {
    const p = C.pricing;
    const favors = $("favors").checked ? Math.max(0, Number($("favorsQty").value) || 0) : 0;
    const service = Math.max(p.minimum, p.base + p.perGuest * state.guests * p.hours[state.hours]);
    const total = service + favors * p.favor;
    return { favors, low: round50(total * (1 - p.range)), high: round50(total * (1 + p.range)) };
  }
  function message(e) {
    const d = $("date").value ? $("date").value.split("-").reverse().join("/") : "a definir";
    const lines = [
      "Olá! Gostaria de solicitar um orçamento de coffee bar.",
      "",
      "Evento: " + typeName(state.type),
      "Data: " + d,
      "Local: " + ($("city").value.trim() || "a definir"),
      "Convidados: " + state.guests,
      "Duração: " + hoursText(state.hours),
    ];
    if (e.favors) lines.push("Lembrancinhas: " + e.favors + " pacotes de 250 g");
    if ($("milk").checked) lines.push("Leite sem lactose ou vegetal: sim");
    lines.push("", "Estimativa do site: " + brl(e.low) + " a " + brl(e.high));
    return lines.join("\n");
  }
  function render() {
    document.querySelectorAll("[data-type]").forEach(b => b.classList.toggle("on", b.dataset.type === state.type));
    document.querySelectorAll("[data-hours]").forEach(b => b.classList.toggle("on", Number(b.dataset.hours) === state.hours));
    $("guestsOut").textContent = state.guests;
    $("favorsQtyWrap").hidden = !$("favors").checked;
    const e = estimate();
    $("estimate").textContent = brl(e.low) + " – " + brl(e.high);
    $("estimateNote").textContent = typeName(state.type) + " · " + state.guests + " convidados · " + hoursText(state.hours) +
      (e.favors ? " · " + e.favors + " lembrancinhas" : "") + ($("milk").checked ? " · leite sem lactose ou vegetal à parte" : "");
    $("sendWa").href = wa(message(e));
  }

  $("types").addEventListener("click", e => { const b = e.target.closest("[data-type]"); if (b) { state.type = b.dataset.type; render(); } });
  $("hours").addEventListener("click", e => { const b = e.target.closest("[data-hours]"); if (b) { state.hours = Number(b.dataset.hours); render(); } });
  $("guests").addEventListener("input", e => { state.guests = Number(e.target.value); render(); });
  ["date", "city", "favors", "favorsQty", "milk"].forEach(id => $(id).addEventListener("input", render));

  // Instagram can't take a prefilled message: copy it, then open the DM.
  const toast = t => { $("toast").textContent = t; $("toast").classList.add("on"); setTimeout(() => $("toast").classList.remove("on"), 2600); };
  $("sendIg").addEventListener("click", async () => {
    const text = message(estimate());
    try { await navigator.clipboard.writeText(text); toast("Mensagem copiada. Cole na conversa do Instagram."); }
    catch (err) { toast("Envie na conversa a data, o número de convidados e a duração."); }
    setTimeout(() => window.open("https://ig.me/m/" + C.contact.instagram, "_blank"), 600);
  });

  const hello = wa("Olá! Gostaria de saber mais sobre o coffee bar da Beach Coffee para o meu evento.");
  ["heroWa", "footWa", "floatWa"].forEach(id => { $(id).href = hello; });
  render();
</script>
</body>
</html>`;

// One-pager for cafés (A4, PT-BR): design/onepager/beach-coffee-onepager.pdf and .png
// Run: cd design/onepager && NODE_PATH=$(npm root -g) node build.mjs <path to qr svg>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { WORDMARK_SVG } from "../../telegram-bot/src/wordmark.js";
import { WEB3_SHOTS } from "../../telegram-bot/src/web3shots.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const qr = readFileSync(process.argv[2], "utf8");
const wm = WORDMARK_SVG.replace('fill="#ffffff"', 'fill="#eef3ee"');
const shot = k => `data:image/webp;base64,${WEB3_SHOTS[k]}`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap">
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; } html, body { margin: 0; }
body { width: 794px; height: 1123px; overflow: hidden; color: #eef3ee; font: 400 11.5px/1.45 Figtree, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  background: radial-gradient(700px 520px at 95% -5%, rgba(60,110,85,.35), transparent 60%), radial-gradient(600px 500px at -10% 105%, rgba(30,90,100,.28), transparent 60%), #081210; }
.page { padding: 34px 40px 28px; height: 100%; display: flex; flex-direction: column; }
.page > * { flex-shrink: 0; }
.top { display: flex; justify-content: space-between; align-items: center; }
.top svg { height: 34px; width: auto; display: block; }
.lab { font: 600 10px/1 "JetBrains Mono", monospace; letter-spacing: .2em; color: #a8e6b8; text-transform: uppercase; }
.hero { display: grid; grid-template-columns: 1fr 236px; gap: 22px; margin-top: 22px; }
h1 { margin: 0; font: 900 39px/.95 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; letter-spacing: -.01em; }
h1 b { color: #a8e6b8; font-weight: 900; display: block; }
.lead { margin: 14px 0 0; font-size: 13.5px; line-height: 1.45; color: #c9d6cd; }
.lead b { color: #eef3ee; }
.phones { position: relative; height: 210px; }
.phones img { position: absolute; width: 104px; border-radius: 14px; border: 1px solid rgba(168,230,184,.25); box-shadow: 0 14px 30px rgba(0,0,0,.5); }
.phones .a { left: 8px; top: 8px; transform: rotate(-4deg); }
.phones .b { right: 8px; top: 0; transform: rotate(4deg); }
.stats { margin-top: 18px; display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid rgba(168,230,184,.16); border-radius: 16px; overflow: hidden; }
.stats div { padding: 12px 14px; background: rgba(14,28,24,.75); }
.stats div + div { border-left: 1px solid rgba(168,230,184,.12); }
.stats b { display: block; font: 900 24px/1 Archivo, sans-serif; font-stretch: 125%; color: #e8b86a; }
.stats span { display: block; margin-top: 6px; font-size: 10.5px; color: #9db3a6; line-height: 1.3; }
.case { margin-top: 7px; font: 500 9.5px/1.3 "JetBrains Mono", monospace; color: #7f9a8c; letter-spacing: .03em; }
h2 { margin: 16px 0 9px; font: 800 15px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; letter-spacing: .02em; display: flex; align-items: center; gap: 10px; }
h2 i { font-style: normal; font: 600 9.5px/1 "JetBrains Mono", monospace; letter-spacing: .16em; color: #e8b86a; }
.flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.step { background: rgba(14,28,24,.75); border: 1px solid rgba(168,230,184,.14); border-radius: 12px; padding: 10px 11px; }
.step b { display: block; font-size: 12px; margin-bottom: 3px; }
.step span { color: #9db3a6; font-size: 10.5px; line-height: 1.35; display: block; }
.step em { font-style: normal; font: 600 9px/1 "JetBrains Mono", monospace; color: #a8e6b8; letter-spacing: .1em; display: block; margin-bottom: 6px; }
.mods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.mod { background: rgba(14,28,24,.75); border: 1px solid rgba(168,230,184,.14); border-radius: 12px; padding: 11px 12px; }
.mod .t { font: 800 11.5px/1.15 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; margin-bottom: 5px; display: flex; gap: 7px; align-items: center; }
.mod p { margin: 0; color: #9db3a6; font-size: 10.5px; line-height: 1.38; }
.onchain { display: grid; grid-template-columns: 1.15fr 1fr; gap: 10px; }
.box { border-radius: 14px; padding: 13px 15px; border: 1px solid rgba(232,184,106,.35); background: linear-gradient(135deg, rgba(232,184,106,.10), rgba(14,28,24,.75) 60%); }
.box.mint { border-color: rgba(168,230,184,.3); background: linear-gradient(135deg, rgba(168,230,184,.08), rgba(14,28,24,.75) 60%); }
.box h3 { margin: 0 0 8px; font: 800 12.5px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; }
.box ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.box li { display: grid; grid-template-columns: 14px 1fr; gap: 6px; font-size: 10.8px; line-height: 1.35; color: #c9d6cd; }
.box li b { color: #eef3ee; }
.tag { display: inline-block; font: 600 8.5px/1 "JetBrains Mono", monospace; letter-spacing: .08em; padding: 3px 6px; border-radius: 99px; margin-left: 4px; vertical-align: 1px; }
.tag.live { background: rgba(168,230,184,.16); color: #a8e6b8; } .tag.soon { background: rgba(232,184,106,.16); color: #e8b86a; }
.foot { margin-top: auto; display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; border-top: 1px solid rgba(168,230,184,.14); padding-top: 14px; }
.cta h3 { margin: 0; font: 900 20px/1 Archivo, sans-serif; font-stretch: 125%; text-transform: uppercase; } .cta h3 b { color: #a8e6b8; }
.cta p { margin: 7px 0 0; color: #c9d6cd; font-size: 11px; }
.contacts { margin-top: 9px; display: flex; flex-wrap: wrap; gap: 6px 16px; font: 500 10.5px/1 "JetBrains Mono", monospace; color: #eef3ee; }
.contacts span { color: #e8b86a; }
.qr { display: flex; gap: 10px; align-items: center; }
.qr div.q { width: 82px; height: 82px; background: #fff; padding: 6px; border-radius: 10px; } .qr div.q svg { width: 100%; height: 100%; display: block; }
.qr small { font: 500 9px/1.35 "JetBrains Mono", monospace; color: #9db3a6; width: 92px; }
.thanks { margin-top: 8px; font-size: 9px; color: #5f7d70; text-align: center; }
</style></head><body><div class="page">
<div class="top">${wm}<div class="lab">Para cafeterias · Sistema completo</div></div>

<div class="hero">
  <div>
    <h1>Sua cafeteria,<b>onchain.</b></h1>
    <p class="lead">O cliente pede pelo celular e é avisado quando fica pronto. O barista toca tudo num painel só. Gorjetas e produtos em <b>USDC na Solana</b> caem direto na sua carteira, e uma <b>fidelidade tokenizada</b> faz os clientes voltarem. Tudo já <b>rodou de verdade</b>, num mês de evento.</p>
  </div>
  <div class="phones"><img class="a" src="${shot("app")}" alt=""><img class="b" src="${shot("race")}" alt=""></div>
</div>

<div class="stats">
  <div><b>1.5k+</b><span>cafés servidos com o sistema</span></div>
  <div><b>0→94%</b><span>dos pedidos pelo app em 4 dias</span></div>
  <div><b>5→0 min</b><span>de fila no balcão</span></div>
  <div><b>115</b><span>clientes na corrida do café</span></div>
</div>
<div class="case">CASE: ISLAND DAO · FLORIANÓPOLIS · OUT–NOV 2026 · drinkbeachcoffee.com/web3</div>

<h2>Como funciona <i>4 PASSOS</i></h2>
<div class="flow">
  <div class="step"><em>01 · PEDE</em><b>Do lugar, pelo celular</b><span>Mini App no Telegram ou o app instalável. Sem fila, sem pedido perdido.</span></div>
  <div class="step"><em>02 · PREPARA</em><b>Painel do barista</b><span>Pedidos do app e do balcão numa fila só, em tempo real.</span></div>
  <div class="step"><em>03 · AVISA</em><b>"Seu café está pronto"</b><span>O cliente recebe a notificação e só busca.</span></div>
  <div class="step"><em>04 · PAGA</em><b>USDC em segundos</b><span>Gorjeta ou produto, da carteira do cliente direto para a sua.</span></div>
</div>

<h2>O sistema <i>TUDO INCLUÍDO</i></h2>
<div class="mods">
  <div class="mod"><div class="t">📱 App do cliente</div><p>Cardápio ao vivo, descrição das bebidas, leites, esgotados, horários e "pronto!". Telegram, navegador e Seeker.</p></div>
  <div class="mod"><div class="t">☕ Painel do barista</div><p>Fila, pedido de balcão, estoque, limites por cliente, pausa de almoço, abrir e fechar com um toque.</p></div>
  <div class="mod"><div class="t">📊 Relatórios e finanças</div><p>Cafés por dia, horário de pico, bebidas campeãs, custos, receita e lucro. Recaps prontos para as redes.</p></div>
  <div class="mod"><div class="t">💸 USDC na Solana</div><p>Solana Pay: cada pagamento confirmado onchain. Taxa de centavos, sem custódia: o dinheiro é seu na hora.</p></div>
  <div class="mod"><div class="t">🛍️ Edição limitada</div><p>Venda seu café em pacote com rótulo próprio, em USDC, no mesmo app. Estoque e entrega no painel.</p></div>
  <div class="mod"><div class="t">🏆 Corrida do café</div><p>Ranking ao vivo dos clientes, boost de 1 USDC por dia e quadro de Top patrons. Viralizou no X.</p></div>
</div>

<h2>Fidelidade tokenizada <i>ONCHAIN</i></h2>
<div class="onchain">
  <div class="box"><h3>Clientes que voltam</h3><ul>
    <li>⚡<span><b>Boost em USDC</b>: +1 café na corrida, 1× por dia <span class="tag live">NO AR</span></span></li>
    <li>💛<span><b>Top patrons</b>: quem mais apoia a casa ganha o seu ranking <span class="tag live">NO AR</span></span></li>
    <li>🏅<span><b>Medalhas NFT</b> para o top 3 de cada temporada <span class="tag soon">PILOTO</span></span></li>
    <li>🪙<span><b>Pontos com token</b>: gaste USDC, ganhe pontos da sua comunidade, com a Giants <span class="tag soon">PILOTO</span></span></li>
  </ul></div>
  <div class="box mint"><h3>Por que USDC na Solana</h3><ul>
    <li>✓<span><b>Dólar digital</b>: 1 USDC = 1 US$, sem volatilidade</span></li>
    <li>✓<span><b>Segundos e centavos</b> por transação</span></li>
    <li>✓<span><b>Sem intermediário</b>: vai direto para a sua carteira</span></li>
    <li>✓<span><b>Phantom, Solflare</b> e o celular Seeker</span></li>
  </ul></div>
</div>

<div class="foot">
  <div class="cta"><h3>Vamos levar para <b>sua cafeteria?</b></h3>
    <p>Configuramos seu cardápio, seu bot e sua carteira, e acompanhamos as primeiras semanas.</p>
    <div class="contacts"><div><span>WhatsApp</span> +55 48 99830-0443</div><div><span>X</span> @BeachCoffeco</div><div><span>Web</span> drinkbeachcoffee.com/web3</div></div>
  </div>
  <div class="qr"><div class="q">${qr}</div><small>Veja o case completo da Island DAO</small></div>
</div>
<div class="thanks">Beach Coffee Co. · Florianópolis · Feito no balcão, pelo barista, com IA · Obrigado Island DAO, Giants, Superteam Brasil e Superteam Argentina</div>
</div></body></html>`;
writeFileSync(here + "onepager-pt.html", html);
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
const over = await p.evaluate(() => { const pg = document.querySelector(".page"); return pg.scrollHeight - pg.clientHeight; });
console.log("overflow px:", over);
await p.screenshot({ path: here + "beach-coffee-onepager.png" });
await p.pdf({ path: here + "beach-coffee-onepager.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
await b.close();

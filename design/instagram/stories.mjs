// First story of each highlight (1080 × 1920): Eventos, Cardápio, Orçamento. Same look as the covers:
// the profile picture's gradient, cream text, the cover icon. Top and bottom 250 px stay clear of
// Instagram's buttons; the Orçamento story leaves room for a link sticker.
// Uses wordmark-cream.svg (the logo in cream) and icons.json (the cover icons from highlights.mjs).
// Run: cd design/instagram && NODE_PATH=$(npm root -g) node stories.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const here = fileURLToPath(new URL(".", import.meta.url));
const WORD = readFileSync(here + "wordmark-cream.svg", "utf8");
const ICONS = JSON.parse(readFileSync(here + "icons.json", "utf8"));
const icon = (name, size) => `<svg class="ic" viewBox="0 0 100 100" width="${size}" height="${size}" fill="none" stroke="#edd5b9" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const css = `
html,body{margin:0}
.s{position:relative;width:1080px;height:1920px;box-sizing:border-box;padding:250px 96px;color:#edd5b9;font-family:Figtree,sans-serif;
  background:radial-gradient(1500px circle at 900px 380px,#21392f 0%,#11201b 40%,#0a1311 68%,#080f0e 100%);display:flex;flex-direction:column}
.s>*{flex:none}
.wordmark{height:70px;width:auto;align-self:flex-start}
.ic{margin-top:96px}
.eye{margin:56px 0 0;font:600 26px/1 Figtree;letter-spacing:.24em;text-transform:uppercase;color:#c9a978}
h1{margin:22px 0 0;font:600 104px/1 "Cormorant Garamond",serif;color:#f6e7d2;letter-spacing:-.01em}
h1 em{font-style:italic;color:#e3b877}
p{margin:0}
.lead{margin-top:34px;font:400 36px/1.45 Figtree;color:#d9c3a5}
.rule{width:64px;height:3px;background:#c9a978;margin:48px 0 40px}
.list{display:grid;gap:22px;font:500 36px/1.3 Figtree;color:#f1dfc6}
.list b{font-weight:600;color:#f6e7d2}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px 40px;font:500 34px/1.25 Figtree;color:#f1dfc6}
.k{font:600 24px/1 Figtree;letter-spacing:.2em;text-transform:uppercase;color:#c9a978;margin-bottom:22px}
.note{margin-top:auto;font:400 28px/1.45 Figtree;color:#b39a7b}
.big{font:600 120px/1 "Cormorant Garamond",serif;color:#f6e7d2}
.tap{margin-top:auto;margin-bottom:170px;font:600 28px/1 Figtree;letter-spacing:.14em;text-transform:uppercase;color:#c9a978}
`;
const head = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Figtree:wght@400;500;600&display=swap"><style>${css}</style></head><body>`;

const stories = {
  eventos: `<div class="s">${WORD}${icon("eventos", 190)}
    <p class="eye">Coffee bar para eventos</p>
    <h1>Café especial no seu <em>grande dia</em></h1>
    <p class="lead">Levamos barista, máquina de espresso e café especial, e cuidamos de tudo, da montagem ao último café.</p>
    <div class="rule"></div>
    <div class="list"><span><b>Casamentos</b></span><span><b>Aniversários</b></span><span><b>Eventos corporativos</b></span></div>
    <p class="note">460+ cafés servidos em sete dias de um evento internacional em Florianópolis.</p></div>`,
  cardapio: `<div class="s">${WORD}${icon("cardapio", 190)}
    <p class="eye">Cardápio para eventos</p>
    <h1>Do espresso ao <em>café gelado</em></h1>
    <div class="rule"></div>
    <div class="cols">
      <div><div class="k">Quentes</div><div class="list" style="font-size:31px;gap:9px"><span>Espresso</span><span>Espresso duplo</span><span>Americano</span><span>Carioca</span><span>Cappuccino</span><span>Latte</span><span>Flat white</span><span>Mocha</span><span>Chocolate quente</span></div></div>
      <div><div class="k">Geladas</div><div class="list" style="font-size:31px;gap:9px"><span>Latte gelado</span><span>Café gelado</span><span>Freddo espresso</span><span>Matcha latte</span></div></div>
    </div>
    <p class="note">Preparadas com leite integral. Leite sem lactose ou vegetal com custo adicional. Lembrancinhas: pacotes de 250 g de café especial, sob encomenda.</p></div>`,
  orcamento: `<div class="s">${WORD}${icon("orcamento", 190)}
    <p class="eye">Orçamento em 30 segundos</p>
    <h1>Reserve a <em>sua data</em></h1>
    <p class="lead">Simule pelo site: tipo de evento, convidados e duração. A mensagem chega pronta no nosso WhatsApp.</p>
    <div class="rule"></div>
    <div class="list">
      <span><b>A partir de R$ 1.500</b></span>
      <span>50% na reserva da data, 50% ao final do evento</span>
      <span>drinkbeachcoffee.com/eventos</span>
    </div>
    <p class="tap">Toque no link abaixo para simular</p></div>`,
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const [name, html] of Object.entries(stories)) {
  await p.setContent(head + html + "</body></html>", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: here + `story-${name}.png` });
}
await b.close();

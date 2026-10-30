# Submissão ao hackathon da Island DAO

**Trilha:** Payments + Commerce ("real-world payment flows built on Solana").
**Projeto:** Beach Coffee Co.: o café do evento, pedido pelo Telegram e pago em USDC na Solana.

> As regras oficiais (prazo, formato, tempo de pitch) estão na aba **Hackathon** de islanddao.org. Confira lá: o checklist abaixo é o que hackathons de Solana costumam pedir (padrão Colosseum).

## Checklist da submissão

| Item | Situação |
|---|---|
| Pagamento real na rede, de outra carteira, com link do Solscan | **Falta** (pendência nº 1 em `docs/STATE.md`) |
| Repositório no GitHub com README | Pronto. Está privado: tornar público ou dar acesso aos jurados. O histórico não tem tokens. |
| Demo ao vivo | Pronto: [@BeachCoffeeIslandBot](https://t.me/BeachCoffeeIslandBot) e `https://drinkbeachcoffee.com/pay` |
| Vídeo de pitch (até ~3 min) | Falta |
| Vídeo de demo técnica (~2–3 min): pedido → barista → Ready; gorjeta/pacote → Solscan → aviso | Falta |
| Deck (6–8 slides) | Pronto: https://claude.ai/artifact/RUnS6FtZHQ3U3VDCtxgbKS (6 slides, notas do apresentador em inglês, cópia em `design/deck/`). Números do `/total` em 28/10 12:33: 356 bebidas em 5 dias, 47 pelo Telegram de 33 pessoas. Está privado: compartilhar pelo menu Share. |
| Descrição curta, trilha, equipe, carteira para prêmio | Texto abaixo |
| Números de tração | Tirar os totais exatos do Âncora (**Summary by day** / **Download CSV**) e do `/ranking` |

Respostas do formulário **Add your project** do app da Island DAO, com logo e banner: `design/hackathon/`.

## Descrição curta (EN)

> Beach Coffee Co. runs the coffee bar at Island DAO Floripa. Guests order free drinks from a Telegram Mini App and get pinged when they're ready; the barista runs the bar from one panel that merges Telegram and walk-up orders. Tips and the limited-edition Island DAO coffee bag are paid in USDC on Solana: Solana Pay references let the bot confirm each payment on-chain within a minute and notify the bar, with no wallet setup for the shop and no custody.

## Roteiro do pitch (3 min, demo ao vivo com o deck de apoio)

1. **Capa (10 s):** "Coffee, onchain". O bar que construiu o próprio sistema do zero, com IA, sem time de dev.
2. **Problema (20 s):** fila, pedidos perdidos, ninguém com dinheiro, e o primeiro QR `solana:` que não abria.
3. **Tap. Sip. Tip. + demo ao vivo (60 s):** pedir um Latte → aparece no painel → Ready → aviso no Telegram. Depois o pop-up de gorjeta → 5 USDC → Phantom → 💛 Tip no chat da barista + Solscan.
4. **Pagamento na Solana (25 s):** reference do Solana Pay, conferência do valor exato na rede, sem custódia, taxa de centavos.
5. **Dados (35 s):** o relatório do `/total` (bebidas, Telegram × barra, clientes). Somar aqui as gorjetas e pacotes em USDC quando houver pagamentos reais.
6. **Próximos passos + "Proof of brew" (20 s):** outros eventos e cafés, fidelidade onchain, Blink; fechar com "on the island, anyone can build".

## Pitch para falar (EN, ~3 min, demo ao vivo no slide 3)

PDF do deck: `design/deck/beach-coffee-pitch.pdf` (gerado por `design/deck/render-pdf.mjs` a partir da cópia dos slides).

**Slide 1 · Cover (10 s)**
GM! We're Beach Coffee Co. We run the coffee bar here at the Island DAO Vila, and we built our own system for it, from zero, between shifts, with AI. No dev team.

**Slide 2 · The problem (20 s)**
Picture a coffee bar at a builders' event. Everyone wants coffee in the same break. Orders get shouted and lost. Nobody carries cash. And crypto still breaks: our first Solana QR didn't even open in a phone camera.

**Slide 3 · Tap. Sip. Tip. + live demo (60 s)**
So we built this: tap, sip, tip. Scan the QR and order with me: 10 iced coffees and 10 iced lattes are on us today, and in the same app you can buy one of our 20 Island DAO Edition coffee bags. *(phone)* I open our bot on Telegram, tap Order, pick an Iced Latte, choose the milk and confirm. It lands on the barista panel right away. I keep building; the barista taps Ready, and I get the ping. We timed it: people used to wait about five minutes in line. Now it's zero. Then the app asks if I want to tip. I tap 2 USDC, Phantom opens, I confirm, and the tip lands in the barista's chat, confirmed onchain.

**Slide 4 · Payments on Solana (25 s)**
How does it work? Every checkout carries a Solana Pay reference. The bot finds that exact transaction onchain and only accepts it if the full USDC amount reached our wallet. Fees in cents, confirmed in seconds, and we never hold anyone's money.

**Slide 5 · The event so far (35 s)**
And this isn't a prototype. It runs the bar every day: 356 drinks in five days. Telegram ordering started on the 27th, and by day two four out of five orders came through it, from 33 different guests. That's three and a half hours given back to building instead of waiting in line. These numbers come straight from the bot.

**Slide 6 · What's next (20 s)**
What's next: from one bar to every event. Menu, brand and wallet are just settings, so we want to bring specialty coffee and onchain ordering to web3 events across Brazil. Proof of brew: this was built from zero, at the bar. On the island, anyone can build. Thank you!

## Material pronto em `design/`

- `deck/`: os 6 slides do deck (cópia do artifact).
- `screenshots/`: mini app (menu, ranking, Tip & Bag), painel, fluxo de pagamento.
- `social/`: posts do X (semana, dia 27/10, Telegram, edição especial), imagem "how to order".
- `print/`: cartão 10x15 com o QR para `/pay`. `sticker/`, `shirt/`, `logo/`: marca.

# Submissão ao hackathon da Island DAO

**Trilha:** Payments + Commerce ("real-world payment flows built on Solana").
**Projeto:** Beach Coffee Co.: o café do evento, pedido pelo Telegram e pago em USDC na Solana.

> As regras oficiais (prazo, formato, tempo de pitch) estão na aba **Hackathon** de islanddao.org. Confira lá: o checklist abaixo é o que hackathons de Solana costumam pedir (padrão Colosseum).

## Checklist da submissão

| Item | Situação |
|---|---|
| Pagamento real na rede, de outra carteira, com link do Solscan | **Falta** (pendência nº 1 em `docs/STATE.md`) |
| Repositório no GitHub com README | Pronto. Está privado: tornar público ou dar acesso aos jurados. O histórico não tem tokens. |
| Demo ao vivo | Pronto: [@BeachCoffeeIslandBot](https://t.me/BeachCoffeeIslandBot) e `https://beach-coffee-bot.beachcoffeeco.workers.dev/pay` |
| Vídeo de pitch (até ~3 min) | Falta |
| Vídeo de demo técnica (~2–3 min): pedido → barista → Ready; gorjeta/pacote → Solscan → aviso | Falta |
| Deck (6–8 slides) | Pronto: https://claude.ai/artifact/RUnS6FtZHQ3U3VDCtxgbKS (8 slides, notas do apresentador em inglês, cópia em `design/deck/`). Falta preencher: total de bebidas do evento, link do Solscan e o pedido aos jurados. Está privado: compartilhar pelo menu Share. |
| Descrição curta, trilha, equipe, carteira para prêmio | Texto abaixo |
| Números de tração | Tirar os totais exatos do Âncora (**Summary by day** / **Download CSV**) e do `/ranking` |

## Descrição curta (EN)

> Beach Coffee Co. runs the coffee bar at Island DAO Floripa. Guests order free drinks from a Telegram Mini App and get pinged when they're ready; the barista runs the bar from one panel that merges Telegram and walk-up orders. Tips and the limited-edition Island DAO coffee bag are paid in USDC on Solana: Solana Pay references let the bot confirm each payment on-chain within a minute and notify the bar, with no wallet setup for the shop and no custody.

## Roteiro do pitch (3 min)

1. **Problema (20 s):** um bar num evento de builders: fila, pedidos perdidos, ninguém carrega dinheiro, e cripto na prática ainda falha (o primeiro QR `solana:` não abria na câmera nem nas exchanges).
2. **Solução (30 s):** pedido pelo Telegram (onde o evento já vive), painel único da barista, pagamento em USDC com confirmação na rede.
3. **Demo ao vivo (60 s):** pedir um Latte no mini app → aparece no painel → Ready → aviso no Telegram. Depois Tip & Bag → Phantom → 💛 Tip no chat da barista + Solscan.
4. **Por que Solana (20 s):** USDC com taxa de centavos e confirmação em segundos; Solana Pay *reference* para conferir cada pagamento sem custódia.
5. **Tração (30 s):** uso real no evento, com números exatos (ex.: 27/10: 97 bebidas, 17 pelo Telegram de 13 pessoas; ~240 na primeira semana). Edição limitada de 20 pacotes.
6. **Próximos passos e pedido (20 s):** levar para outros eventos e cafés (cardápio e marca configuráveis), fidelidade on-chain a partir do ranking, Blink "Tip the barista" para o X.

## Material pronto em `design/`

- `deck/`: os 8 slides do deck (cópia do artifact).
- `screenshots/`: mini app (menu, ranking, Tip & Bag), painel, fluxo de pagamento.
- `social/`: posts do X (semana, dia 27/10, Telegram, edição especial), imagem "how to order".
- `print/`: cartão 10x15 com o QR para `/pay`. `sticker/`, `shirt/`, `logo/`: marca.

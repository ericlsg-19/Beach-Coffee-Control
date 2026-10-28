# Estado do projeto (para retomar numa conversa nova)

Atualizado em 28/10/2026, bot e Âncora na **v1.5.1** (no ar desde 28/10, PR #10).

## O que existe e onde

| Peça | Onde |
|---|---|
| Bot de Telegram | [@BeachCoffeeIslandBot](https://t.me/BeachCoffeeIslandBot), código em `telegram-bot/`, Worker `https://beach-coffee-bot.beachcoffeeco.workers.dev` |
| Mini app (pedido, ranking, Tip & Bag) | `/app` no Worker (`telegram-bot/src/miniapp.js`) |
| Página de pagamento (QR impresso) | `/pay` e `/pay/<reference>` (`telegram-bot/src/paypage.js`, `pay.js`) |
| Âncora, painel da barista | `/panel` no Worker (mesmo banco) e o artifact https://claude.ai/artifact/RxccubnthgDDg1zBeMppKZ (fonte `ancora/ancora.html`) |
| Página antiga de gorjeta (artifact) | https://claude.ai/artifact/UZm5DzoZxPvvpxQ64TjG9P, substituída por `/pay` |
| Saúde | `/health` e `/health?rpc=1` (servidores Solana + última conferência de pagamento) |
| Operação e incidentes | `telegram-bot/OPERATIONS.md` |
| Banner "Scan to order" (QR para o bot, para o notebook da barra) | `design/banner/` |
| Deck do pitch (6 slides) | https://claude.ai/artifact/RUnS6FtZHQ3U3VDCtxgbKS (cópia em `design/deck/`) |
| Arquivos de design (impressão, camiseta, adesivo, posts do X, prints) | `design/` (índice em `design/README.md`) |

## Como funciona o deploy

- Merge na `main` com mudança em `telegram-bot/` roda `.github/workflows/deploy-bot.yml`: testes, `schema.sql`, `wrangler deploy` e `/health`.
- Segredos do GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Segredos do Worker (Cloudflare): `BOT_TOKEN`, `WEBHOOK_SECRET`, `BARISTA_CODE`, opcional `SOLANA_RPC_URL`.
- As sessões do Claude não acessam Cloudflare, Telegram, Solana nem `workers.dev`: o deploy é sempre pelo merge, e a conferência ao vivo é o usuário abrindo `/health?rpc=1`.
- Regras para manter bot e Âncora juntos: `CLAUDE.md`.

## Linha do tempo

- 22/10: Âncora (artifact), página de gorjeta, cartão 10x15, camiseta, logo.
- 24/10: resumo da semana para o X. 25/10: adesivo do pacote Island DAO Edition.
- 27/10: bot no Cloudflare (Workers + D1), mini app, incidente do webhook após `/revoke` (ver OPERATIONS), Âncora dentro do bot (`/panel`), 301 pedidos do Âncora importados, relatórios e ranking (v1.2.0).
- 28/10: v1.3.0 gorjeta + pacote em USDC (Solana Pay, 20 pacotes a 10 USDC); v1.3.1 RPC reserva (o `api.mainnet-beta` bloqueia a Cloudflare com 403); v1.3.2 diagnóstico em `/health?rpc=1`; deck do pitch (8 slides); banner com QR para o notebook; v1.4.0 gorjeta opcional logo depois do pedido no mini app; v1.5.0 `/total` com o relatório do evento todo; v1.5.1 pop-up de gorjeta depois do pedido.
- Números de 27/10 (terça): 97 bebidas, Telegram 17, barra 80, 13 clientes no Telegram, pico 14–15h, Latte 19.

## Pendências

1. **Testar um pagamento real a partir de outra carteira** (1 USDC). Pagar da própria carteira `WTxV6…Hz2u` não muda o saldo e por isso não confirma (comportamento esperado).
2. Opcional: `SOLANA_RPC_URL` com uma URL grátis da Helius (mais estável que o publicnode).
3. Opcional: release `bot-v1.3.2` no GitHub (o proxy da sessão não deixa criar tag; fazer pela interface).
4. Opcional: `/revoke` do token do bot (foi colado no chat em 27/10) e atualizar `BOT_TOKEN` no Cloudflare.
5. Conferir se pedidos da barra de 27/10 duplicam pedidos do Telegram.
6. Submissão ao hackathon da Island DAO: trilha **Payments + Commerce**. Ver `docs/PITCH.md`. Deck pronto (6 slides, demo ao vivo no slide 3), com os números do `/total` em 28/10 12:33: 356 bebidas em 5 dias, 47 pelo Telegram de 33 pessoas. Inscrição IslandHack v5 até 11/11 (rascunho no app da Island DAO; respostas em `design/hackathon/`). Faltam também os vídeos de pitch e de demo.

## Preferências do usuário

- Bebidas são grátis: recibos nunca mostram pagamento. Pagos só gorjeta e o pacote.
- No chat do bot, nada de botões de pedido: a primeira mensagem é a imagem com a seta para o botão **Order ☕**.
- Tudo voltado ao cliente em inglês, no estilo Island DAO (tokens de cor e fontes em `ancora/ancora.html`).
- Nunca pedir tokens ou senhas no chat; segredos vão nas telas de segredos do Cloudflare/GitHub.
- O usuário escreve em português e espanhol.

# Estado do projeto (para retomar numa conversa nova)

Atualizado em 29/10/2026, bot e Âncora na **v1.7.12**, no domínio próprio **drinkbeachcoffee.com** (Solflare como carteira principal).

## O que existe e onde

| Peça | Onde |
|---|---|
| Bot de Telegram | [@BeachCoffeeIslandBot](https://t.me/BeachCoffeeIslandBot), código em `telegram-bot/`, Worker `https://drinkbeachcoffee.com` |
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
- 28/10: v1.3.0 gorjeta + pacote em USDC (Solana Pay, 20 pacotes a 10 USDC); v1.3.1 RPC reserva (o `api.mainnet-beta` bloqueia a Cloudflare com 403); v1.3.2 diagnóstico em `/health?rpc=1`; deck do pitch (8 slides); banner com QR para o notebook; v1.4.0 gorjeta opcional logo depois do pedido no mini app; v1.5.0 `/total` com o relatório do evento todo; v1.5.1 pop-up de gorjeta depois do pedido; v1.6.0 leite sem lactose ou vegetal e correção do bloqueio da Phantom na primeira tentativa (blockhash `finalized`, transação só com a transferência); v1.6.1 escolha do leite obrigatória nas bebidas com leite; v1.6.2 passos escritos na tela (Step 1, 2, 3).
- 29/10 (demo day): v1.7.0 `/demoday` (só Iced Coffee 10 + Iced Latte 10, máx. 3 por pessoa no dia, volta ao normal amanhã), Iced Coffee no cardápio (só em dia de evento), hora do Ready gravada e tempo devolvido no `/total` (5 min de fila cronometrados → 0).
- 29/10 (demo day): v1.7.1 `/demoday` passa a ser **1 bebida por pessoa** ("One drink per person" no mini app). Se o `/demoday` já tinha sido mandado antes do deploy, mandar de novo para valer o novo limite. Para outro limite: `/demoday max=2`.
- 30/10: a Phantom passou a bloquear a gorjeta com "Scam site detected" (o domínio `*.workers.dev` está marcado pelo scanner da Phantom; não está na blocklist pública do GitHub). v1.7.2: botão **"Blocked by Phantom? Use Solana Pay"** no mini app e na página de pagamento: abre um link `solana:` (Solana Pay) e a própria carteira monta a transferência, sem a página pedir assinatura. Falta testar no celular. Solução de vez: domínio próprio + pedir revisão à Phantom.
- 30/10: v1.7.3: depois do pedido, o cartão e o pop-up oferecem também o **pacote Island DAO Edition** (10 USDC, quantos restam); um toque vai direto ao pagamento. Some quando esgota.
- 30/10: v1.7.4: **pausa de almoço todo dia 13:00–14:00** (horário de Floripa). Os pedidos continuam entrando: antes de confirmar, o cliente vê "The barista is on lunch break until 2 pm… will be ready from 2 pm. Order it?"; a barista recebe o pedido com "🍽️ After lunch · from 14:00". `/lunch 12:30-13:30` muda o horário, `/lunch off` desliga. Também pronto para domínio próprio: com `WEBHOOK_URL` apontando para outro domínio, `/app`, `/panel` e `/pay` no workers.dev redirecionam para ele.
- 30/10: v1.7.5: o bot passa para **https://drinkbeachcoffee.com** (`WEBHOOK_URL`), para as carteiras pararem de marcar o site como golpe. O webhook e o botão "Order ☕" se movem sozinhos pelo cron; `/app`, `/panel` e `/pay` no endereço antigo redirecionam. Pedir revisão do domínio novo à Phantom e à Solflare. O card impresso de `/pay` com o endereço antigo continua funcionando (redireciona).
- 30/10: v1.7.6: **Solflare é o botão principal** (quase todos na Vila usam Solflare); Phantom fica como segunda opção e o Solana Pay como plano B ("Blocked by your wallet?").
- 30/10: no domínio novo a Solflare já não mostra "Scam site detected", mas deu "Failed to sign transaction". v1.7.7: antes de abrir a carteira, a página confere o saldo (USDC e SOL) e diz com clareza o que falta; se a carteira falhar no "assinar e enviar", ela só assina e a página envia a transação pela rede. Falta confirmar com um tip real.
- 31/10: v1.7.8: **fecha sozinho no sábado e no domingo** (horário de Floripa) com "The barista is off touching sand 🏝️ Orders open again Monday. Keep building ☕", no mini app e no chat. `/open` num fim de semana abre só aquele dia; na segunda abre sozinho. `/close` continua fechando até o próximo `/open`.
- 31/10: v1.7.9: com o bar fechado o mini app **continua aberto para ver o cardápio, o ranking, dar tip e comprar o pacote**; só o pedido espera, com o aviso ("off touching sand" no fim de semana) logo abaixo das bebidas. `/bags 17` diz quantos pacotes restam (os vendidos no balcão saem do estoque): restam **17 de 20**, mandar `/bags 17` no chat da barista.
- 31/10: v1.7.10: no fim de semana o aviso é sempre "off touching sand", mesmo depois de um `/close`. Atenção: o `/close` manual continua valendo depois do fim de semana; se foi usado, mandar `/open` na segunda de manhã.
- 01/11: v1.7.11: **página de eventos** em https://drinkbeachcoffee.com/eventos (casamentos, aniversários, corporativos; português). Simulador de orçamento: R$ 500 de montagem e deslocamento (fixo) + R$ 15 por convidado para 3 h (2 h 85%, 4 h +15%, 5 h+ +30%, só na parte por convidado), mínimo R$ 1.500, lembrancinha R$ 50 por pacote de 250 g, faixa de ±10%. Envia a mensagem pronta para o WhatsApp +55 48 99830-0443 ou copia para a DM do @beachcoffee.co. Preços em `PRICING` em `telegram-bot/src/eventspage.js`. Base de custo medida no Island DAO: R$ 2,14 de insumos por bebida, R$ 60/h, R$ 40 de deslocamento; R$ 15 por convidado supõe 1,5 bebida por convidado (medir no primeiro evento). Falta: prazo de antecedência das lembrancinhas (FAQ sem número por enquanto). v1.7.12: pagamento na página de eventos: 50% na reserva da data e 50% ao final do evento (passo a passo, FAQ e nota do simulador).
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

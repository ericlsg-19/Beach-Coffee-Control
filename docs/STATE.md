# Estado do projeto (para retomar numa conversa nova)

Atualizado em 06/11/2026, bot e Âncora na **v1.13.0**, no domínio próprio **drinkbeachcoffee.com** (Solflare como carteira principal).

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
- 02/11: v1.7.13: botões de carteira nas cores de cada app (Solflare amarelo #FBEE64 com texto preto, Phantom lavanda #A99EEC com texto branco), no mini app e na página de pagamento.
- 02/11: v1.7.14: **página para organizadores web3** em https://drinkbeachcoffee.com/web3 (inglês): "Coffee, onchain", prova do Island DAO (460+ cafés, 0→94% no Telegram, 5 min → 0, tips em USDC), como funciona, o que o organizador recebe, Island DAO Edition e contato por WhatsApp ou DM no X (@BeachCoffeco).
- 02/11: v1.7.15: sem patrocínio por enquanto (o `/sponsor` saiu do bot e da página; fazer quando houver um patrocinador). Página `/web3` com o fundo verde do degradê da marca e a bag num card cor de areia. v1.7.16: topo mais curto, "2k+ coffees served in one month, during Island DAO" (número informado pelo Eric) e "On the island, anyone can build." numa linha própria.
- 03/11: v1.8.0: **Iced Matcha** no cardápio (depois do Matcha, com escolha de leite, ícone de copo gelado com a folha). Também na página de eventos (14 bebidas) e no story do cardápio.
- 03/11: v1.8.1: **limite de 3 bebidas por pessoa por dia** (contam os pedidos do dia não cancelados). O mini app mostra "Up to 3 drinks per person a day · you've had N" e, no limite, "That's your 3 drinks for today". `/limit 5` muda, `/limit off` tira.
- 03/11: v1.8.2: **`/out` e `/back`** para o que acabou: bebidas e leites aparecem "Not available" no mini app, sem dar para tocar, e o bot recusa. Acabou matcha e leite sem lactose e vegetal: `/out matcha icedmatcha lactosefree plant`.
- 04/11: v1.9.0: **pagamentos mais confiáveis e visíveis.** USDC que chega sem *reference* (exchange, transferência simples) agora é detectado: paga o único checkout aberto com o mesmo valor, senão a barista recebe "💸 X USDC arrived outside the app" (tabela `direct_transfers`, aparece no `/today`). A página de pagamento e o mini app registram cada passo (botão tocado, carteira, erro, falta de USDC/SOL, transação descartada pela rede) em `pay_events`, e **`/payments`** mostra o funil dos últimos 7 dias e os últimos erros. A página avisa quando a rede descartou a transação (nada foi cobrado, pode pagar de novo) e explica os erros comuns em palavras claras.
- 04/11: v1.9.1: o número de tração passa a ser **2k+ cafés em um mês** em todo lugar (README, deck slide 5 e PDF, pitch, respostas do formulário, `/eventos` "2 mil+"; `/web3` já dizia).
- 05/11: v1.9.2: **descrição curta embaixo do nome de cada bebida** no mini app (ex.: Cappuccino "Espresso, milk and thick foam"). Os textos ficam em `DESCRIPTIONS` em `telegram-bot/src/miniapp.js`.
- 05/11: v1.10.0: **app instalável (PWA) para a Solana dApp Store / Seeker.** Fora do Telegram o `/app` mostra o menu ao vivo e "Order on Telegram"; o Tip & Bag paga com a carteira do celular pelo Mobile Wallet Adapter. Manifest, ícones, `sw.js`, `/.well-known/assetlinks.json` (`ANDROID_PACKAGE`, `ANDROID_CERT_SHA256` no `wrangler.toml`) e `/privacy`. Passo a passo em `docs/SEEKER.md`.
- 06/11: v1.10.1: ícone do app e banner da loja com a **logo no degradê verde da marca** ("BEACH COFFEE CO." creme, como a foto do Instagram). Banner: "The coffee system for web3 events". O ícone dentro do .apk só muda gerando o pacote de novo no PWABuilder **com a mesma chave** (Use mine).
- 06/11: v1.10.2: página `/terms`. **App enviado à Solana dApp Store (v1.0.0, In Review)**, com publisher Beach Coffee Co. e carteira `H9wg…Er5N`. Ver `docs/SEEKER.md`.
- 06/11: v1.11.0: **check-in do café onchain**, como o check-in da Island DAO: a carteira do cliente assina um memo por pedido e a carteira de check-in do bar paga a taxa. Liga com o segredo `CHECKIN_KEY` no Cloudflare (ver OPERATIONS.md). `/checkins` para a barista. Telas em `design/app/checkin-*.png`.
- 06/11: v1.11.1: **`/checkins setup`**: o bot cria a própria carteira que paga as taxas do check-in; mandar SOL para o endereço e `/checkins on`. `/checkins off` desliga.
- 06/11: v1.11.2: "Solana is busy" no check-in: o blockhash agora tenta 3 vezes e fica em cache por 20 s (gorjetas e check-in). A solução de vez é o segredo `SOLANA_RPC_URL` (Helius grátis) no Cloudflare.
- 08/11: v1.13.0 no ar: **race boost** (1 USDC = +1 café no ranking, 1 por dia, visível como ⚡) e placar **Top patrons** (gorjetas). O jogo completo do protótipo Giants (fila paga, pontos, loja) foi revertido: o ranking já empolga sozinho. Ver OPERATIONS.md.
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

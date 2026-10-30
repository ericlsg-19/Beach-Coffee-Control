# Beach Coffee Co. — bot de Telegram

O cliente pede a bebida pelo Telegram, o pedido chega no chat da barista com os botões **✅ Ready** e **❌ Cancel**, e ao tocar **Ready** o cliente recebe uma mensagem avisando que está pronto.

Roda de graça no **Cloudflare Workers**, com os pedidos guardados num banco **D1**.

## Como funciona

**Cliente**
1. Abre o bot e toca em **Order ☕**, ao lado do campo de mensagem. Abre o mini app (`/app`), com o visual do Âncora e as 12 bebidas.
2. Escolhe a bebida, toca no botão dourado **Order …** e recebe no chat o número do pedido (ex.: *Order #14 · Flat White*).
3. Quando a barista toca **Ready**, recebe: *Your Flat White is ready! Pick it up at the bar.* No mini app, o pedido aparece como **Ready**.

Quem manda `/start` ou qualquer mensagem recebe a explicação de que o pedido é feito pelo botão **Order ☕**.

Nas bebidas com leite (Cappuccino, Flat White, Latte, Iced Latte, Mocha, Matcha, Hot Chocolate) o pedido tem 3 passos, escritos na tela: **Step 1 · Pick your drink**, **Step 2 · Choose your milk** (Regular, Lactose-free ou Plant-based, nada vem marcado) e **Step 3 · Confirm your order**, com o resumo, quando o botão **Order** libera. Nas outras bebidas a confirmação é o Step 2. Sem escolher o leite não dá para pedir; o bot também recusa. A barista vê 🥛 no pedido, no chat e no painel.

Cada cliente pode ter no máximo 3 bebidas esperando ao mesmo tempo.

**Barista** (no chat configurado com `/barista`)
- Cada pedido chega com número, bebida, nome do cliente e hora, e os botões **Ready** / **Cancel**.
- `/today` e `/report AAAA-MM-DD`: relatório do dia (Telegram × barra, cada bebida, horário de pico, maior cliente). Às 23:00 o bot manda o do dia sozinho.
- `/demoday`: modo de evento **só para hoje**: o mini app mostra só Iced Coffee (10) e Iced Latte (10), com quantos restam, e cada pessoa pede só 1 no dia. Amanhã o cardápio completo volta sozinho; `/demoday off` desliga antes. Para mudar: `/demoday icedcoffee=15 icedlatte=10 max=2`.
- `/lunch`: a pausa de almoço diária (13:00–14:00 por padrão). Os pedidos continuam entrando, mas o cliente confirma antes que fica pronto depois do almoço, e a barista vê "🍽️ After lunch". `/lunch 12:30-13:30` muda, `/lunch off` desliga.
- `/total`: o evento todo até agora, com o tempo devolvido para buildar (pedidos pelo Telegram × 5 min de fila, cronometrados na Vila) e, para os pedidos marcados prontos desde a v1.7.0, o tempo médio do pedido até o Ready, somando todos os dias (bebidas, Telegram × barra, melhor dia, cada bebida, clientes, gorjetas e pacotes).
- `/queue`: lista das bebidas esperando.
- `/ranking`: quem mais pediu pelo Telegram no evento todo.
- `/panel`: abre o Âncora, o painel da barista, com pedidos do Telegram e da barra, ranking e resumo por dia.
- `/close` e `/open`: pausar e voltar a aceitar pedidos (ex.: à noite).

No mini app, o cliente tem a aba **Ranking 🏆** com o Top 10 (primeiro nome e inicial do sobrenome) e a própria posição.

**Gorjeta e pacote de café (USDC na Solana)**

As bebidas são grátis: o recibo do pedido nunca mostra pagamento. Para dar gorjeta ou comprar o **Island DAO Limited Edition coffee bag**:
- No mini app, aba **Tip & Bag**: escolhe 2, 5, 10 USDC ou outro valor, ou o pacote (preço em `BAG_PRICE_USDC`, 10 USDC), e toca **Pay with Phantom** ou **Pay with Solflare**. A carteira abre a página de pagamento, que monta a transferência de USDC; o cliente só confirma.
- **Logo depois do pedido:** sobe um pop-up **Tip the barista?** (uma vez por visita, com **Maybe later** para fechar), e a tela "on the way" também mostra **💛 Tip the barista?** com 2, 5, 10 USDC ou outro valor. É opcional (as bebidas continuam grátis); um toque abre o **Tip & Bag** já no valor e vai direto para o pagamento.
- Fora do Telegram: `https://beach-coffee-bot.beachcoffeeco.workers.dev/pay` (é para onde o QR impresso deve apontar). Funciona com a câmera do celular, porque é um link `https://`.
- **Edição limitada:** são `BAG_STOCK` pacotes (20). A tela mostra quantos restam; quando acabam, aparece **Sold out** e a venda para. Um checkout de pacote sem pagar segura uma unidade por 15 minutos, para não vender o mesmo pacote duas vezes. No chat da barista, `/bags` mostra vendidos, entregues e restantes.
- Qualquer outra carteira ou exchange: a página mostra o endereço **puro** e o valor, cada um com botão **Copy**. Esses envios manuais não são reconhecidos sozinhos: o cliente mostra a carteira para a barista.

Cada pagamento leva uma *reference* (padrão Solana Pay). O bot procura a transação na rede a cada minuto (e a cada 3 s enquanto a página está aberta) e só aceita se o endereço recebeu o valor inteiro em USDC. Aí a barista recebe 💛 *Tip* ou 🛍️ *Coffee bag #N paid* com o botão **Handed over**, e o cliente do Telegram recebe o agradecimento. O `/today`, o relatório das 23:00 e o Âncora (cartão **Tips & Bags**) mostram o total do dia.

> Por que o QR antigo não funcionava: ele guardava `solana:WTxV…` (com `solana:` na frente). Câmera de celular, exchanges e a maioria das carteiras não entendem isso como endereço, e quem copiava levava o `solana:` junto. Agora o endereço que se copia é sempre o puro, e o formato `solana:` só aparece dentro do QR "Scan with a wallet app", para o leitor das carteiras.

O dia e a hora seguem o fuso de Florianópolis (`America/Sao_Paulo`).

## Configuração (uma vez só)

Você precisa de: o **token** do bot (do @BotFather) e uma conta grátis no **Cloudflare**.

1. Entre na sua conta do Cloudflare pelo terminal (abre o navegador):
   ```sh
   cd telegram-bot
   npx wrangler login
   ```
2. Crie o banco e copie o `database_id` que aparece para o `wrangler.toml`:
   ```sh
   npx wrangler d1 create beach-coffee-bot
   ```
3. Crie as tabelas:
   ```sh
   npx wrangler d1 execute beach-coffee-bot --remote --file schema.sql
   ```
4. Guarde os segredos (cada comando pede o valor):
   ```sh
   npx wrangler secret put BOT_TOKEN        # o token do @BotFather
   npx wrangler secret put WEBHOOK_SECRET   # qualquer senha longa, só letras e números
   npx wrangler secret put BARISTA_CODE     # código para virar barista, ex.: uma palavra só sua
   ```
5. Publique:
   ```sh
   npx wrangler deploy
   ```
   O comando mostra o endereço do bot, algo como `https://beach-coffee-bot.SEU-USUARIO.workers.dev`.
6. Conecte o Telegram ao bot (troque os três valores):
   ```sh
   curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
     -d "url=https://beach-coffee-bot.SEU-USUARIO.workers.dev" \
     -d "secret_token=<WEBHOOK_SECRET>" \
     -d 'allowed_updates=["message","callback_query"]'
   ```
7. No Telegram, mande para o bot: `/barista <BARISTA_CODE>`. A partir daí os pedidos chegam nesse chat. Para receber num grupo, adicione o bot ao grupo e mande o mesmo comando lá.

Para trocar o endereço que recebe gorjetas e pacotes, ou o preço do pacote, edite `SOLANA_ADDRESS`, `BAG_PRICE_USDC` e `BAG_STOCK` no `wrangler.toml` e publique de novo. `SOLANA_ADDRESS` vazio desliga a aba **Tip & Bag** e o `/pay`.

O bot consulta a Solana por RPCs públicos, um depois do outro: `solana-rpc.publicnode.com` e, por último, `api.mainnet-beta.solana.com` (que recusa com `403 Access forbidden` pedidos vindos da Cloudflare e de páginas web). A página de pagamento faz o mesmo quando precisa do *blockhash* da transação. Para o serviço mais estável, crie uma URL de RPC grátis (Helius, QuickNode, Alchemy…) e guarde como segredo: `npx wrangler secret put SOLANA_RPC_URL`; ela passa a ser a primeira tentativa. Para ver quais RPCs respondem agora: `/health?rpc=1`.

## Testes

```sh
cd telegram-bot
npm test
```

Os testes rodam o bot com um banco em memória e um Telegram de mentira, sem precisar de internet.

## Operação

Saúde, logs, incidentes e como fazer deploy de novo: veja [OPERATIONS.md](OPERATIONS.md).

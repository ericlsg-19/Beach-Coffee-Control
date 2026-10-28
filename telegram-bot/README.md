# Beach Coffee Co. — bot de Telegram

O cliente pede a bebida pelo Telegram, o pedido chega no chat da barista com os botões **✅ Ready** e **❌ Cancel**, e ao tocar **Ready** o cliente recebe uma mensagem avisando que está pronto.

Roda de graça no **Cloudflare Workers**, com os pedidos guardados num banco **D1**.

## Como funciona

**Cliente**
1. Abre o bot e toca em **Order ☕**, ao lado do campo de mensagem. Abre o mini app (`/app`), com o visual do Âncora e as 12 bebidas.
2. Escolhe a bebida, toca no botão dourado **Order …** e recebe no chat o número do pedido (ex.: *Order #14 · Flat White*).
3. Quando a barista toca **Ready**, recebe: *Your Flat White is ready! Pick it up at the bar.* No mini app, o pedido aparece como **Ready**.

Quem manda `/start` ou qualquer mensagem recebe a explicação de que o pedido é feito pelo botão **Order ☕**.

Cada cliente pode ter no máximo 3 bebidas esperando ao mesmo tempo.

**Barista** (no chat configurado com `/barista`)
- Cada pedido chega com número, bebida, nome do cliente e hora, e os botões **Ready** / **Cancel**.
- `/today` e `/report AAAA-MM-DD`: relatório do dia (Telegram × barra, cada bebida, horário de pico, maior cliente). Às 23:00 o bot manda o do dia sozinho.
- `/queue`: lista das bebidas esperando.
- `/ranking`: quem mais pediu pelo Telegram no evento todo.
- `/panel`: abre o Âncora, o painel da barista, com pedidos do Telegram e da barra, ranking e resumo por dia.
- `/close` e `/open`: pausar e voltar a aceitar pedidos (ex.: à noite).

No mini app, o cliente tem a aba **Ranking 🏆** com o Top 10 (primeiro nome e inicial do sobrenome) e a própria posição.

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

Para trocar o endereço Solana ou tirar a linha de pagamento, edite `SOLANA_ADDRESS` no `wrangler.toml` e publique de novo.

## Testes

```sh
cd telegram-bot
npm test
```

Os testes rodam o bot com um banco em memória e um Telegram de mentira, sem precisar de internet.

## Operação

Saúde, logs, incidentes e como fazer deploy de novo: veja [OPERATIONS.md](OPERATIONS.md).

# Bot de pedidos — operação, incidentes e deploy

Bot: [@BeachCoffeeIslandBot](https://t.me/BeachCoffeeIslandBot) · Worker: `https://beach-coffee-bot.beachcoffeeco.workers.dev`
Conta Cloudflare: `b3854321ef7301985156cc9101001859` · Banco D1: `beach-coffee-bot` (`27fa6662-7253-4d3b-b9b2-ca84f776ae0f`)

Horários em UTC. Florianópolis = UTC−3.

## Como as peças se ligam

```
Cliente (Telegram) ──► Telegram ──webhook POST /──► Worker (Cloudflare) ──► D1 (pedidos)
        │                                              │
        └── botão "Order ☕" ──► GET /app (mini app) ───┤  POST /api/session, /api/order
                                                       │  (assinatura initData conferida)
Barista (Telegram) ◄── mensagem com Ready/Cancel ◄─────┘
Cron (a cada minuto) ──► getWebhookInfo / setWebhook / setChatMenuButton
```

## Relatório de incidente — 27/10/2026

**Sintoma:** depois da troca do token do bot (`/revoke` no BotFather), o bot parou de responder ao `/start`.

| Hora (UTC) | O que aconteceu |
|---|---|
| 15:57 | Primeiro pedido real funcionando (#1, Freddo Espresso, `ready`). |
| depois de 15:57 | Token do bot trocado com `/revoke`. O Telegram apagou o webhook junto com o token antigo. A partir daí nenhuma mensagem chegava ao Worker. |
| 17:01–17:14 | Testes de produção bloqueados: domínio do Worker fora da rede da sessão de desenvolvimento e token Cloudflare sem a conta selecionada / sem permissão de D1. Corrigido nas permissões do token. |
| ~17:20 | Logs do Worker ativados (`[observability]` no `wrangler.toml`). |
| ~18:17 | Tentativa manual de reconectar pelo navegador respondeu `404 Not Found`: o token colado no link estava incompleto/errado. O `BOT_TOKEN` salvo no Cloudflare estava certo. |
| 18:09–18:14 | Deploy de uma verificação agendada (cron) que reconecta o webhook sozinha. |
| 18:19:43 | Primeira execução: `webhook info {"url":""}` → `webhook reset {"ok":true,"description":"Webhook was set"}`. Bot de volta. |
| 18:21 | Teste E2E pelo chat: `/start` → pedido #2 → Ready. Sem erros. |
| 18:27 | Mini app no ar; botão "Order ☕" configurado (`menu button set {"ok":true}`). |
| 18:33–19:02 | Pedidos reais pelo mini app (#4 a #11), de 8 pessoas diferentes. 0 erros nos logs. |

**Causas**
1. `/revoke` invalida o token **e remove o webhook**. Sem webhook, o Telegram não entrega nada ao Worker, e o bot fica mudo sem nenhum erro visível.
2. O link manual de `setWebhook` foi montado com o token errado (`404 Not Found` do Telegram).

**Correções**
- Cron a cada minuto (`ensureWebhook`): se o webhook estiver vazio, apontando para outro lugar ou com erro 401/403, registra de novo. Também mantém o botão "Order ☕" (`ensureMenuButton`).
- Logs de auditoria: `order created`, `order ready`, `order cancelled`, `order refused`, além de `telegram <método> failed` em qualquer chamada recusada pelo Telegram.
- `GET /health` para checar o bot em um clique.

**Pontos de atenção**
- Se o `BOT_TOKEN` estiver errado, o cron não consegue consertar: aparece `telegram getWebhookInfo failed` nos logs. Solução: atualizar o secret `BOT_TOKEN`.
- Logs só existem a partir de ~17:20 UTC de 27/10 e ficam guardados por poucos dias no plano grátis.
- Pedidos que o cliente não consegue fazer (bar fechado, 3 bebidas esperando) não são erro: aparecem como `order refused` nos logs.

## Âncora no bot e relatórios (v1.1.0)

- **Painel da barista:** `https://beach-coffee-bot.beachcoffeeco.workers.dev/panel`, ou mande `/panel` no chat da barista (o botão já leva o código). Pede o `BARISTA_CODE` uma vez por aparelho. Mostra os pedidos do Telegram e da barra juntos, atualiza a cada 5 segundos, e Ready/✕ num pedido do Telegram avisa o cliente.
- **Pedidos da barra** ficam no mesmo banco, com `customer_chat = 0`.
- **Relatórios:** `/today` (hoje), `/report AAAA-MM-DD` (outro dia) e, todo dia às 23:00 de Floripa (`0 2 * * *` UTC), o resumo automático no chat da barista: total, Telegram × barra, cada bebida, a mais pedida, horário de pico, clientes do Telegram e quantos ficaram esperando.
- **CSV:** botão **Download CSV** no painel, com todos os pedidos.
- **Histórico:** os 301 pedidos do Âncora no Claude (22, 23, 26 e 27/10, até 18:55 UTC) foram importados como pedidos da barra. A data do corte está em `settings.ancora_imported_until`.

## Gorjetas e pacote de café em USDC (v1.3.0)

- **Onde:** aba **Tip & Bag** no mini app e `https://beach-coffee-bot.beachcoffeeco.workers.dev/pay` (QR impresso). Bebidas continuam grátis.
- **Como o bot confirma:** cada checkout tem uma *reference* (Solana Pay) guardada na tabela `payments`. O cron de cada minuto chama `getSignaturesForAddress(reference)` para os checkouts das últimas 2 horas e confere com `getTransaction` que `SOLANA_ADDRESS` recebeu o valor inteiro em USDC (mint `EPjFWdd5…Dt1v`). Uma mesma transação não paga dois checkouts (`signature` é única). Checkouts sem pagamento viram `expired` depois de 24 h.
- **Logs:** `payment created`, `payment paid`, `payment check failed` (RPC fora do ar ou limitado), `payment signature reused`.
- **RPC:** `SOLANA_RPC_URL` (se existir), depois `solana-rpc.publicnode.com`, depois `api.mainnet-beta.solana.com`. Em 28/10 o primeiro pagamento real falhou com `failed to get recent blockhash: 403 Access forbidden`: o `api.mainnet-beta` recusa a Cloudflare e páginas web. A v1.3.1 passou a tentar os outros RPCs antes.
- **Configuração:** `SOLANA_ADDRESS`, `BAG_PRICE_USDC` (10) e `BAG_STOCK` (20 pacotes; `/bags` mostra o que resta) no `wrangler.toml`; segredo opcional `SOLANA_RPC_URL`.

| Sintoma | Nos logs | O que fazer |
|---|---|---|
| Cliente pagou e nada aconteceu | `payment check failed … 429` ou `403` | Nenhum RPC respondeu. Abrir `/health?rpc=1` para ver quais falham; criar `SOLANA_RPC_URL` (Helius etc.) e fazer deploy. |
| "The Solana network didn't answer" na página | — | Mesma causa: nenhum RPC deu o *blockhash*. `/health?rpc=1` e `SOLANA_RPC_URL`. |
| Cliente pagou e nada aconteceu | nenhum `payment created` | Pagou copiando o endereço (sem *reference*): conferir na carteira; não é reconhecido sozinho. |
| "Couldn't send" na página | — | Falta USDC na Solana ou um pouco de SOL para a taxa na carteira do cliente. |

## Verificar se está tudo bem

1. Abra **`https://beach-coffee-bot.beachcoffeeco.workers.dev/health`**. Esperado:
   ```json
   {"ok":true,"version":"1.3.0","day":"2026-10-28","open":true,"barista_set":true,"orders_today":11,"waiting":3,"payments":true}
   ```
   - `ok:false` → problema no banco (binding `DB` ou tabelas).
   - `open:false` → o bar está fechado (`/open` no chat da barista).
   - `barista_set:false` → mandar `/barista <código>` no chat da barista.
2. Logs: Cloudflare → **Workers & Pages → beach-coffee-bot → Logs**. A cada minuto deve aparecer `webhook info {"url":"https://beach-coffee-bot…"}`.

| Sintoma | Nos logs | O que fazer |
|---|---|---|
| Bot não responde | `webhook info {"url":""}` seguido de `webhook reset` | Nada: se reconecta sozinho em até 1 minuto. |
| Bot não responde | `telegram getWebhookInfo failed {"error_code":401}` | `BOT_TOKEN` errado: atualizar o secret e fazer deploy. |
| Bot não responde e não aparece nada | sem eventos novos | Worker sem deploy ou cron parado: fazer deploy (abaixo). |
| Mini app diz "Please open the menu from the bot" | `/api/session` 401 | Abrir pelo botão **Order ☕** dentro do Telegram, não pelo navegador. |
| Pedido não chega na barista | `telegram sendMessage failed` | Mandar `/barista <código>` de novo no chat certo. |

## Reiniciar = fazer deploy de novo

Um Worker não tem processo para reiniciar: cada deploy substitui a versão em segundos, sem perder pedidos (eles ficam no D1). O cron reconecta o webhook no minuto seguinte.

### Opção A — GitHub Actions (recomendado)

O workflow `.github/workflows/deploy-bot.yml` roda os testes, aplica o `schema.sql` (seguro de repetir) e faz o deploy, terminando com um `/health`.

Uma vez só, no GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
- `CLOUDFLARE_API_TOKEN`: token com **Workers Scripts: Edit** e **D1: Edit**, conta incluída.
- `CLOUDFLARE_ACCOUNT_ID`: `b3854321ef7301985156cc9101001859`

Depois, para fazer deploy: **Actions → Deploy Telegram bot → Run workflow**. Também roda sozinho a cada push na `main` que mexa em `telegram-bot/`.

### Opção B — pelo computador

```sh
cd telegram-bot
npm test
export CLOUDFLARE_API_TOKEN=...            # ou: npx wrangler login
export CLOUDFLARE_ACCOUNT_ID=b3854321ef7301985156cc9101001859
npm run db:schema                          # cria tabelas que faltarem (seguro repetir)
npm run deploy
npm run logs                               # logs ao vivo
```

### Opção C — pelo painel do Cloudflare (voltar versão)

**Workers & Pages → beach-coffee-bot → Deployments**: escolher uma versão anterior e **Rollback**.

### Depois de trocar o token do bot (`/revoke`)

1. Cloudflare → beach-coffee-bot → **Settings → Variables and Secrets → BOT_TOKEN → Edit** → colar o token novo → **Deploy**.
2. Esperar 1 minuto: o cron registra o webhook de novo. Conferir nos logs `webhook reset {"ok":true…}`.

## Testes

```sh
cd telegram-bot && npm test
```

Cobrem: webhook com e sem segredo, pedido completo pelo chat, Ready/Cancel, limite de 3 bebidas, `/today`, `/queue`, `/close`, código de barista, cron do webhook, mini app (página, assinatura initData forjada/expirada, pedido), imagem de boas-vindas e `/health`.

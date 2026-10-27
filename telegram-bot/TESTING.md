# Roteiro de teste do bot (produção)

Bot: `@BeachCoffeeIslandBot` · Worker: `https://beach-coffee-bot.beachcoffeeco.workers.dev`
Conta Cloudflare: `b3854321ef7301985156cc9101001859` · D1: `beach-coffee-bot` (`27fa6662-7253-4d3b-b9b2-ca84f776ae0f`)

## Pré-requisitos da sessão

- Variável de ambiente `CLOUDFLARE_API_TOKEN` (Workers + D1 Edit), configurada nas
  configurações do ambiente, nunca colada no chat.
- Network access: `api.cloudflare.com`, `api.telegram.org`,
  `beach-coffee-bot.beachcoffeeco.workers.dev`.

```sh
cd telegram-bot
export CLOUDFLARE_ACCOUNT_ID=b3854321ef7301985156cc9101001859 WRANGLER_SEND_METRICS=false
```

## Testes

| # | Teste | Como | Esperado |
|---|---|---|---|
| T0 | Testes automáticos | `npm test` | 6/6 passando |
| T1 | Saúde | `curl -i https://beach-coffee-bot.beachcoffeeco.workers.dev` | 200, "bot is running" |
| T2 | POST sem segredo | `curl -i -X POST -d '{}' <worker>` | 403 |
| T3 | POST com segredo errado | idem com `-H 'X-Telegram-Bot-Api-Secret-Token: errado'` | 403 |
| T4 | Config do Worker | `npx wrangler@3.114.0 secret list` + `wrangler.toml` | `BOT_TOKEN`, `WEBHOOK_SECRET`, `BARISTA_CODE`; binding `DB` |
| T5 | Banco | `npx wrangler@3.114.0 d1 execute beach-coffee-bot --remote --command "SELECT * FROM settings"` | `barista_chat` preenchido |
| T6–T10 | E2E real | `npx wrangler@3.114.0 tail beach-coffee-bot --format pretty` enquanto a dona do bot manda `/start`, faz um pedido, toca Ready, usa `/today`, `/queue`, `/close`, `/open` | sem erros `telegram ... failed` nos logs; pedido `pending` → `ready` no D1 |
| T11 | Limpeza | `d1 execute ... --command "DELETE FROM orders WHERE day = '<hoje>'"` (só os pedidos de teste) | `/today` volta a zero |

Erros comuns nos logs:
- `telegram sendMessage failed {"error_code":401}` → `BOT_TOKEN` errado (atualizar o secret).
- `D1_ERROR` / `no such table` → binding `DB` ou tabelas (rodar `schema.sql`).
- Nada aparece nos logs ao mandar `/start` → webhook desconectado ou segredo diferente:
  conferir `getWebhookInfo` no navegador da dona do bot.

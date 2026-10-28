# Beach Coffee Co. — working rules

Two front-ends share one menu and one version number:

- **Telegram bot** (`telegram-bot/`): the source of truth. Live on Cloudflare
  (`beach-coffee-bot`), deployed with `cd telegram-bot && npm run deploy`.
- **Âncora** (`ancora/ancora.html`): the barista page. Served live by the bot at `/panel`
  (reads/writes the bot database; `npm run sync:ancora` copies it into `src/ancora-html.js`)
  and also published as the claude.ai
  artifact https://claude.ai/artifact/RxccubnthgDDg1zBeMppKZ. It must follow the bot.

When you change one, change the other in the same work:

1. Menu changes go in both `DRINKS` lists (`telegram-bot/src/worker.js` and
   `ancora/ancora.html`) and both `ICONS` maps (`telegram-bot/src/miniapp.js` and
   `ancora/ancora.html`), same ids, names and order.
2. Bump `VERSION` in `telegram-bot/src/worker.js` and the `Âncora vX.Y.Z` line in
   `ancora/ancora.html` together.
3. Run `cd telegram-bot && npm test`. The test "Âncora and the bot share the same menu
   and version" fails if they drift.
4. `cd telegram-bot && npm run deploy` (syncs Âncora into the worker first) and republish the
   Âncora artifact (same URL) from `ancora/ancora.html`.

Operations, incidents and redeploy steps: `telegram-bot/OPERATIONS.md`.

Where things stand (versions, links, pending items, user preferences): `docs/STATE.md`.
Hackathon submission and pitch: `docs/PITCH.md`. Final design files: `design/`.
Keep `docs/STATE.md` current when something ships.

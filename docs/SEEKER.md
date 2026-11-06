# Beach Coffee na Solana dApp Store (Seeker)

O app é o próprio site instalável (PWA): `https://drinkbeachcoffee.com/app`. Na loja ele entra como app Android (TWA) que abre o site em tela cheia.

## O que o app faz (v1.10.0)
- Menu ao vivo com descrição de cada bebida, o que acabou e se o bar está aberto (`/api/menu`).
- **Order on Telegram**: o pedido continua pelo bot (recibo e aviso de "pronto").
- **Tip & Bag**: o checkout paga com a carteira do celular pelo **Mobile Wallet Adapter** (no Seeker, a carteira do próprio aparelho; no Android, Phantom/Solflare). Fora do Android, Solflare/Phantom/Solana Pay como antes.
- Instalável: `manifest.webmanifest`, ícones em `/icons/`, `sw.js` (abre offline com aviso), política em `/privacy`.

## Situação
- 05/11: pacote Android gerado no PWABuilder (`com.drinkbeachcoffee.app`, chave nova). Impressão digital `EF:5D:29:…:8A:56` no `wrangler.toml` → `/.well-known/assetlinks.json`. O .zip (keystore e senhas) fica guardado com o Eric.

- 06/11: ícone e banner trocados para a logo verde (v1.10.1). Para o ícone no celular mudar, gerar o pacote de novo no PWABuilder com **Signing key → Use mine** (o `signing.keystore` e as senhas do zip), nunca uma chave nova.

- 06/11: **v1.0.0 enviado à Solana dApp Store, em análise (In Review).** Publisher "Beach Coffee Co." (KYC aprovado), carteira de publisher `H9wg…Er5N` (Solflare): toda atualização tem que ser assinada por ela. O .apk final foi gerado de novo com o ícone verde e a **mesma chave** (Use mine; impressão digital `EF:5D:29:1E…`). Editor's Choice pedido (headline, tag, `design/app/editors-choice-1200.png`).

## Passo a passo (Eric)
1. **Gerar o app Android:** em pwabuilder.com, colar `https://drinkbeachcoffee.com/app` → *Package for stores* → **Android**.
   - Package ID: `com.drinkbeachcoffee.app` · App name: `Beach Coffee Co.` · Launcher name: `Beach Coffee`.
   - Signing key: **Create new**. Baixar o .zip.
2. **Guardar o .zip em lugar seguro.** O `signing.keystore` e as senhas (`signing-key-info.txt`) são segredo: sem eles não dá para atualizar o app. Nunca colar no chat.
3. **Mandar para o Claude só a impressão digital SHA-256** (está no `assetlinks.json` do .zip, formato `AA:BB:…`; é pública). Ela vai em `ANDROID_CERT_SHA256` no `telegram-bot/wrangler.toml`, e depois do deploy `https://drinkbeachcoffee.com/.well-known/assetlinks.json` mostra o app. Sem isso o app abre com a barra do navegador.
4. **Testar:** instalar o `.apk` do .zip num Android. Deve abrir sem barra de endereço.
5. **Publicar:** no Solana dApp Publisher Portal (publish.solanamobile.com), conectar a carteira, criar o publisher e o app, subir o `.apk` assinado e preencher a ficha (textos e imagens em `design/app/`). A taxa é pequena, em SOL (NFT do app e armazenamento). A análise leva uns 3–5 dias úteis.

Ficha da loja: textos em `design/app/listing.md`, ícone `design/app/icon-512.png`, telas e banner em `design/app/`.
Política de privacidade: `https://drinkbeachcoffee.com/privacy`.

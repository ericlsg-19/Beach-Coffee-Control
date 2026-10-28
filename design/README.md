# Design

Arquivos finais entregues, guardados aqui para não depender de uma conversa.

| Pasta | O que tem |
|---|---|
| `print/` | Cartão 10x15 (PDF para gráfica e PNG): Island DAO Coffee Bag 10 USDC, QR para `/pay` (abre pela câmera). |
| `sticker/` | Adesivo do pacote Island DAO Edition, 80x110 mm (PDF com sangria, PNG, mockup). |
| `shirt/` | Camiseta: frente BEACH COFFEE CO. (SVG bege e marrom), costas Hebrews 6:19 (PNG bege e marrom), mockup. |
| `logo/` | Logo badge (SVG/PNG redondo e quadrado) e o logo original. |
| `social/` | Posts do X: resumo da semana, resumo de 27/10, pedido pelo Telegram, edição especial na Vila; imagem "how to order" do bot. Textos dos posts em `social/posts.md`. |
| `hackathon/` | Formulário **Add your project** da Island DAO V5: respostas de cada campo (`README.md`), logo quadrado e banner 16:9. Gerados por `templates/project-banner.mjs`. |
| `banner/` | Banner "Scan to order" para deixar no notebook: QR para o bot (@BeachCoffeeIslandBot). `order-banner.html` (abrir no navegador em tela cheia, F11; se ajusta a qualquer tela) e `order-banner.png` (3200x1800). Gerado por `templates/order-banner.mjs`. |
| `deck/` | Deck do pitch (7 slides), cópia do artifact https://claude.ai/artifact/RUnS6FtZHQ3U3VDCtxgbKS. As imagens apontam para os arquivos guardados no artifact (`/_blob/…`). |
| `screenshots/` | Telas do mini app, do painel e do fluxo de gorjeta/pacote (para o deck). |
| `templates/` | HTML editável do cartão, do adesivo e dos resumos do X. Para gerar o PNG: `NODE_PATH=$(npm root -g) node render-x.js` (Playwright), ajustando o nome do arquivo. |

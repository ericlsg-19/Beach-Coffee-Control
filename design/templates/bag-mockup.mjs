// Island DAO Edition bag mockup with a transparent background: ../sticker/bag-mockup-transparent.png.
// Run: cd design/templates && NODE_PATH=$(npm root -g) node bag-mockup.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sticker = "data:image/png;base64," + readFileSync(new URL("../sticker/beach-coffee-sticker-island-80x110.png", import.meta.url)).toString("base64");
const html = `<!doctype html><html><head><style>
html,body{margin:0;background:transparent}
.stage{width:700px;height:1120px;position:relative}
.bag{position:absolute;left:60px;top:40px;width:580px;height:1020px;border-radius:14px 14px 44px 44px;
  background:linear-gradient(90deg,#0d0d0d 0%,#1d1d1d 18%,#141414 40%,#262626 52%,#151515 66%,#1b1b1b 84%,#0a0a0a 100%);
  box-shadow:0 30px 60px rgba(0,0,0,.45)}
.seal{position:absolute;left:0;right:0;top:0;height:58px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#121212,#222 50%,#121212);border-bottom:2px solid #2c2c2c}
.hole{position:absolute;left:50%;top:92px;width:40px;height:40px;margin-left:-20px;border-radius:50%;background:#0b0b0b;border:3px solid #2a2a2a}
.label{position:absolute;left:50%;top:190px;width:360px;margin-left:-180px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
</style></head><body><div class="stage"><div class="bag"><div class="seal"></div><div class="hole"></div><img class="label" src="${sticker}"></div></div></body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 700, height: 1120 }, deviceScaleFactor: 1.5 });
await p.setContent(html); await p.screenshot({ path: new URL("../sticker/bag-mockup-transparent.png", import.meta.url).pathname, omitBackground: true }); await b.close();

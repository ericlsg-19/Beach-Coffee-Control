// The installable app (PWA): Beach Coffee on the home screen, and in the Solana dApp Store (Seeker)
// as an Android app (a Trusted Web Activity) that opens https://drinkbeachcoffee.com/app.

export function manifest() {
  return {
    id: "/app",
    name: "Beach Coffee Co.",
    short_name: "Beach Coffee",
    description: "Specialty coffee at Island DAO. See the menu, order from your seat on Telegram, and tip the barista or buy the edition coffee bag in USDC on Solana.",
    start_url: "/app?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#071110",
    theme_color: "#071110",
    categories: ["food", "lifestyle", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

// Network first: the app always shows live data (menu, queue, payments). Offline, the last copy of
// a page still opens, and anything else gets a short offline page.
export const SERVICE_WORKER = `
const CACHE = "beach-coffee-v1";
const OFFLINE = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#071110;color:#eef3ee;font:16px system-ui;display:grid;place-items:center;height:100vh;text-align:center;padding:24px"><div><p style="font-size:2.4rem;margin:0">☕</p><p>You are offline.<br>Connect to order or tip.</p></div>';
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin || new URL(req.url).pathname.startsWith("/api/")) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (req.mode === "navigate" || /\\/(icons|vendor)\\//.test(req.url))) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  }).catch(async () => (await caches.match(req)) ||
    (req.mode === "navigate" ? new Response(OFFLINE, { headers: { "content-type": "text/html; charset=utf-8" } }) : Response.error())));
});
`;

// Digital Asset Links: proves the Android app and the site belong together, so the app opens the
// site full screen (no browser bar). ANDROID_PACKAGE and ANDROID_CERT_SHA256 (the signing key's
// SHA-256 fingerprint; several separated by commas) are public values in wrangler.toml.
export function assetLinks(env) {
  const fingerprints = String(env.ANDROID_CERT_SHA256 || "").split(",").map(s => s.trim().toUpperCase()).filter(s => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s));
  if (!env.ANDROID_PACKAGE || !fingerprints.length) return [];
  return [{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: { namespace: "android_app", package_name: env.ANDROID_PACKAGE, sha256_cert_fingerprints: fingerprints },
  }];
}

// Privacy policy for the app stores (/privacy).
export const PRIVACY_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy · Beach Coffee Co.</title><meta name="theme-color" content="#071110">
<style>body{margin:0;background:#071110;color:#eef3ee;font:16px/1.6 system-ui,sans-serif}main{max-width:680px;margin:0 auto;padding:32px 20px 64px}h1{font-size:1.8rem;margin:0 0 4px}h2{font-size:1.05rem;margin:28px 0 6px;color:#a8e6b8}p,li{color:#c9d6cd}a{color:#e8b86a}small{color:#7f9a8c}</style></head>
<body><main><h1>Privacy</h1><small>Beach Coffee Co. · updated 5 Nov 2026</small>
<h2>What we collect</h2><ul>
<li><b>Orders (Telegram):</b> your Telegram name, username and user id, the drinks you order and when. We use them to make your drink, tell you when it is ready, keep the daily limits and show the coffee ranking.</li>
<li><b>Tips and the coffee bag (Solana):</b> the amount, the transaction signature and the paying wallet address, which are public on the Solana blockchain anyway, plus the name you type, if any.</li>
<li><b>Checkout diagnostics:</b> which payment button you tapped, which wallet opened the page and any error message, so we can fix payments that fail.</li></ul>
<h2>What we don't do</h2><p>No ads, no trackers, no selling or sharing your data. We never hold your funds or keys: payments go straight from your wallet to ours.</p>
<h2>Where it lives</h2><p>On Cloudflare (Workers and D1), used only to run the bar. Ask us and we delete your order history.</p>
<h2>Contact</h2><p>X <a href="https://x.com/BeachCoffeco">@BeachCoffeco</a> · Instagram <a href="https://instagram.com/beachcoffee.co">@beachcoffee.co</a> · Telegram <a href="https://t.me/BeachCoffeeIslandBot">@BeachCoffeeIslandBot</a></p>
</main></body></html>`;

import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from "@solana-mobile/wallet-standard-mobile";
import { getWallets } from "@wallet-standard/app";
let registered = false;
// Registers the Mobile Wallet Adapter (Android: Seeker's wallet, Phantom, Solflare…) and returns it, or null.
window.BeachMWA = {
  get() {
    if (!registered) {
      registered = true;
      try {
        registerMwa({
          appIdentity: { name: "Beach Coffee Co.", uri: location.origin, icon: "/icons/icon-192.png" },
          authorizationCache: createDefaultAuthorizationCache(),
          chains: ["solana:mainnet"],
          chainSelector: createDefaultChainSelector(),
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
        });
      } catch (e) { console.warn("mwa", e); }
    }
    return getWallets().get().find(w => w.name === "Mobile Wallet Adapter") || null;
  },
};

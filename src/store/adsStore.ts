import { gatherConsentAndInitialize } from "@/services/adsService";
import { create } from "zustand";

interface AdsState {
  canRequestAds: boolean;
  bannerLoaded: boolean;
  bannerDismissed: boolean;
  initializeAds: () => Promise<void>;
  setBannerLoaded: (bannerLoaded: boolean) => void;
  dismissBanner: () => void;
}

// True only while the banner actually occupies space at the bottom of the screen.
export const selectBannerVisible = (state: AdsState) =>
  state.canRequestAds && state.bannerLoaded && !state.bannerDismissed;

// Consent status is never persisted — UMP owns it and it is re-evaluated on every launch.
export const useAdsStore = create<AdsState>((set) => ({
  canRequestAds: false,
  bannerLoaded: false,
  bannerDismissed: false,

  // Runs once at launch (useAdsSync). Gates whether any ad component may render.
  initializeAds: async () => {
    try {
      set({ canRequestAds: await gatherConsentAndInitialize() });
    } catch (err) {
      console.error("❌ Failed to initialize ads:", err);
    }
  },

  // Lives in the store, not in AdBanner, so (main)/_layout can drop the bottom
  // inset from the screens while the banner is docked over the gesture-nav strip.
  setBannerLoaded: (bannerLoaded) => set({ bannerLoaded }),

  // Per-session only — the store is never persisted, so this resets on relaunch.
  dismissBanner: () => set({ bannerDismissed: true }),
}));

import { useAdsStore } from "@/store/adsStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useEffect, useRef } from "react";

// ------------------------------------------------------------
// Gather UMP consent and initialize the Mobile Ads SDK once per launch.
// Consent is re-evaluated every launch, never persisted.
// Waits for onboarding, so the consent form never covers it.
// ------------------------------------------------------------
export function useAdsSync() {
  const onboardingComplete = useOnboardingStore((state) => state.onboardingComplete);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !onboardingComplete) {
      return;
    }
    initializedRef.current = true;
    useAdsStore.getState().initializeAds();
  }, [onboardingComplete]);
}

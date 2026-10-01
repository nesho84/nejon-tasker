import { useStoreReviewStore } from "@/store/storeReviewStore";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

// ------------------------------------------------------------
// Counts distinct app-open days for the store-review gate. Runs on mount and on every
// foreground — the store ignores repeat calls within the same day.
// ------------------------------------------------------------
export function useStoreReviewSync() {
  // Store persists via async kvStorage — wait for hydration so lastOpenDate is the persisted value
  const isReady = useStoreReviewStore((state) => state.isReady);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!isReady) return;

    // Initial count once hydrated
    useStoreReviewStore.getState().recordAppOpen();

    // Count again when the app comes to foreground (covers a session kept alive past midnight)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        useStoreReviewStore.getState().recordAppOpen();
      }

      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isReady]);
}

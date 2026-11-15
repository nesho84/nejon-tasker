import { openUpdateAvailableModal } from "@/components/CheckForUpdate";
import { useDebugStore } from "@/debug/debugStore";
import * as ExpoInAppUpdates from "expo-in-app-updates";
import * as Updates from "expo-updates";
import { useEffect } from "react";

// ------------------------------------------------------------
// Check for both OTA (expo-updates) and store (Google Play) updates once on
// app mount. The OTA check silently reloads with the new bundle; the store
// check shows the "Update available" modal if one exists.
// ------------------------------------------------------------
export function useUpdatesSync() {
    // Debug store persists via async kvStorage — gate the dev check on its hydration
    const isReady = useDebugStore((state) => state.isReady);

    // Debug test for the auto-launch flow (only while debug mode is on) — see DebugPanel's
    // "Toggle 'Update available' On Launch". Runs once the debug store has rehydrated, so both flags are persisted values.
    useEffect(() => {
        if (!isReady) return;
        const { debugModeEnabled, forceUpdateOnLaunch } = useDebugStore.getState();
        if (debugModeEnabled && forceUpdateOnLaunch) {
            openUpdateAvailableModal();
        }
    }, [isReady]);

    // Real update checks (production only), once on mount
    useEffect(() => {
        if (__DEV__) return;

        const checkOtaUpdate = async () => {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    await Updates.fetchUpdateAsync();
                    Updates.reloadAsync();
                }
            } catch {
                // Network unavailable or EAS unreachable — silently ignore
            }
        };

        const checkStoreUpdate = async () => {
            try {
                const { updateAvailable } = await ExpoInAppUpdates.checkForUpdate();
                if (updateAvailable) {
                    openUpdateAvailableModal();
                }
            } catch {
                // Not installed via Play (e.g. sideloaded dev build) — silently ignore
            }
        };

        // Call both checks once on app mount
        checkOtaUpdate();
        checkStoreUpdate();
    }, []);
}

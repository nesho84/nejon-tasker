import { kvStorage } from '@/store/storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ------------------------------------------------------------
// Debug-only store backing the Debug Panel. debugModeEnabled, debugPanelExpanded and
// forceStoreUpdateOnLaunch are persisted (need to survive a reload); the rest
// reset on restart. debugModeEnabled is toggled by tapping the version
// number on the About screen — it shows the Debug Tools box there
// (in every build, dev included).
// ------------------------------------------------------------

export type StoreUpdatePreview = "idle" | "upToDate" | "error";

interface DebugState {
    debugModeEnabled: boolean;
    debugPanelExpanded: boolean;
    forceStoreUpdateOnLaunch: boolean;
    storeUpdatePreview: StoreUpdatePreview;
    isReady: boolean;
    toggleDebugMode: () => void;
    toggleDebugPanel: () => void;
    toggleStoreUpdateOnLaunch: () => void;
    setStoreUpdatePreview: (value: StoreUpdatePreview) => void;
}

export const useDebugStore = create<DebugState>()(
    persist(
        (set) => ({
            debugModeEnabled: false,
            debugPanelExpanded: false,
            forceStoreUpdateOnLaunch: false,
            storeUpdatePreview: "idle",
            isReady: false,

            toggleDebugMode: () => set((state) => ({ debugModeEnabled: !state.debugModeEnabled })),
            toggleDebugPanel: () => set((state) => ({ debugPanelExpanded: !state.debugPanelExpanded })),
            toggleStoreUpdateOnLaunch: () => set((state) => ({ forceStoreUpdateOnLaunch: !state.forceStoreUpdateOnLaunch })),
            setStoreUpdatePreview: (value) => set({ storeUpdatePreview: value }),
        }),
        {
            name: "debug-storage",
            storage: createJSONStorage(() => kvStorage),
            partialize: (state) => ({
                debugModeEnabled: state.debugModeEnabled,
                debugPanelExpanded: state.debugPanelExpanded,
                forceStoreUpdateOnLaunch: state.forceStoreUpdateOnLaunch,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isReady = true;
                }
            },
        }
    )
);

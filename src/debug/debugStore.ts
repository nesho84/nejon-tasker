import { kvStorage } from '@/store/storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ------------------------------------------------------------
// Debug-only store backing the Debug Panel. debugModeEnabled and
// forceStoreUpdateOnLaunch are persisted (need to survive a reload); the rest
// reset on restart. debugModeEnabled is toggled by tapping the version
// number on the About screen — it shows the debug edge tab on every screen
// (in every build, dev included).
// ------------------------------------------------------------

export type StoreUpdatePreview = "idle" | "upToDate" | "error";

interface DebugState {
    debugModeEnabled: boolean;
    forceStoreUpdateOnLaunch: boolean;
    storeUpdatePreview: StoreUpdatePreview;
    isReady: boolean;
    toggleDebugMode: () => void;
    toggleStoreUpdateOnLaunch: () => void;
    setStoreUpdatePreview: (value: StoreUpdatePreview) => void;
}

export const useDebugStore = create<DebugState>()(
    persist(
        (set) => ({
            debugModeEnabled: false,
            forceStoreUpdateOnLaunch: false,
            storeUpdatePreview: "idle",
            isReady: false,

            toggleDebugMode: () => set((state) => ({ debugModeEnabled: !state.debugModeEnabled })),
            toggleStoreUpdateOnLaunch: () => set((state) => ({ forceStoreUpdateOnLaunch: !state.forceStoreUpdateOnLaunch })),
            setStoreUpdatePreview: (value) => set({ storeUpdatePreview: value }),
        }),
        {
            name: "debug-storage",
            storage: createJSONStorage(() => kvStorage),
            partialize: (state) => ({
                debugModeEnabled: state.debugModeEnabled,
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

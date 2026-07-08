import { kvStorage } from '@/store/storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ------------------------------------------------------------
// Debug-only store backing the Debug Panel. debugModeEnabled and
// forceUpdateOnLaunch are persisted (need to survive a reload); the rest
// reset on restart. debugModeEnabled is toggled by tapping the version
// number on the About screen — it unlocks the Debug Tools card in
// production builds.
// ------------------------------------------------------------

export type UpdatePreview = "idle" | "upToDate" | "error";

interface DebugState {
    debugModeEnabled: boolean;
    forceUpdateOnLaunch: boolean;
    updatePreview: UpdatePreview;
    isReady: boolean;
    toggleDebugMode: () => void;
    toggleUpdateOnLaunch: () => void;
    setUpdatePreview: (value: UpdatePreview) => void;
}

export const useDebugStore = create<DebugState>()(
    persist(
        (set) => ({
            debugModeEnabled: false,
            forceUpdateOnLaunch: false,
            updatePreview: "idle",
            isReady: false,

            toggleDebugMode: () => set((state) => ({ debugModeEnabled: !state.debugModeEnabled })),
            toggleUpdateOnLaunch: () => set((state) => ({ forceUpdateOnLaunch: !state.forceUpdateOnLaunch })),
            setUpdatePreview: (value) => set({ updatePreview: value }),
        }),
        {
            name: "debug-storage",
            storage: createJSONStorage(() => kvStorage),
            partialize: (state) => ({
                debugModeEnabled: state.debugModeEnabled,
                forceUpdateOnLaunch: state.forceUpdateOnLaunch,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isReady = true;
                }
            },
        }
    )
);

import { kvStorage } from '@/store/storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ------------------------------------------------------------
// Debug-only store backing the Debug Panel. debugModeEnabled, debugPanelExpanded and
// forceUpdateOnLaunch are persisted (need to survive a reload); the rest
// reset on restart. debugModeEnabled is toggled by tapping the version
// number on the About screen — it shows the Debug Tools box there
// (in every build, dev included).
// ------------------------------------------------------------

export type UpdatePreview = "idle" | "upToDate" | "error";

interface DebugState {
    debugModeEnabled: boolean;
    debugPanelExpanded: boolean;
    forceUpdateOnLaunch: boolean;
    updatePreview: UpdatePreview;
    isReady: boolean;
    toggleDebugMode: () => void;
    toggleDebugPanel: () => void;
    toggleUpdateOnLaunch: () => void;
    setUpdatePreview: (value: UpdatePreview) => void;
}

export const useDebugStore = create<DebugState>()(
    persist(
        (set) => ({
            debugModeEnabled: false,
            debugPanelExpanded: false,
            forceUpdateOnLaunch: false,
            updatePreview: "idle",
            isReady: false,

            toggleDebugMode: () => set((state) => ({ debugModeEnabled: !state.debugModeEnabled })),
            toggleDebugPanel: () => set((state) => ({ debugPanelExpanded: !state.debugPanelExpanded })),
            toggleUpdateOnLaunch: () => set((state) => ({ forceUpdateOnLaunch: !state.forceUpdateOnLaunch })),
            setUpdatePreview: (value) => set({ updatePreview: value }),
        }),
        {
            name: "debug-storage",
            storage: createJSONStorage(() => kvStorage),
            partialize: (state) => ({
                debugModeEnabled: state.debugModeEnabled,
                debugPanelExpanded: state.debugPanelExpanded,
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

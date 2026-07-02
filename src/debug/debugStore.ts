import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ------------------------------------------------------------
// Debug-only store backing the Debug Panel. debugModeEnabled is persisted
// (needs to survive a reload) — toggled by tapping the version number on the
// About screen, it unlocks the Debug Tools card in production builds.
// ------------------------------------------------------------

interface DebugState {
    debugModeEnabled: boolean;
    toggleDebugMode: () => void;
}

export const useDebugStore = create<DebugState>()(
    persist(
        (set) => ({
            debugModeEnabled: false,

            toggleDebugMode: () => set((state) => ({ debugModeEnabled: !state.debugModeEnabled })),
        }),
        {
            name: "debug-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                debugModeEnabled: state.debugModeEnabled,
            }),
        }
    )
);

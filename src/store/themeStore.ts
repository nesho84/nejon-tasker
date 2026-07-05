import { DARK, LIGHT } from "@/constants/colors";
import { kvStorage } from "@/store/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeState {
    themeMode: ThemeMode;
    theme: typeof LIGHT | typeof DARK;
    isReady: boolean;
    setTheme: (themeMode: ThemeMode) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeMode: 'dark',
            theme: DARK,
            isReady: false,

            // Change theme manually
            setTheme: (mode) =>
                set({ themeMode: mode, theme: mode === "dark" ? DARK : LIGHT }),

            // Toggle theme
            toggleTheme: () =>
                set((state) => {
                    const newMode = state.themeMode === "light" ? "dark" : "light";
                    return { themeMode: newMode, theme: newMode === "dark" ? DARK : LIGHT };
                }),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => kvStorage),
            partialize: (state) => ({ themeMode: state.themeMode }), // persist only mode
            onRehydrateStorage: () => (state) => {
                // After rehydration, set theme based on persisted mode
                if (state) {
                    state.theme = state.themeMode === 'dark' ? DARK : LIGHT;
                    state.isReady = true;
                }
            },
        }
    )
);

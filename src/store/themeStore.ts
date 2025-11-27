import { DARK, LIGHT } from "@/constants/colors";
import { mmkvStorage } from "@/store/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeState {
    mode: ThemeMode;
    theme: typeof LIGHT | typeof DARK;
    setTheme: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            theme: LIGHT,

            // Change theme manually
            setTheme: (mode) =>
                set({ mode, theme: mode === "dark" ? DARK : LIGHT }),

            // Toggle theme
            toggleTheme: () =>
                set((state) => {
                    const newMode = state.mode === "light" ? "dark" : "light";
                    return { mode: newMode, theme: newMode === "dark" ? DARK : LIGHT };
                }),
        }),
        {
            name: 'theme-store',
            storage: createJSONStorage(() => mmkvStorage),
            partialize: (state) => ({ mode: state.mode }), // persist only mode
            onRehydrateStorage: () => (state) => {
                // After rehydration, set theme based on persisted mode
                if (state) {
                    state.theme = state.mode === 'dark' ? DARK : LIGHT;
                }
            },
        }
    )
);

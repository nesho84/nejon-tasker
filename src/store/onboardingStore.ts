import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingState {
    onboardingComplete: boolean
    isReady: boolean
    setOnboarding: (onboardingComplete: boolean) => void
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            onboardingComplete: false,
            isReady: false,

            setOnboarding: (onboardingComplete) =>
                set({ onboardingComplete: onboardingComplete }),
        }),
        {
            name: "onboarding-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ onboardingComplete: state.onboardingComplete }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isReady = true;
                }
            },
        }
    )
);

import { mmkvStorage } from "@/store/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingState {
    onboardingComplete: boolean
    setOnboarding: (onboardingComplete: boolean) => void
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            onboardingComplete: false,

            setOnboarding: (onboardingComplete) =>
                set({ onboardingComplete: onboardingComplete }),
        }),
        {
            name: "onboarding-store",
            storage: createJSONStorage(() => mmkvStorage),
            partialize: (state) => ({ onboardingComplete: state.onboardingComplete }),
        }
    )
);

import { setupDatabase } from "@/db/database";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RootStack = () => {
  const { onboardingComplete } = useOnboardingStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Onboarding group */}
      <Stack.Protected guard={!onboardingComplete}>
        <Stack.Screen name="(onboarding)" options={{ animation: "fade" }} />
      </Stack.Protected>

      {/* Main app, only after onboarding */}
      <Stack.Protected guard={onboardingComplete}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize SQLite database
    setupDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootStack />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

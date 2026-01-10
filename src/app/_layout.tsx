import AppLoading from "@/components/AppLoading";
import { setupDatabase } from "@/db/database";
import useNotifications from "@/hooks/useNotifications";
import { useLabelStore } from "@/store/labelStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTaskStore } from "@/store/taskStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
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
  const [isDbReady, setIsDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function initDB() {
      try {
        // Initialize database
        await setupDatabase();
        // Initialize all stores AFTER database is ready
        await useLabelStore.getState().loadLabels();
        await useTaskStore.getState().loadTasks();
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setInitError(error instanceof Error ? error.message : "Database initialization failed");
      } finally {
        setIsDbReady(true);
      }
    }
    initDB();
  }, []);

  // Initialize notifications
  useNotifications();

  // Show error if initialization failed
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Failed to initialize app</Text>
        <Text>{initError}</Text>
      </View>
    );
  }

  // Don't render anything until database is ready
  if (!isDbReady) return <AppLoading />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <RootStack />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

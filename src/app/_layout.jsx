import { Stack } from "expo-router";
import { Drawer } from 'react-native-drawer-layout';
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import ThemeContextProvider from "@/context/ThemeContext";
import LanguageContextProvider from "@/context/LanguageContext";
import TasksContextProvider from "@/context/TasksContext";

const RootStack = () => {
  const seen = true;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Onboarding group */}
        <Stack.Protected guard={!seen}>
          <Stack.Screen name="(onboarding)" options={{ animation: "fade" }} />
        </Stack.Protected>

        {/* Main app, only after onboarding */}
        <Stack.Protected guard={seen}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeContextProvider>
        <LanguageContextProvider>
          <TasksContextProvider>
            <RootStack />
          </TasksContextProvider>
        </LanguageContextProvider>
      </ThemeContextProvider>
    </SafeAreaProvider>
  );
}

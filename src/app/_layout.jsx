import { Stack } from "expo-router";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import ThemeContextProvider from "@/context/ThemeContext";
import LanguageContextProvider from "@/context/LanguageContext";
import TasksContextProvider from "@/context/TasksContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RootStack = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      </Stack>
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

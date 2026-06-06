import { useThemeStore } from "@/store/themeStore";
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
};

export default function AppScreen({ children }: ScreenProps) {
  // Stores
  const theme = useThemeStore((state) => state.theme);
  const themeMode = useThemeStore((state) => state.themeMode);

  // Determine status bar and navigation bar styles based on the resolved theme
  const statusBarStyle = themeMode === "dark" ? "light" : "dark";
  const navigationBarStyle = themeMode === "dark" ? "light" : "dark";

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.bg }}
        edges={['left', 'right']}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
      <NavigationBar style={navigationBarStyle} />
    </>
  );
}

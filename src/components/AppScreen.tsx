import { useThemeStore } from '@/store/themeStore';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
}

export default function AppScreen({ children }: Props) {
  // Stores
  const theme = useThemeStore((state) => state.theme);
  const themeMode = useThemeStore((state) => state.themeMode);

  // Determine status bar and navigation bar styles based on the resolved theme
  const statusBarStyle = themeMode === "dark" ? "light" : "dark";
  const navigationBarStyle = themeMode === "dark" ? "light" : "dark";

  // Set the navigationBarStyle style imperatively;
  // because the <NavigationBar> component's setHidden path throws:
  // "[Error: Uncaught (in promise, id: 0) Error: Call to function 'ExpoNavigationBar.setHidden' has been rejected." during activity teardown.
  useEffect(() => {
    NavigationBar.setStyle(navigationBarStyle);
  }, [navigationBarStyle]);

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
    </>
  );
}

const styles = StyleSheet.create({})

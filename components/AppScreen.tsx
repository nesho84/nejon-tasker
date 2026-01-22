import { useKeyboard } from "@/hooks/useKeyboard";
import { useThemeStore } from "@/store/themeStore";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
};

export default function AppScreen({ children }: ScreenProps) {
  const { mode, theme } = useThemeStore();

  const { isKeyboardVisible } = useKeyboard();

  const barStyle = mode === "dark" ? "light" : "dark";

  return (
    <>
      <StatusBar style={barStyle} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={isKeyboardVisible ? ['left', 'right'] : ['left', 'right', 'bottom']}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: theme.surface }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </>
  );
}

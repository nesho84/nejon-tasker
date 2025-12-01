import { useThemeStore } from "@/store/themeStore";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
};

export default function AppScreen({ children }: ScreenProps) {
  const { mode, theme } = useThemeStore();

  const barStyle = mode === "dark" ? "light" : "dark";

  return (
    <>
      <StatusBar style={barStyle} />
      <SafeAreaView
        style={[
          styles.container, {
            backgroundColor: theme.background,
          }]}
        edges={['left', 'right', 'bottom']}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: theme.background, }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

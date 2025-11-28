import { useThemeStore } from "@/store/themeStore";
import { useHeaderHeight } from "@react-navigation/elements";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import {
  Keyboard,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
};

export default function Screen({ children }: ScreenProps) {
  const { mode, theme } = useThemeStore();

  const barStyle = mode === "dark" ? "light" : "dark";

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight(); // 0 if headerShown: false

  // Fix for Android 14+ safe area regression
  // Top inset: only for screens without a header
  let topInset = 0;
  if (headerHeight === 0) {
    if (Platform.OS === "android") {
      topInset = RNStatusBar.currentHeight || 24;
    } else {
      topInset = insets.top;
    }
  }

  // Bottom inset for Android soft nav bar / gestures
  const bottomInset = Platform.OS === "android"
    ? insets.bottom // will be 0 on some gesture nav devices, but best effort
    : insets.bottom;

  return (
    <>
      <StatusBar style={barStyle} />
      <View
        style={[
          styles.container, {
            backgroundColor: theme.background,
            paddingTop: topInset,
            paddingBottom: bottomInset
          }]}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: theme.background, }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

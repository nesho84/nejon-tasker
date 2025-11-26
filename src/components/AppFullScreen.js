import { useContext } from "react";
import {
  StyleSheet,
  View,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { ThemeContext } from "@/context/ThemeContext";

function Screen({ children }) {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight(); // 0 if headerShown: false
  const barStyle = theme.current === "dark" ? "light" : "dark";

  // Fix for Android 14+ safe area regression
  // Top inset: only for screens without a header
  let topInset = 0;
  if (headerHeight === 0) {
    if (Platform.OS === "android") {
      topInset = StatusBar.currentHeight || 24;
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
            backgroundColor: theme.themes.appScreen.screen[theme.current],
            paddingTop: topInset,
            paddingBottom: bottomInset
          }]}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: theme.themes.appScreen.screen[theme.current], }}>
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

export default Screen;

import { useContext } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";

function Screen({ children }) {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const barStyle = theme === "dark" ? "light" : "dark";

  // Fix for Android 14+ safe area regression
  const topInset = Platform.OS === "android" && (!insets.top || insets.top < 24)
    ? StatusBar.currentHeight || 24
    : insets.top;

  return (
    <>
      <StatusBar style={barStyle} />
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.themes.appScreen.screen[theme.current], paddingTop: topInset, }]}
        edges={['left', 'right']}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.themes.appScreen.screen[theme.current],
            }}
          >
            {children}
          </View>
        </TouchableWithoutFeedback>
        <StatusBar
          backgroundColor={theme.themes.appScreen.statusBar[theme.current]}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Screen;

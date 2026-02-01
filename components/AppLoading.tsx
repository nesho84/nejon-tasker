import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AppLoading() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]} pointerEvents="auto">
      <ActivityIndicator style={{ paddingBottom: 15 }} size={58} color={theme.muted} />
      <Text style={{ fontSize: 20, color: theme.text, opacity: 0.7 }}>
        {tr.messages.loading}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50,
  },
});

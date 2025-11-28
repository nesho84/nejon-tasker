import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AppLoading() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <ActivityIndicator style={{ paddingBottom: 15 }} size={65} color={theme.muted} />
      <Text style={{ fontSize: 23, color: theme.text }}>
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
  },
});

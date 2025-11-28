import { StyleSheet, View, Text } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";

export default function AppNoItems() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.muted }]}>
        {tr.empty.noTasks}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    margin: 30,
    padding: 30,
  },
  text: {
    fontSize: 17,
    textAlign: "center",
  },
});

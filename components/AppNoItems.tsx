import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  type?: "task" | "label";
}

export default function AppNoItems({ type = "task" }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.muted }]}>
        {type === "task" ? tr.empty.noTasks : tr.empty.noLabels}
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

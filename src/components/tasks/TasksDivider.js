import { StyleSheet, View, Text } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";

export default function TasksDivider({ checkedTasks, lang }) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  return (
    <View style={styles.checkedTasksDividerContainer}>
      <View style={[styles.listDivider, { borderColor: theme.border }]} />
      <Text
        style={[styles.listDividerText, { color: theme.text }]}>
        {`${checkedTasks} ${tr.labels.checkedItems}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  checkedTasksDividerContainer: {
    width: "100%",
    marginVertical: 2,
    paddingHorizontal: 7,
  },
  listDivider: {
    width: "100%",
    borderWidth: 1,
    marginBottom: 1,
  },
  listDividerText: {
    fontSize: 13,
  },
});

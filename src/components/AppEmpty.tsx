import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialDesignIcons, MaterialDesignIconsIconName } from "@react-native-vector-icons/material-design-icons/static";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  type?: "label" | "task" | "reminder" | "favorite" | "trash";
}

export default function AppEmpty({ type = "task" }: Props) {
  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);

  // Empty-state text per type
  const emptyText: Record<NonNullable<Props["type"]>, string> = {
    label: tr.empty.noLabels,
    task: tr.empty.noTasks,
    reminder: tr.empty.noReminders,
    favorite: tr.empty.noFavorites,
    trash: tr.empty.noTrash,
  };

  // Empty-state icon per type
  const emptyIcon: Record<NonNullable<Props["type"]>, MaterialDesignIconsIconName> = {
    label: "label-outline",
    task: "check-circle-outline",
    reminder: "bell-outline",
    favorite: "star-outline",
    trash: "trash-can-outline",
  };

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <MaterialDesignIcons
        name={emptyIcon[type]}
        size={75}
        style={[styles.itemIcon, { color: theme.muted }]}
      />
      <Text style={[styles.itemText, { color: theme.muted }]}>
        {emptyText[type]}
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
    padding: 15,
    gap: 40,
  },
  itemIcon: {
    textAlign: "center",
  },
  itemText: {
    fontSize: 17,
    textAlign: "center",
  },
});

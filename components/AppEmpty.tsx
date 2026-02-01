import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  type?: "label" | "task" | "reminder" | "favorite" | "trash";
}

export default function AppEmpty({ type = "task" }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  // ------------------------------------------------------------
  // Render empty text based on type
  // ------------------------------------------------------------
  const RenderItemText = () => {
    switch (type) {
      case "label":
        return tr.empty.noLabels;
      case "task":
        return tr.empty.noTasks;
      case "reminder":
        return tr.empty.noReminders;
      case "favorite":
        return tr.empty.noFavorites;
      case "trash":
        return tr.empty.noTrash;
    }
  }

  // ------------------------------------------------------------
  // Render Icon based on type
  // ------------------------------------------------------------
  const RenderItemIcon = () => {
    switch (type) {
      case "label":
        return <MaterialCommunityIcons name="label-outline" size={75} style={[styles.itemIcon, { color: theme.muted }]} />;
      case "task":
        return <MaterialCommunityIcons name="check-circle-outline" size={75} style={[styles.itemIcon, { color: theme.muted }]} />;
      case "reminder":
        return <MaterialCommunityIcons name="bell-outline" size={75} style={[styles.itemIcon, { color: theme.muted }]} />;
      case "favorite":
        return <MaterialCommunityIcons name="star-outline" size={75} style={[styles.itemIcon, { color: theme.muted }]} />;
      case "trash":
        return <MaterialCommunityIcons name="trash-can-outline" size={75} style={[styles.itemIcon, { color: theme.muted }]} />;
    }
  }

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <RenderItemIcon />
      <Text style={[styles.itemText, { color: theme.muted }]}>
        <RenderItemText />
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

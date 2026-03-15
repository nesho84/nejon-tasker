import AppEmpty from "@/components/AppEmpty";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { isReminderActive } from "@/utils/dates";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import AppLoading from "./AppLoading";

export default function LabelList() {
  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);
  const labels = useLabelStore((state) => state.labels);
  const labelsLoading = useLabelStore((state) => state.isLoading);
  const allTasks = useTaskStore((state) => state.allTasks);
  const tasksLoading = useTaskStore((state) => state.isLoading);

  // ------------------------------------------------------------
  // Reordor labels
  // ------------------------------------------------------------
  const handleOrderLabels = async (orderedLabels: Label[]) => {
    const labelIds = orderedLabels.map(label => label.id)
    await useLabelStore.getState().reorderLabels(labelIds);
  }

  // ------------------------------------------------------------
  // Handle selecting a Label from the list
  // ------------------------------------------------------------
  const handleEdit = (label: Label) => {
    router.navigate(`/editLabel?labelId=${label.id}`);
  };

  // Loading state
  if (labelsLoading || tasksLoading) {
    return <AppLoading inline={true} />;
  }

  // Render single Label card template
  const RenderLabel = ({ item, getIndex, isActive, drag }: RenderItemParams<Label>) => {
    // Filter tasks by labelId
    const tasks = useMemo(() => allTasks.filter(t => t.labelId === item.id && !t.isDeleted), [allTasks, item.id]);
    // Get tasks counts
    const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);
    const uncheckedTasks = useMemo(() => tasks.filter(t => !t.checked), [tasks]);
    const reminderTasks = useMemo(() => {
      const filtered = tasks.filter(t => t.reminderDateTime && t.reminderId);
      return filtered.filter(t => isReminderActive(t.reminderDateTime, t.reminderId));
    }, [tasks]);

    return (
      <TouchableOpacity
        onPress={() => router.navigate(`/tasks?labelId=${item.id}`)}
        onLongPress={drag}
        disabled={isActive}
        delayLongPress={400}
        delayPressIn={0}
        delayPressOut={0}
        activeOpacity={0.7}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: theme.card,
              borderWidth: 0.3,
              borderLeftWidth: 4,
              borderColor: theme.border,
              borderLeftColor: item.color,
              borderRadius: 8,
              elevation: 2,
              opacity: isActive ? 0.5 : 1,
              marginTop: getIndex && getIndex() === 0 ? 6 : 0,
            },
          ]}
        >

          {/* ----- Title row ----- */}
          <View style={styles.cardHeaderContainer}>
            {/* Icon before label title */}
            <MaterialCommunityIcons
              style={{ marginTop: 2, marginRight: 8 }}
              name="label-outline"
              size={26}
              color={item.color}
            />
            {/* Label title */}
            <Text style={[styles.cardTitle, { color: item.color }]}>
              {item.title.length > 25 ? item.title.slice(0, 20) + "..." : item.title}
            </Text>
            {/* Edit Label Icon */}
            <TouchableOpacity delayPressIn={0} delayPressOut={0} onPress={() => handleEdit(item)}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={32}
                color={theme.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Tasks Summary/Stats */}
          <View style={styles.summaryContainer}>
            {/* Remaining */}
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.summaryCount, { color: theme.muted }]}>{uncheckedTasks.length}</Text>
              <Text style={[styles.summarySubtitle, { color: theme.muted }]}>{tr.labels.remaining}</Text>
            </View>
            {/* Reminders */}
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.summaryCount, { color: theme.muted }]}>{reminderTasks.length}</Text>
              <Text style={[styles.summarySubtitle, { color: theme.muted }]}>{tr.labels.reminders}</Text>
            </View>
            {/* Completed */}
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.summaryCount, { color: theme.muted }]}>{checkedTasks.length}</Text>
              <Text style={[styles.summarySubtitle, { color: theme.muted }]}>{tr.labels.completed}</Text>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    labels && labels.length > 0 ? (
      <DraggableFlatList
        data={labels}
        renderItem={RenderLabel}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => handleOrderLabels(data)}
        activationDistance={24}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    ) : (
      <AppEmpty type={"label"} />
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 2,
    paddingBottom: 14,
    paddingHorizontal: 6,
    gap: 8,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 14,
  },
  cardHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  cardTitle: {
    flexShrink: 1,
    paddingVertical: 5,
    fontSize: 20,
    fontWeight: "bold",
    marginRight: "auto",
  },
  summaryContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: "700",
  },
  summarySubtitle: {
    fontSize: 11,
    fontWeight: "500",
  },
});

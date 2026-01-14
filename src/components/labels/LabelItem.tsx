import AppNoItems from "@/components/AppNoItems";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import AppLoading from "../AppLoading";

interface Props {
  handleEdit: (item: Label) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function LabelItem({ handleEdit, refreshing, onRefresh }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  // labelStore
  const labels = useLabelStore((state) => state.labels);
  const reorderLabels = useLabelStore((state) => state.reorderLabels);

  // taskStore
  const allTasks = useTaskStore((state) => state.allTasks);

  // Local State
  const [isReady, setIsReady] = useState(false);

  // ------------------------------------------------------------
  // Reordor labels
  // ------------------------------------------------------------
  const handleOrderLabels = async (orderedLabels: Label[]) => {
    const labelIds = orderedLabels.map(label => label.id)
    await reorderLabels(labelIds);
  }

  // ------------------------------------------------------------
  // Wait for instant navigation
  // ------------------------------------------------------------
  useEffect(() => {
    requestAnimationFrame(() => setIsReady(true));
  }, []);

  // Loading state
  if (!isReady) {
    return <AppLoading />;
  }

  // Render Single Label template
  const RenderLabel = ({ item, getIndex, isActive, drag }: RenderItemParams<Label>) => {
    // Filter tasks by labelId
    const tasks = useMemo(() => allTasks.filter(t => t.labelId === item.id && !t.isDeleted), [allTasks, item.id]);
    const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);
    const uncheckedTasks = useMemo(() => tasks.filter(t => !t.checked), [tasks]);
    const reminderTasks = useMemo(() => tasks.filter(t => t.reminderDateTime && t.reminderId), [tasks]);

    const handlePress = () => {
      router.push(`/tasks?labelId=${item.id}`);
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={drag}
        disabled={isActive}
        delayLongPress={400}
        delayPressIn={0}
        delayPressOut={0}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: item.color,
              borderColor: theme.lightMuted,
              opacity: isActive ? 0.5 : 1,
              borderWidth: isActive ? 3 : 0,
              marginTop: getIndex && getIndex() === 0 ? 6 : 0,
            },
          ]}
        >
          {/* -----Item title and icons Container----- */}
          <View style={styles.labelBoxHeaderContainer}>
            {/* Icon before label title */}
            <MaterialCommunityIcons
              style={{ marginTop: 2, marginRight: 6 }}
              name="label-outline"
              size={26}
              color={theme.white}
            />

            {/* Label title */}
            <Text style={[styles.labelBoxTitle, { color: theme.white }]}>
              {item.title.length > 25 ? item.title.slice(0, 20) + "..." : item.title}
            </Text>

            {/* Edit Label Icon */}
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              delayPressIn={0}
              delayPressOut={0}
            >
              <MaterialCommunityIcons
                style={{ marginTop: 2 }}
                name="playlist-edit"
                size={31}
                color={theme.white}
              />
            </TouchableOpacity>
          </View>

          {/* Tasks summary*/}
          <View style={styles.summaryContainer}>
            {/* Tasks Remaining count */}
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.count, { color: theme.white }]}>{uncheckedTasks.length}</Text>
              <Text style={[styles.subtitle, { color: theme.white }]}>
                {tr.labels.remaining}
              </Text>
            </View>

            {/* Tasks Reminders count */}
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.count, { color: theme.white }]}>{reminderTasks.length}</Text>
              <Text style={[styles.subtitle, { color: theme.white }]}>
                {tr.labels.reminders}
              </Text>
            </View>

            {/* Tasks Completed count */}
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.count, { color: theme.white }]}>{checkedTasks.length}</Text>
              <Text style={[styles.subtitle, { color: theme.white }]}>
                {tr.labels.completed}
              </Text>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <DraggableFlatList
      data={labels}
      renderItem={RenderLabel}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<AppNoItems type="label" />}
      onDragEnd={({ data }) => handleOrderLabels(data)}
      activationDistance={24}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 5 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    paddingBottom: 10,
    borderRadius: 4,
    borderWidth: 0.3,
    elevation: 2,
  },
  labelBoxHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingHorizontal: 10,
    paddingBottom: 2,
    marginBottom: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  summaryContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  labelBoxTitle: {
    flexShrink: 1,
    paddingVertical: 5,
    fontSize: 21,
    fontWeight: "bold",
    marginRight: "auto"
  },
  count: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
  },
});

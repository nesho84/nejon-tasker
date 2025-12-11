import AppNoItems from "@/components/AppNoItems";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { shareText } from "@/utils/utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import Hyperlink from 'react-native-hyperlink';

interface Props {
  label: Label;
  handleEditModal: (item: Task) => void;
}

export default function TasksList({ label, handleEditModal }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();
  const { cancelScheduledNotification } = useNotifications();

  // taskStore
  const allTasks = useTaskStore((state) => state.allTasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const toggleFavorite = useTaskStore((state) => state.toggleFavorite);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);

  // Filter tasks
  const tasks = useMemo(() => allTasks.filter(t => t.labelId === label.id && !t.isDeleted), [allTasks, label.id]);
  const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);
  const uncheckedTasks = useMemo(() => tasks.filter(t => !t.checked), [tasks]);

  // Get the last item for styling
  const lastUnchecked = useMemo(() => uncheckedTasks[uncheckedTasks.length - 1], [uncheckedTasks]);
  const lastChecked = useMemo(() => checkedTasks[checkedTasks.length - 1], [checkedTasks]);

  // Toggle task checked/unchecked
  const handleCheckTask = async (value: boolean, task: Task) => {
    // If checking a task with active reminder, cancel notification
    if (value === true && task?.reminderId) {
      await cancelScheduledNotification(task.reminderId);
      // Clear reminder data when checking
      await updateTask(task.id, {
        checked: true,
        reminderDateTime: null,
        reminderId: null,
      });
    } else {
      await toggleTask(task.id);
    }
  };

  // Soft Delete task
  const handleDeleteTask = async (task: Task) => {
    Alert.alert(
      tr.alerts.deleteTask.title,
      tr.alerts.deleteTask.message,
      [
        {
          text: tr.buttons.yes,
          onPress: async () => {
            // Cancel the existing notification
            if (task?.reminderId) {
              await cancelScheduledNotification(task.reminderId);
              // Clear reminder data when deleting
              await updateTask(task.id, {
                reminderDateTime: null,
                reminderId: null,
              });
            }
            await deleteTask(task.id);
          },
        },
        {
          text: tr.buttons.no,
        },
      ],
      { cancelable: false }
    );
  };

  // Toggle task favorite
  const handleFavoriteTask = async (task: Task) => {
    await toggleFavorite(task.id);
  };

  // Reorder tasks
  const handleOrderTasks = async (orderedTasks: Task[]) => {
    const taskIds = orderedTasks.map(task => task.id);
    await reorderTasks(taskIds);
  };

  // Render Single Task template
  const RenderTask = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <TouchableOpacity
        onPress={() => handleEditModal(item)}
        onLongPress={drag}
        delayLongPress={400}
        delayPressIn={0}
        delayPressOut={0}
        // hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        activeOpacity={0.6}
        style={[
          styles.container,
          {
            backgroundColor: item.checked ? theme.faded : theme.backgroundAlt,
            borderColor: item.checked ? theme.faded : theme.border,
          },
          isActive && { opacity: 0.5, borderWidth: 3 },
        ]}
      >
        {/* Top Section */}
        <View style={styles.top}>
          {/* -----Task checkbox----- */}
          <View style={styles.topLeft}>
            <Checkbox
              color={item.checked ? theme.border : theme.darkGrey}
              value={!!item.checked}
              onValueChange={(value) => handleCheckTask(value, item)}
            />
          </View>

          {/* -----Task text----- */}
          <View style={styles.taskText}>
            <Hyperlink linkDefault={true} linkStyle={{ color: theme.link }}>
              <Text
                style={{
                  color: !!item.checked ? theme.muted : theme.text,
                  textDecorationLine: !!item.checked ? "line-through" : "none",
                  fontSize: 15,
                }}
              >
                {item.text}
              </Text>
            </Hyperlink>
          </View>

          <View style={styles.topRight}>
            {/* -----Favorite icon----- */}
            <TouchableOpacity
              onPress={() => handleFavoriteTask(item)}
              delayPressIn={0}
              delayPressOut={0}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={item.isFavorite ? "star" : "star-outline"}
                color={theme.muted}
                size={24}
              />
            </TouchableOpacity>

            {/* -----Delete icon----- */}
            <TouchableOpacity
              onPress={() => handleDeleteTask(item)}
              delayPressIn={0}
              delayPressOut={0}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                color={theme.muted}
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={[styles.bottom, { backgroundColor: theme.shadow }]}>
          {/* -----Reminder icon and dateTime----- */}
          <View style={styles.reminderContainer}>
            {/* Reminder icon */}
            <Ionicons
              name={item.reminderId ? "notifications" : "notifications-off"}
              color={item.reminderId ? theme.success : theme.muted}
              size={16}
            />

            {/* Reminder dateTime */}
            {item.reminderId && item.reminderDateTime && (
              <Text
                style={{
                  fontSize: 11,
                  color: item.reminderId ? theme.success : theme.muted
                }}
              >
                {dates.format(item.reminderDateTime)}
              </Text>
            )}
          </View>

          {/* -----Share icon----- */}
          <TouchableOpacity
            onPress={() => shareText("My Task", item.text)}
            delayPressIn={0}
            delayPressOut={0}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={16} color={theme.muted} />
          </TouchableOpacity>

          {/* -----Task dateTime----- */}
          <Text style={[{ color: theme.muted, fontSize: 11 }]}>
            {dates.format(item.updatedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {uncheckedTasks.length > 0 ? (
        <View style={{ flex: 2 }}>
          <DraggableFlatList
            data={uncheckedTasks}
            renderItem={(params) => (
              <View style={{ marginBottom: lastUnchecked === params.item ? 3 : 0 }}>
                <RenderTask {...params} />
              </View>
            )}
            keyExtractor={(item) => `draggable-item-${item.id}`}
            onDragEnd={({ data }) => handleOrderTasks(data)}
          />
        </View>
      ) : (
        <AppNoItems />
      )}

      {checkedTasks.length > 0 && (
        <>
          <View style={[styles.divider, { borderColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.muted }]}>
            {`${checkedTasks.length} ${tr.labels.checkedItems}`}
          </Text>

          <View style={{ flex: 1, opacity: 0.4 }}>
            <DraggableFlatList
              data={checkedTasks}
              renderItem={(params) => (
                <View style={{ marginBottom: lastChecked === params.item ? 6 : 0 }}>
                  <RenderTask {...params} />
                </View>
              )}
              keyExtractor={(item) => `draggable-item-${item.id}`}
              onDragEnd={({ data }) => handleOrderTasks(data)}
            />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
  },
  topLeft: {
    alignSelf: "flex-start",
    marginTop: 3,
    marginLeft: 2,
    flexShrink: 0,
  },
  taskText: {
    width: "100%",
    marginLeft: 2,
    flexShrink: 1,
  },
  topRight: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 12,
  },

  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  divider: {
    width: "100%",
    borderWidth: 1,
    marginVertical: 2,
  },
  dividerText: {
    alignSelf: "flex-start",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingBottom: 3,
  },
});
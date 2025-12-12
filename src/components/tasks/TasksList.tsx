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
import TaskCard from "./TaskCard";

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
  const RenderTask = ({ item, getIndex, isActive, drag }: RenderItemParams<Task>) => {
    return (
      <TouchableOpacity
        onPress={() => handleEditModal(item)}
        onLongPress={drag}
        disabled={isActive}
        delayLongPress={400}
        delayPressIn={0}
        delayPressOut={0}
        activeOpacity={0.7}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <TaskCard
          task={item}
          isActive={isActive}
          getIndex={getIndex}
          topLeftContent={
            <>
              {/* -----Task checkbox----- */}
              <Checkbox
                color={item.checked ? theme.border : theme.darkGrey}
                value={!!item.checked}
                onValueChange={(value) => handleCheckTask(value, item)}
              />
            </>
          }
          topRightContent={
            <>
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
            </>
          }
          bottomContent={
            <>
              {/* -----Reminder icon and dateTime----- */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
            </>
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {uncheckedTasks.length > 0 ? (
        <DraggableFlatList
          containerStyle={{ flex: 3, opacity: 1 }}
          data={uncheckedTasks}
          renderItem={RenderTask}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => handleOrderTasks(data)}
        />
      ) : (
        <AppNoItems type="task" />
      )}

      {checkedTasks.length > 0 && (
        <>
          <View style={[styles.divider, { borderColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.muted }]}>
            {`${checkedTasks.length} ${tr.labels.checkedItems}`}
          </Text>

          <DraggableFlatList
            containerStyle={{ flex: 1, opacity: 0.4 }}
            data={checkedTasks}
            renderItem={RenderTask}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => handleOrderTasks(data)}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: "100%",
    borderWidth: 1,
  },
  dividerText: {
    alignSelf: "flex-start",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
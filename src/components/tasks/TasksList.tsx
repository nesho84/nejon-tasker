import AppNoItems from "@/components/AppNoItems";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { Alert, Share, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import Hyperlink from 'react-native-hyperlink';

interface Props {
  labelId: string;
  handleEditModal: (item: Task) => void;
}

export default function TasksList({ labelId, handleEditModal }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const {
    allTasks,
    reloadTasks,
    updateTask,
    deleteTask,
    toggleTask,
    toggleFavorite,
    reorderTasks,
  } = useTaskStore();

  // Filter tasks by labelId
  const tasks = allTasks.filter(t => t.labelId === labelId);
  const checkedTasks = tasks.filter(t => t.checked);
  const uncheckedTasks = tasks.filter(t => !t.checked);

  const { cancelScheduledNotification } = useNotifications();

  // Toggle task checked/unchecked
  const handleCheckbox = async (value: boolean, taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    // If checking a task with active reminder, cancel notification
    if (value === true && task?.reminderId) {
      await cancelScheduledNotification(task.reminderId);
      // Clear reminder data when checking
      updateTask(taskId, {
        checked: true,
        reminderDateTime: null,
        reminderId: null,
      });
    } else {
      toggleTask(taskId);
    }
    // Reload tasks to update counts in the Home screen
    reloadTasks();
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    // Cancel the existing notification
    if (task?.reminderId) {
      await cancelScheduledNotification(task.reminderId);
      // Clear reminder data when deleting
      updateTask(taskId, {
        reminderDateTime: null,
        reminderId: null,
      });
    }
    deleteTask(taskId);
    // Reload tasks to update counts in the Home screen
    reloadTasks();
  };

  // Toggle task favorite
  const handleFavoriteTask = (value: boolean, taskId: string) => {
    toggleFavorite(taskId);
  };

  // Order Tasks
  const handleOrderTasks = (orderedTasks: Task[]) => {
    const taskIds = orderedTasks.map(task => task.id);
    reorderTasks(taskIds);
  };

  // Share task
  const shareTask = (text: string) => {
    Share.share({
      message: text.toString(),
    })
      .then((result) => console.log("Share result:", result))
      .catch((err) => console.log(err))
  };

  // Get the last items for styling
  const lastUnchecked = uncheckedTasks[uncheckedTasks.length - 1];
  const lastChecked = checkedTasks[checkedTasks.length - 1];

  // Render Single Task template
  const RenderTask = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    const itemDateTime = item.reminderDateTime ?? null;

    const hasActiveReminder = (): boolean => {
      if (!itemDateTime) return false;
      const currentDateTime = new Date();
      const reminderDateTime = new Date(itemDateTime);
      const timeDifferenceInSeconds = Math.max(0, (reminderDateTime.getTime() - currentDateTime.getTime()) / 1000);
      return timeDifferenceInSeconds > 0;
    }

    return (
      <TouchableOpacity
        onPress={() => handleEditModal(item)}
        onLongPress={drag}
        style={[
          styles.tasksListContainer,
          {
            backgroundColor: item.checked ? theme.faded : theme.backgroundAlt,
            borderColor: item.checked ? theme.faded : theme.border,
          },
          isActive && { opacity: 0.5, borderWidth: 3 },
        ]}
      >
        {/* Top Section */}
        <View style={styles.tasksListTop}>
          {/* -----Task checkbox----- */}
          <View style={styles.taskCheckBox}>
            <Checkbox
              color={item.checked ? theme.border : theme.darkGrey}
              value={!!item.checked}
              onValueChange={(value) => handleCheckbox(value, item.id)}
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

          {/* -----Favorite icon----- */}
          <TouchableOpacity
            onPress={() => {
              handleFavoriteTask(!item.isFavorite, item.id);
            }}
          >
            <MaterialCommunityIcons
              name={item.isFavorite ? "star" : "star-outline"}
              size={22}
              color={theme.muted}
              style={{ marginRight: 12 }}
            />
          </TouchableOpacity>

          {/* -----Delete icon----- */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                tr.alerts.deleteTask.title,
                tr.alerts.deleteTask.message,
                [
                  { text: tr.buttons.yes, onPress: () => handleDeleteTask(item.id) },
                  { text: tr.buttons.no },
                ],
                { cancelable: false }
              )
            }
          >
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={theme.muted}
              style={{ marginRight: 3 }}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Section */}
        <View style={[styles.tasksListBottom, { backgroundColor: theme.shadow }]}>
          <Ionicons
            name={hasActiveReminder() ? "notifications" : "notifications-off"}
            color={hasActiveReminder() ? theme.success : theme.muted}
            size={16}
          />

          {/* Reminder dateTime */}
          {hasActiveReminder() && item.reminderDateTime && (
            <Text
              style={{
                marginLeft: -80,
                fontSize: 11,
                color: hasActiveReminder() ? theme.success : theme.muted
              }}
            >
              {dates.format(item.reminderDateTime)}
            </Text>
          )}

          {/* -----Share icon----- */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => shareTask(item.text)}>
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
        <TouchableWithoutFeedback>
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
        </TouchableWithoutFeedback>
      ) : (
        <AppNoItems />
      )}

      {checkedTasks.length > 0 && (
        <>
          <View style={styles.checkedTasksDividerContainer}>
            <View style={[styles.listDivider, { borderColor: theme.border }]} />
            <Text style={[styles.listDividerText, { color: theme.muted }]}>
              {`${checkedTasks.length} ${tr.labels.checkedItems}`}
            </Text>
          </View>

          <TouchableWithoutFeedback>
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
          </TouchableWithoutFeedback>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tasksListContainer: {
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
  },
  tasksListTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  tasksListBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  taskCheckBox: {
    // alignSelf: "baseline",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 3,
    flexShrink: 1,
  },
  taskText: {
    width: "100%",
    marginLeft: 12,
    marginRight: 8,
    flexShrink: 1,
  },
  checkedTasksDividerContainer: {
    width: "100%",
    marginVertical: 2,
  },
  listDivider: {
    width: "100%",
    borderWidth: 1,
    marginBottom: 2,
  },
  listDividerText: {
    fontSize: 13,
    paddingHorizontal: 8,
  },
});
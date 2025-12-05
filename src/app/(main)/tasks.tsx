import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddTask from "@/components/tasks/AddTask";
import EditTask from "@/components/tasks/EditTask";
import TasksList from "@/components/tasks/TasksList";
import useNotifications from "@/hooks/useNotifications";
import { useTasks } from "@/hooks/useTasks";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { Task } from "@/types/task.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LabelDetailsScreen() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { labelId } = useLocalSearchParams();

  const { labels, deleteLabel } = useLabelStore();
  const { loadTasks: reloadTasks } = useTaskStore();

  const { // continue here to convert it to zustand just like labelStore....
    tasks,
    checkedTasks,
    uncheckedTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleFavorite,
    reorderTasks,
  } = useTasks(labelId as string);

  const inputRef = useRef<TextInput>(null);

  const { scheduleNotification, cancelScheduledNotification } = useNotifications();

  // Get the current Label
  const currentLabel = labels.find((label: Label) => label.id === labelId);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Open modal for editing Task
  const handleEditModal = (item: Task) => {
    setTaskToEdit(item);
    setEditModalVisible(true);
  };

  // Add Task
  const handleAddTask = (text: string) => {
    if (currentLabel) {
      createTask({ labelId: currentLabel.id, text: text });
      inputRef.current?.clear();
      Keyboard.dismiss();
      // Reload tasks to update counts in the Home screen
      reloadTasks();
    }
  };

  // Edit Task
  const handleUpdateTask = async (task: Task) => {
    const reminderChanged = taskToEdit?.reminderDateTime !== task.reminderDateTime;
    // Check for existing reminders
    if (reminderChanged && task.reminderDateTime) {
      // Cancel for old/existing notification
      if (task.reminderId) {
        await cancelScheduledNotification(task.reminderId);
      }
      // Schedule a new notification
      const notificationId = await scheduleNotification(task);
      updateTask(task.id, {
        text: task.text,
        reminderDateTime: task.reminderDateTime,
        reminderId: notificationId,
      });
    } else {
      updateTask(task.id, {
        text: task.text,
        reminderDateTime: task.reminderDateTime,
      });
    }

    setEditModalVisible(false);
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

  // Toggle task favorite
  const handleFavoriteTask = async (value: boolean, taskId: string) => {
    toggleFavorite(taskId);
  };

  // Order Tasks
  const handleOrderTasks = (orderedTasks: Task[]) => {
    const taskIds = orderedTasks.map(task => task.id);
    reorderTasks(taskIds);
  };

  // Delete the entire label
  const handleDeleteLabel = (labelId: string) => {
    Alert.alert(
      `${tr.alerts.deleteLabel.title}`,
      `${tr.alerts.deleteLabel.message}`,
      [
        {
          text: `${tr.buttons.yes}`,
          onPress: () => {
            deleteLabel(labelId);
            router.back();
          },
        },
        {
          text: `${tr.buttons.no}`,
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <AppScreen>

      {/* Navigation bar icons */}
      <Stack.Screen
        options={{
          title: currentLabel?.title,
          headerTintColor: currentLabel?.color,
          headerRight: () => (
            <TouchableOpacity onPress={() => {
              if (currentLabel) {
                handleDeleteLabel(currentLabel.id);
              }
            }}>
              <MaterialCommunityIcons name="delete-alert-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      {currentLabel && (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

          {/* Header container */}
          <View style={[styles.headerContainer, { borderBottomColor: currentLabel.color }]}>
            {/* Header subtitle */}
            <Text style={{ fontSize: 14, color: theme.muted, paddingHorizontal: 8 }}>
              {`${checkedTasks.length} ${tr.labels.of} ${tasks.length} ${tr.labels.tasks}`}
            </Text>
          </View>

          {/* -----Tasks List----- */}
          <TasksList
            unCheckedTasks={uncheckedTasks}
            checkedTasks={checkedTasks}
            handleEditModal={handleEditModal}
            handleDeleteTask={handleDeleteTask}
            handleCheckbox={handleCheckbox}
            handleFavoriteTask={handleFavoriteTask}
            handleOrderTasks={handleOrderTasks}
          />

          {/* Add Task Input */}
          <AddTask
            placeholder={tr.forms.inputPlaceholder}
            handleAddTask={handleAddTask}
            currentLabelColor={currentLabel.color}
            inputRef={inputRef}
          />

          {/* -----Edit Task Modal----- */}
          <AppModal
            modalVisible={editModalVisible}
            setModalVisible={setEditModalVisible}
          >
            {taskToEdit && (
              <EditTask
                taskToEdit={taskToEdit}
                handleUpdateTask={handleUpdateTask}
              />
            )}
          </AppModal>
        </View>
      )}

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  headerContainer: {
    alignSelf: "stretch",
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 1,
    borderBottomWidth: 1,
  },
});
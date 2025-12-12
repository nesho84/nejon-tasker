import AppLoading from "@/components/AppLoading";
import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddTask from "@/components/tasks/AddTask";
import EditTask from "@/components/tasks/EditTask";
import TasksList from "@/components/tasks/TasksList";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TasksScreen() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();
  const { labelId } = useLocalSearchParams();

  // LabelStore
  const { labels, deleteLabel } = useLabelStore();
  const label = labels.find((l) => l.id === labelId);

  // TaskStore
  const { allTasks } = useTaskStore();
  const tasks = useMemo(() => allTasks.filter(t => t.labelId === labelId && !t.isDeleted), [allTasks, labelId]);
  const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);

  // Local State
  const [isLoading, setIsLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Open modal for editing Task
  const handleEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  // Delete the entire label
  const handleDeleteLabel = async (labelId: string) => {
    Alert.alert(
      tr.alerts.deleteLabel.title,
      tr.alerts.deleteLabel.message,
      [
        {
          text: tr.buttons.yes,
          onPress: async () => {
            setIsLoading(true);
            await deleteLabel(labelId);
            setIsLoading(false);
            router.back();
          },
        },
        {
          text: tr.buttons.no,
        },
      ],
      { cancelable: false }
    );
  };

  // Loading state
  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <AppScreen>

      {/* Navigation bar icons */}
      <Stack.Screen
        options={{
          title: label?.title,
          headerTintColor: label?.color,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                if (label) handleDeleteLabel(label.id);
              }}
            >
              <MaterialCommunityIcons name="delete-alert-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Main Content */}
      {label && (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header container */}
          <View style={[styles.headerContainer, { borderBottomColor: label.color }]}>
            {/* Header text */}
            <Text style={[styles.headerText, { color: theme.muted }]}>
              {`${checkedTasks.length} ${tr.labels.of} ${tasks.length} ${tr.labels.tasks}`}
            </Text>
          </View>

          {/* -----Tasks List----- */}
          <TasksList
            label={label}
            handleEditModal={handleEditModal}
          />

          {/* -----Edit Task Modal----- */}
          <AppModal modalVisible={editModalVisible} setModalVisible={setEditModalVisible}>
            {selectedTask && (
              <EditTask
                task={selectedTask}
                handleEditModal={setEditModalVisible}
              />
            )}
          </AppModal>

          {/* Add Task Input */}
          <AddTask label={label} />
        </View>
      )}

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignSelf: "stretch",
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 14,
    paddingHorizontal: 8,
  }
});
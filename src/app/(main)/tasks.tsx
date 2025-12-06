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
import { Label } from "@/types/label.types";
import { Task } from "@/types/task.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LabelDetailsScreen() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { labelId } = useLocalSearchParams();

  const { isLoading: labelsLoading, labels, deleteLabel } = useLabelStore();
  // Get the current Label
  const label = labels.find((label: Label) => label.id === labelId);

  const {
    isLoading: tasksLoading,
    allTasks,
  } = useTaskStore();

  // Filter by labelId
  const tasks = allTasks.filter(t => t.labelId === labelId);
  const checkedTasks = tasks.filter(t => t.checked);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Open modal for editing Task
  const handleEditModal = (item: Task) => {
    setTaskToEdit(item);
    setEditModalVisible(true);
  };

  // Delete the entire label
  const handleDeleteLabel = (labelId: string) => {
    Alert.alert(
      tr.alerts.deleteLabel.title,
      tr.alerts.deleteLabel.message,
      [
        {
          text: tr.buttons.yes,
          onPress: () => {
            deleteLabel(labelId);
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
  if (labelsLoading || tasksLoading) {
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
            <TouchableOpacity onPress={() => {
              if (label) {
                handleDeleteLabel(label.id);
              }
            }}>
              <MaterialCommunityIcons name="delete-alert-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      {label && (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

          {/* Header container */}
          <View style={[styles.headerContainer, { borderBottomColor: label.color }]}>
            {/* Header subtitle */}
            <Text style={{ fontSize: 14, color: theme.muted, paddingHorizontal: 8 }}>
              {`${checkedTasks.length} ${tr.labels.of} ${tasks.length} ${tr.labels.tasks}`}
            </Text>
          </View>

          {/* -----Tasks List----- */}
          <TasksList
            labelId={label.id}
            handleEditModal={handleEditModal}
          />

          {/* -----Edit Task Modal----- */}
          <AppModal modalVisible={editModalVisible} setModalVisible={setEditModalVisible}>
            {taskToEdit && (
              <EditTask
                taskToEdit={taskToEdit}
                handleEditModal={setEditModalVisible}
              />
            )}
          </AppModal>

          {/* Add Task Input */}
          <AddTask
            labelId={label.id}
            currentLabelColor={label.color}
          />
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
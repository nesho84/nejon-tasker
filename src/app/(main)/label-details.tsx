import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddTask from "@/components/tasks/AddTask";
import EditTask from "@/components/tasks/EditTask";
import TasksList from "@/components/tasks/TasksList";
import { TasksContext } from "@/context/TasksContext";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useContext, useLayoutEffect, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

export default function LabelDetailsScreen() {
  const { theme } = useThemeStore();
  const { language, tr } = useLanguageStore();

  const navigation = useNavigation();
  const { labelKey } = useLocalSearchParams();

  const {
    labels,
    deleteLabel,
    addTask,
    editTask,
    deleteTask,
    checkUncheckTask,
    orderTasks,
    inputRef,
  } = useContext(TasksContext);

  // Get the current Label
  const currentLabel = labels.find(
    (label: any) => label.key === labelKey
  );

  // Filter Tasks unchecked and checked
  const filterTasks = (isChecked: any) => {
    return currentLabel && currentLabel.tasks
      ? currentLabel.tasks.filter((task: any) => task.checked === isChecked)
      : [];
  };

  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Add Task to Storage
  const handleAddTask = (text: string) => {
    addTask(currentLabel.key, text);
    inputRef.current.clear();
    Keyboard.dismiss();
  };

  // Open modal for editing Task
  const handleEditModal = (item: any) => {
    setTaskToEdit(item);
    setEditModalVisible(true);
  };

  // Edit Task in Storage
  const handleEditTask = (taskObj: any) => {
    editTask(taskObj);
    setEditModalVisible(false);
  };

  // Delete task from the Storage
  const handleDeleteTask = (taskKey: string) => {
    deleteTask(taskKey);
  };

  // Delete the entire label from the Storage
  const handleDeleteLabel = (labelKey: string) => {
    Alert.alert(
      `${tr.alerts.deleteLabel.title}`,
      `${tr.alerts.deleteLabel.message}`,
      [
        {
          text: `${tr.buttons.yes}`,
          onPress: () => {
            deleteLabel(labelKey);
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

  // Toggle task to checked or unchecked
  const handleCheckbox = (newValue: boolean, itemKey: string) => {
    checkUncheckTask(itemKey);
    setToggleCheckBox(newValue);
  };

  // Order Tasks
  const handleOrderTasks = (orderedTasks: any) => {
    orderTasks(currentLabel.key, orderedTasks);
  };

  // Accessing Native navigation bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => {
          // console.log(currentLabel);
          handleDeleteLabel(currentLabel.key);
        }}>
          <MaterialCommunityIcons
            name="delete-alert-outline"
            size={24}
            color={theme.danger}
            style={{ marginRight: 6 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentLabel]);

  return (
    <AppScreen>

      {currentLabel && (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.background,
            },
          ]}
        >
          {/* Header container */}
          <View
            style={[
              styles.headerContainer,
              { borderBottomColor: currentLabel.color },
            ]}
          >
            {/* Header Title */}
            <Text
              style={{
                fontSize: 22,
                color: currentLabel.color,
                paddingHorizontal: 10,
              }}
            >
              {currentLabel.title}
            </Text>
            {/* Header subtitle */}
            <Text style={{ fontSize: 14, color: theme.muted, paddingHorizontal: 10 }}>
              {`${filterTasks(true).length} ${tr.labels.of} ${currentLabel.tasks ? currentLabel.tasks.length : "0"} ${tr.labels.tasks}`}
            </Text>
          </View>

          {/* -----Tasks List----- */}
          <TasksList
            unCheckedTasks={filterTasks(false)}
            checkedTasks={filterTasks(true)}
            handleEditModal={handleEditModal}
            handleCheckbox={handleCheckbox}
            handleOrderTasks={handleOrderTasks}
            handleDeleteTask={handleDeleteTask}
          />

          {/* Add Task Input */}
          <AddTask
            inputRef={inputRef}
            handleAddTask={handleAddTask}
            currentLabelColor={currentLabel.color}
            placeholder={tr.forms.inputPlaceholder}
          />

          {/* -----Edit Task Modal----- */}
          <AppModal
            modalVisible={editModalVisible}
            setModalVisible={setEditModalVisible}
          >
            <EditTask
              taskToEdit={taskToEdit}
              handleEditTask={handleEditTask}
            />
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
    paddingTop: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    alignSelf: "stretch",
  },
});
import AppLoading from "@/components/AppLoading";
import AppNoItems from "@/components/AppNoItems";
import AppScreen from "@/components/AppScreen";
import AddTask from "@/components/tasks/AddTask";
import EditTask from "@/components/tasks/EditTask";
import TaskItem from "@/components/tasks/TaskItem";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function TasksScreen() {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { labelId } = useLocalSearchParams();

  // LabelStore
  const { labels, deleteLabel } = useLabelStore();
  const label = labels.find((l) => l.id === labelId);

  // taskStore
  const allTasks = useTaskStore((state) => state.allTasks);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  // Filter tasks
  const tasks = useMemo(() => allTasks.filter(t => t.labelId === labelId && !t.isDeleted), [allTasks, labelId]);
  const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);
  const uncheckedTasks = useMemo(() => tasks.filter(t => !t.checked), [tasks]);
  // Get last task for styling
  const lastChecked = useMemo(() => checkedTasks[checkedTasks.length - 1], [checkedTasks]);
  const lastUnchecked = useMemo(() => uncheckedTasks[uncheckedTasks.length - 1], [uncheckedTasks]);

  // Refs for bottomSheet Modals
  const editTaskRef = useRef<BottomSheetModal>(null);

  // Local State
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ------------------------------------------------------------
  // Open BottomSheetModal for editing Task
  // ------------------------------------------------------------
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    editTaskRef.current?.present();
  };

  // ------------------------------------------------------------
  // Hard delete label
  // ------------------------------------------------------------
  const handleDeleteLabel = async (labelId: string) => {
    if (!label) return;

    Alert.alert(
      tr.alerts.deleteLabel.title,
      tr.alerts.deleteLabel.message,
      [
        {
          text: tr.buttons.yes,
          style: 'destructive',
          onPress: async () => {
            // If there are tasks, show second confirmation
            if (tasks.length > 0) {
              Alert.alert(
                tr.alerts.deleteLabel.title,
                tr.alerts.deleteLabel.message2,
                [
                  {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setIsLoading(true);
                        await deleteLabel(labelId);
                        router.back();
                      } catch (error) {
                        Alert.alert('Error', `Failed to delete: ${error}`);
                      } finally {
                        setIsLoading(false);
                      }
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            } else {
              // No tasks, delete immediately
              try {
                setIsLoading(true);
                await deleteLabel(labelId);
                router.back();
              } catch (error) {
                Alert.alert('Error', `Failed to delete: ${error}`);
              } finally {
                setIsLoading(false);
              }
            }
          },
        },
        { text: tr.buttons.no, style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ------------------------------------------------------------
  // Reorder tasks
  // ------------------------------------------------------------
  const handleOrderTasks = async (orderedTasks: Task[]) => {
    const taskIds = orderedTasks.map(task => task.id);
    await reorderTasks(taskIds);
  };

  // ------------------------------------------------------------
  // Wait for instant navigation
  // ------------------------------------------------------------
  useEffect(() => {
    requestAnimationFrame(() => setIsReady(true));
  }, []);

  // Loading state
  if (!isReady || isLoading) {
    return <AppLoading />;
  }

  // Render Single Task template
  const RenderTask = ({ item, getIndex, isActive, drag }: RenderItemParams<Task>) => {
    const lastItemMargin = lastChecked === item || lastUnchecked === item ? 8 : 0;

    return (
      <View style={{ marginBottom: lastItemMargin }}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          onLongPress={drag}
          disabled={isActive}
          delayLongPress={400}
          delayPressIn={0}
          delayPressOut={0}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <TaskItem
            task={item}
            index={getIndex()}
            isActive={isActive}
            checkAction={true}
            favoriteAction={true}
            softDeleteAction={true}
            shareAction={true}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppScreen>

      {/* Top Navigation bar icons */}
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

      {/* Main Content with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"padding"}
        keyboardVerticalOffset={100}
      >
        {label && (
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header container */}
            <View style={[styles.headerContainer, { borderBottomColor: label.color }]}>
              {/* Header text */}
              <Text style={[styles.headerText, { color: theme.muted }]}>
                {`${checkedTasks.length} ${tr.labels.of} ${tasks.length} ${tr.labels.tasks}`}
              </Text>
            </View>

            <View style={styles.tasksContainer}>
              {/* ----- Unchecked tasks ----- */}
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

              {/* ----- Checked tasks ----- */}
              {checkedTasks.length > 0 && (
                <>
                  <View style={[styles.tasksDivider, { borderColor: theme.border }]} />
                  <Text style={[styles.tasksDividerText, { color: theme.muted, borderBottomColor: label.color }]}>
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
            </View>

            {/* EditTask BottomSheetModal */}
            <EditTask ref={editTaskRef} task={selectedTask} />

            {/* AddTask TextInput */}
            <AddTask label={label} />
          </View>
        )}
      </KeyboardAvoidingView>

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    alignSelf: "stretch",
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 13,
    paddingHorizontal: 8,
  },

  tasksContainer: {
    flex: 1,
  },
  tasksDivider: {
    width: "100%",
    borderWidth: 1,
  },
  tasksDividerText: {
    alignSelf: "flex-start",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 3,
    width: "100%",
    borderBottomWidth: 1,
  },
});
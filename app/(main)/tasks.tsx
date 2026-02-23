import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import AppScreen from "@/components/AppScreen";
import EditTask from "@/components/tasks/EditTask";
import TaskItem from "@/components/tasks/TaskItem";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TasksScreen() {
  // Get labelId from route params
  const { labelId } = useLocalSearchParams();

  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);

  const insets = useSafeAreaInsets();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // LabelStore
  const labels = useLabelStore((state) => state.labels);
  const label = labels.find((l) => l.id === labelId);

  // taskStore
  const allTasks = useTaskStore((state) => state.allTasks);
  // Filter tasks
  const tasks = useMemo(() => allTasks.filter(t => t.labelId === labelId && !t.isDeleted), [allTasks, labelId]);
  const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);
  const uncheckedTasks = useMemo(() => tasks.filter(t => !t.checked), [tasks]);
  // Get last task for styling
  const lastChecked = useMemo(() => checkedTasks[checkedTasks.length - 1], [checkedTasks]);
  const lastUnchecked = useMemo(() => uncheckedTasks[uncheckedTasks.length - 1], [uncheckedTasks]);

  // Refs
  const textInputRef = useRef<TextInput>(null);
  const editTaskRef = useRef<BottomSheetModal>(null);

  // Local State
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskTextInput, setTaskTextInput] = useState("");

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
                    text: tr.buttons.deleteAll,
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setIsLoading(true);
                        await useLabelStore.getState().deleteLabel(labelId);
                        router.back();
                      } catch (error) {
                        Alert.alert('Error', `Failed to delete: ${error}`);
                      } finally {
                        setIsLoading(false);
                      }
                    },
                  },
                  { text: tr.buttons.cancel, style: 'cancel' },
                ]
              );
            } else {
              // No tasks, delete immediately
              try {
                setIsLoading(true);
                await useLabelStore.getState().deleteLabel(labelId);
                router.back();
              } catch (error) {
                Alert.alert('Error', `Failed to delete: ${error}`);
              } finally {
                setIsLoading(false);
              }
            }
          },
        },
        { text: tr.buttons.cancel, style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ------------------------------------------------------------
  // Reorder tasks
  // ------------------------------------------------------------
  const handleOrderTasks = async (orderedTasks: Task[]) => {
    const taskIds = orderedTasks.map(task => task.id);
    await useTaskStore.getState().reorderTasks(taskIds);
  };

  // ------------------------------------------------------------
  // Handle selecting a Task from the list
  // ------------------------------------------------------------
  const onSelect = (task: Task) => {
    setSelectedTask(task);
  };

  // ------------------------------------------------------------
  // Handle adding new Task
  // ------------------------------------------------------------
  const handleAdd = async () => {
    if (taskTextInput.trim().length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    // Create Task
    await useTaskStore.getState().createTask({ labelId: label?.id, text: taskTextInput });

    // Clear inputs
    setTaskTextInput("");
    textInputRef.current?.clear();

    // Dismiss keyboard
    Keyboard.dismiss();
  };

  // ------------------------------------------------------------
  // Handle TextInput change
  // ------------------------------------------------------------
  const onChangeText = useCallback((text: string) => {
    setTaskTextInput(text);
  }, []);

  // ------------------------------------------------------------
  // Open a BottomSheetModal for editing Task
  // ------------------------------------------------------------
  useEffect(() => {
    if (selectedTask) {
      editTaskRef.current?.present();
    }
  }, [selectedTask]);

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
          onPress={() => onSelect(item)}
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
            // Delete Label Icon
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

      {label && (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
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
                containerStyle={{ flex: 3 }}
                data={uncheckedTasks}
                renderItem={RenderTask}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) => handleOrderTasks(data)}
              />
            ) : (
              <AppEmpty type="task" />
            )}

            {/* ----- Checked tasks ----- */}
            {(checkedTasks.length > 0 && !isKeyboardVisible) && (
              <>
                <View style={[styles.tasksDivider, { borderColor: label.color }]}>
                  <Text style={[styles.tasksDividerText, { color: theme.muted }]}>
                    {`${checkedTasks.length} ${tr.labels.checkedItems}`}
                  </Text>
                </View>
                <DraggableFlatList
                  containerStyle={{ flex: 1 }}
                  data={checkedTasks}
                  renderItem={RenderTask}
                  keyExtractor={(item) => item.id}
                  onDragEnd={({ data }) => handleOrderTasks(data)}
                />
              </>
            )}
          </View>

          {/* AddTask TextInput */}
          <View
            style={[
              styles.addTaskContainer,
              {
                backgroundColor: theme.bg,
                borderTopColor: theme.border,
                marginBottom: isKeyboardVisible ? insets.bottom + keyboardHeight : 0,
              }
            ]}
          >
            {/* TextInput */}
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.bgAlt, color: theme.text }]}
              ref={textInputRef}
              defaultValue=""
              multiline={true}
              maxLength={5500}
              scrollEnabled={true}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChangeText}
              placeholder={tr.forms.inputPlaceholder}
              placeholderTextColor={theme.placeholder}
            />

            {/* Add Button */}
            <Pressable
              style={[styles.addButton, { backgroundColor: label.color }]}
              onPress={handleAdd}
            >
              <MaterialIcons name="add" size={38} color={theme.neutral} />
            </Pressable>
          </View>

          {/* EditTask BottomSheetModal */}
          <EditTask
            ref={editTaskRef}
            task={selectedTask}
            labelColor={label.color}
            onDismiss={() => setSelectedTask(null)}
          />
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
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 3,
    paddingBottom: 3,
  },
  tasksDividerText: {
    width: "100%",
    alignSelf: "flex-start",
    fontSize: 13,
  },

  // AddTask styles
  addTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 6,
    gap: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButton: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    width: 47,
    height: 47,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
  },
});
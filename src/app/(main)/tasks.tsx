import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import AppScreen from "@/components/AppScreen";
import TaskItem from "@/components/TaskItem";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Keyboard, ListRenderItemInfo, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ------------------------------------------------------------
// Single unchecked task row (drag) — no hooks, lowercase so the
// React Compiler skips it; safe to pass directly to renderItem
// ------------------------------------------------------------
function taskCard({ item, getIndex, isActive, drag }: RenderItemParams<Task>) {
  const handleEdit = () => {
    router.navigate({
      pathname: '/editTask',
      params: { labelId: item.labelId, taskId: item.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handleEdit}
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
      />
    </TouchableOpacity>
  );
}

// ------------------------------------------------------------
// Single checked task row (no drag) — lowercase name so the React Compiler
// doesn't instrument it; FlatList calls renderItem as a plain function
// ------------------------------------------------------------
function checkedTaskCard({ item }: ListRenderItemInfo<Task>) {
  const handleEdit = () => {
    router.navigate({
      pathname: '/editTask',
      params: { labelId: item.labelId, taskId: item.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handleEdit}
      delayPressIn={0}
      delayPressOut={0}
      activeOpacity={0.7}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
      <TaskItem
        task={item}
        checkAction={true}
        favoriteAction={true}
        softDeleteAction={true}
      />
    </TouchableOpacity>
  );
}

export default function TasksScreen() {
  // Get labelId from route params
  const { labelId } = useLocalSearchParams();

  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);

  // LabelStore
  const labels = useLabelStore((state) => state.labels);
  const label = labels.find((l) => l.id === labelId);

  // taskStore
  const allTasks = useTaskStore((state) => state.allTasks);
  // Filter tasks
  const tasks = useMemo(() => allTasks.filter(t => t.labelId === labelId && !t.isDeleted), [allTasks, labelId]);
  const checkedTasks = useMemo(() => tasks.filter(t => t.checked), [tasks]);
  const uncheckedTasks = useMemo(() => tasks.filter(t => !t.checked), [tasks]);

  // Refs
  const textInputRef = useRef<TextInput>(null);

  // Safe area insets
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;

  // Keyboard state
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // Local State
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [taskTextInput, setTaskTextInput] = useState("");
  const [isCheckedOpen, setIsCheckedOpen] = useState(false);

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
                ],
                { cancelable: false }
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
      { cancelable: false }
    );
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
  // Reorder tasks
  // ------------------------------------------------------------
  const handleOrderTasks = async (orderedTasks: Task[]) => {
    const taskIds = orderedTasks.map(task => task.id);
    await useTaskStore.getState().reorderTasks(taskIds);
  };

  // ------------------------------------------------------------
  // Handle TextInput change
  // ------------------------------------------------------------
  const onChangeText = (text: string) => setTaskTextInput(text);

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
              <MaterialDesignIcons name="delete-alert-outline" size={24} color={theme.danger} />
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
                containerStyle={{ flex: 1 }}
                contentContainerStyle={styles.tasksContent}
                showsVerticalScrollIndicator={false}
                data={uncheckedTasks}
                renderItem={taskCard}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) => handleOrderTasks(data)}
              />
            ) : (
              <AppEmpty type="task" />
            )}

            {/* ----- Checked tasks Section ----- */}
            {(checkedTasks.length > 0 && !isKeyboardVisible) && (
              <>
                {/* Tasks Divider/Header */}
                <View style={[styles.checkedSectionBorder, { borderTopColor: label.color }]} />
                <TouchableOpacity
                  style={[styles.tasksDivider, { backgroundColor: theme.section }]}
                  onPress={() => setIsCheckedOpen(!isCheckedOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tasksDividerText, { color: theme.muted, opacity: 0.8 }]}>
                    {`${checkedTasks.length} ${tr.labels.checkedItems}`}
                  </Text>
                  <MaterialDesignIcons
                    name={isCheckedOpen ? "chevron-down" : "chevron-up"}
                    size={26}
                    color={theme.muted}
                    style={{ marginRight: -4, opacity: 0.8 }}
                  />
                </TouchableOpacity>

                {/* ----- Checked tasks ----- */}
                {isCheckedOpen && (
                  <>
                    <View style={[styles.checkedSectionBorder, { borderTopColor: theme.border, opacity: 0.3 }]} />
                    <FlatList
                      style={{ flexGrow: 0, maxHeight: "40%" }}
                      contentContainerStyle={styles.tasksContent}
                      showsVerticalScrollIndicator={false}
                      data={checkedTasks}
                      renderItem={checkedTaskCard}
                      keyExtractor={(item) => item.id}
                    />
                  </>
                )}
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
                marginBottom: isKeyboardVisible ? bottomInset + keyboardHeight : bottomInset
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
    borderBottomWidth: 1.5,
  },
  headerText: {
    fontSize: 13,
    paddingHorizontal: 8,
  },

  tasksContainer: {
    flex: 1,
  },
  tasksContent: {
    paddingBottom: 8,
  },
  checkedSectionBorder: {
    borderTopWidth: 1.5,
  },
  tasksDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 30,
    marginTop: 1,
    marginBottom: 2,
    marginHorizontal: 6,
    paddingHorizontal: 8,
  },
  tasksDividerText: {
    flex: 1,
    fontSize: 14,
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
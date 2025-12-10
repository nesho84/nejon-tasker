import { useKeyboard } from "@/hooks/useKeyboard";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface Props {
  task: Task;
  handleEditModal: (value: boolean) => void;
}

export default function EditTask({ task, handleEditModal }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();
  const { keyboardHeight } = useKeyboard();
  const { scheduleNotification, cancelScheduledNotification } = useNotifications();

  // taskStore actions
  const updateTask = useTaskStore((state) => state.updateTask);

  const dateTimeToString = (date: string | null): string => {
    return date ? dates.format(date) : tr.forms.setReminder;
  }

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [taskInput, setTaskInput] = useState(task.text.toString());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [reminderInput, setReminderInput] = useState(dateTimeToString(task.reminderDateTime));
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(task.reminderDateTime);

  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      textInputRef.current?.blur();
      setIsEditing(false);
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleDateConfirm = (dateTime: Date) => {
    const currentDateTime = new Date();
    const reminderDateTime = new Date(dateTime);
    const timeDifferenceInSeconds = Math.max(0, (reminderDateTime.getTime() - currentDateTime.getTime()) / 1000);
    if (timeDifferenceInSeconds <= 0) {
      Alert.alert(
        tr.alerts.invalidDate.title,
        tr.alerts.invalidDate.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      setDatePickerVisible(false);
      return;
    } else {
      const dateTimeString = dateTime.toISOString();
      setSelectedDateTime(dateTimeString);
      setReminderInput(dateTimeToString(dateTimeString));
      setDatePickerVisible(false);
    }
  };

  const handleEdit = async () => {
    if (taskInput.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      const reminderChanged = task?.reminderDateTime !== selectedDateTime;
      // Check for existing reminders
      if (reminderChanged && selectedDateTime) {
        // Cancel old/existing notification
        if (task.reminderId) {
          await cancelScheduledNotification(task.reminderId);
        }
        // Schedule a new notification
        const notificationId = await scheduleNotification({
          ...task,
          text: taskInput,
          reminderDateTime: selectedDateTime,
        });
        // Update Task
        updateTask(task.id, {
          text: taskInput,
          reminderDateTime: selectedDateTime,
          reminderId: notificationId,
        });
      } else {
        // Update Task
        updateTask(task.id, {
          text: taskInput,
          reminderDateTime: selectedDateTime,
        });
      }

      // Clear inputs
      setTaskInput("");
      setSelectedDateTime(null);
      setReminderInput("");
      // Close Modal
      handleEditModal(false);
    }
  };

  return (
    <View style={[styles.container, { marginBottom: keyboardHeight - 24 }]}>

      {/* TextInput Container */}
      <View style={[
        styles.textInputContainer,
        {
          backgroundColor: isEditing ? theme.shadowMedium : theme.light,
          borderColor: theme.uncheckedItemDark,
        }
      ]}>

        {/* Single TextInput - always present */}
        <TextInput
          ref={textInputRef}
          style={[styles.textInput, { color: theme.text }]}
          multiline={true}
          scrollEnabled={true}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(text) => setTaskInput(text)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.muted}
          value={taskInput}
          selection={isEditing ? undefined : { start: 0, end: 0 }}
        />
      </View>

      {/* Custom DateTime picker Input */}
      <TouchableOpacity
        style={[styles.inputDateContainer, { backgroundColor: theme.white, borderColor: theme.uncheckedItemDark }]}
        onPress={() => setDatePickerVisible(true)}>
        <TextInput
          style={{ color: task.reminderId ? theme.success : theme.lightMuted }}
          placeholder={tr.forms.setReminder}
          value={reminderInput}
          editable={false}
        />
        <Ionicons
          name={task.reminderId ? "notifications" : "notifications-off"}
          color={task.reminderId ? theme.success : theme.lightMuted}
          size={20}
        />
      </TouchableOpacity>

      {/* Reminder input */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        locale="de_DE"
        is24Hour
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />

      {/* Save button */}
      <TouchableOpacity
        style={[styles.btnEdit, { backgroundColor: theme.lightMuted }]}
        onPress={handleEdit}
      >
        <Text style={styles.btnEditText}>
          {tr.buttons.save}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10,
  },
  textInputContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
  },
  textInput: {
    minHeight: 115,
    maxHeight: 230,
    fontSize: 15,
    textAlignVertical: 'top',
    padding: 11,
  },
  inputDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 35,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingHorizontal: 10
  },
  btnEdit: {
    height: 50,
    justifyContent: "center",
    padding: 11,
    borderRadius: 5,
  },
  btnEditText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    color: "white",
  },
});
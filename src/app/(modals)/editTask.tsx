import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import useNotifications from "@/hooks/useNotifications";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { dates, isReminderActive } from "@/utils/dates";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EditTask() {
  // Get taskId from route params
  const { labelId, taskId } = useLocalSearchParams();

  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);
  const labels = useLabelStore((state) => state.labels);
  const label = labels.find((l) => l.id === labelId);
  const allTasks = useTaskStore((state) => state.allTasks);
  const task = allTasks.find((l) => l.id === taskId);

  // Refs
  const modalSheetRef = useRef<ModalSheetRef>(null);
  const textInputRef = useRef<TextInput>(null);

  // Format date time to string or return default placeholder
  const dateTimeToString = (date: string | null): string => {
    return date ? dates.format(date) : tr.forms.setReminder;
  }

  // Notifications hook
  const {
    notificationsEnabled,
    requestPermission,
    scheduleNotification,
    cancelScheduledNotification
  } = useNotifications();

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [isReminderUpdated, setIsReminderUpdated] = useState(false);
  const [taskText, setTaskText] = useState(task?.text || "");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [reminderInput, setReminderInput] = useState(dateTimeToString(task?.reminderDateTime || null));
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(task?.reminderDateTime || null);

  // Check if reminder is active (has reminderId AND datetime is in the future)
  const hasActiveReminder = isReminderActive(task?.reminderDateTime || null, task?.reminderId || null);

  // ------------------------------------------------------------
  // Handle keyboard hide to blur TextInput
  // ------------------------------------------------------------
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      textInputRef.current?.blur();
      setIsEditing(false);
    });

    return () => { keyboardDidHideListener.remove(); };
  }, []);

  // ------------------------------------------------------------
  // Update state when task prop changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (task) {
      setTaskText(task.text);
      setSelectedDateTime(task.reminderDateTime || null);
      setReminderInput(dateTimeToString(task.reminderDateTime || null));
    }
  }, [task]);

  // ------------------------------------------------------------
  // Handle DateTime picker open
  // ------------------------------------------------------------
  const handleDateTimePicker = async () => {
    if (!notificationsEnabled) {
      const status = await requestPermission();
      if (status === 'granted') {
        setDatePickerVisible(true);
      }
      return;
    }
    setDatePickerVisible(true);
  };

  // ------------------------------------------------------------
  // Handle DateTime picker confirm
  // ------------------------------------------------------------
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
      setIsReminderUpdated(true);
      setDatePickerVisible(false);
    }
  };

  // ------------------------------------------------------------
  // Handle Task update
  // ------------------------------------------------------------
  const handleUpdate = async () => {
    if (!task) return;

    // Validate input
    if (taskText.trim().length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    const textChanged = task.text !== taskText;
    const reminderChanged = task?.reminderDateTime !== selectedDateTime;

    // Check for existing reminders - reschedule if text or reminder changed
    if ((textChanged || reminderChanged) && selectedDateTime) {
      // Cancel old/existing notification
      if (task.reminderId) {
        await cancelScheduledNotification(task.reminderId);
      }

      // Schedule a new notification
      const notificationId = await scheduleNotification({
        ...task,
        text: taskText,
        reminderDateTime: selectedDateTime,
      });

      // Update Task
      await useTaskStore.getState().updateTask(task.id, {
        text: taskText,
        reminderDateTime: selectedDateTime,
        reminderId: notificationId,
      });
    } else {
      // Update only text if no reminder involved
      await useTaskStore.getState().updateTask(task.id, {
        text: taskText,
      });
    }

    // Clear inputs
    setTaskText("");
    setSelectedDateTime(null);
    setReminderInput("");

    // Close ModalSheet
    modalSheetRef.current?.close();
  };

  // ------------------------------------------------------------
  // Cancel task notification/reminder
  // ------------------------------------------------------------
  const handleCancelReminder = async () => {
    Alert.alert(
      tr.alerts.cancelReminder.title,
      tr.alerts.cancelReminder.message,
      [
        {
          text: tr.buttons.yes,
          onPress: async () => {
            // Cancel the existing notification
            if (task?.reminderId) {
              await cancelScheduledNotification(task.reminderId);
              // Clear reminder data when cancelling reminder
              await useTaskStore.getState().updateTask(task.id, {
                reminderDateTime: null,
                reminderId: null
              });
              // Close ModalSheet
              modalSheetRef.current?.close();
            }
          },
        },
        {
          text: tr.buttons.cancel,
        },
      ],
      { cancelable: false }
    );
  };

  // ------------------------------------------------------------
  // Handle TextInput change
  // ------------------------------------------------------------
  const onChangeText = useCallback((text: string) => {
    setTaskText(text);
  }, []);

  return (
    <ModalSheet style={{ backgroundColor: theme.bg2 }} ref={modalSheetRef} modalHeight={'42%'}>

      <View style={styles.container}>
        {/* TextInput Container */}
        <View style={[styles.textInputContainer, { backgroundColor: theme.shadow, borderColor: theme.placeholder }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.bgAlt, color: theme.text }]}
            ref={textInputRef}
            defaultValue={taskText}
            multiline={true}
            maxLength={5500}
            scrollEnabled={true}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeText}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onPressIn={() => setIsEditing(true)}
            placeholder={tr.forms.inputPlaceholder}
            placeholderTextColor={theme.placeholder}
            selection={isEditing ? undefined : { start: 0, end: 0 }}
          />
        </View>

        {/* DateTimeInput Container */}
        <View style={styles.dateTimeInputContainer}>
          {/* TextInput with bell Icon */}
          <TouchableOpacity
            style={[styles.dateTimeTextInput, { backgroundColor: theme.bgAlt, borderColor: theme.muted }]}
            onPress={handleDateTimePicker}
          >
            <MaterialCommunityIcons
              name={(hasActiveReminder || isReminderUpdated) ? "bell" : "bell-off"}
              color={(hasActiveReminder || isReminderUpdated) ? theme.success : theme.muted}
              size={20}
              style={{ marginRight: 4 }}
            />
            <TextInput
              style={{
                fontWeight: '600',
                color: (hasActiveReminder || isReminderUpdated) ? theme.success : theme.muted,
                textDecorationLine: (!task?.reminderDateTime || hasActiveReminder) ? 'none' : 'line-through'
              }}
              placeholder={tr.forms.setReminder}
              value={reminderInput}
              editable={false}
            />
          </TouchableOpacity>

          {/* Reminder DateTimePickerModal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            locale="de_DE"
            is24Hour
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisible(false)}
          />

          {/* Reminder Cancel/Delete Icon */}
          <TouchableOpacity
            disabled={!hasActiveReminder}
            style={[styles.btnCancelReminder, { backgroundColor: theme.bgAlt, borderColor: theme.muted }]}
            onPress={handleCancelReminder}
          >
            <MaterialCommunityIcons
              name="bell-remove-outline"
              size={20}
              color={hasActiveReminder ? theme.danger : theme.muted}
              style={{ opacity: hasActiveReminder ? 1 : 0.4 }}
            />
          </TouchableOpacity>
        </View>

        {/* Edit button */}
        <TouchableOpacity
          style={[styles.btnEdit, { backgroundColor: label?.color }]}
          onPress={handleUpdate}
        >
          <Text style={[styles.btnEditText, { color: theme.neutral }]}>{tr.buttons.save}</Text>
        </TouchableOpacity>
      </View>

    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    gap: 14,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 200,
    maxHeight: 250,
    fontSize: 15,
    textAlignVertical: 'top',
    padding: 11,
  },
  dateTimeInputContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dateTimeTextInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 35,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  btnCancelReminder: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
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
  },
});
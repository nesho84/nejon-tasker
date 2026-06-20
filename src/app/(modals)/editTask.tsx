import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import useNotifications from "@/hooks/useNotifications";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { dates } from "@/utils/dates";
import { isReminderActive } from "@/utils/utils";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Map the app language to a date-picker locale
const DATE_PICKER_LOCALES: Record<string, string> = { en: "en_GB", de: "de_DE", sq: "sq_AL" };

export default function EditTask() {
  // Get taskId from route params
  const { labelId, taskId } = useLocalSearchParams();

  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);
  const language = useLanguageStore((state) => state.language);
  const labels = useLabelStore((state) => state.labels);
  const label = labels.find((l) => l.id === labelId);
  const allTasks = useTaskStore((state) => state.allTasks);
  const task = allTasks.find((t) => t.id === taskId);

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
  // Sync editable fields when the task changes (intentional prop → state sync)
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (task) {
      setTaskText(task.text);
      setSelectedDateTime(task.reminderDateTime || null);
      setReminderInput(dateTimeToString(task.reminderDateTime || null));
    }
  }, [task]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

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
  const onChangeText = (text: string) => setTaskText(text);

  // Fixed footer with Cancel/Save buttons — a plain element, not a component
  const fixedFooter = (
    <>
      {/* Divider above footer */}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={[styles.btnRow, { borderTopColor: theme.divider }]}>
        {/* Cancel button */}
        <TouchableOpacity
          style={[styles.btnCancel, { backgroundColor: theme.disabled, borderColor: theme.border }]}
          onPress={() => modalSheetRef.current?.close()}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnCancelText, { color: theme.text2 }]}>{tr.buttons.cancel}</Text>
        </TouchableOpacity>
        {/* Save Button */}
        <TouchableOpacity
          style={[styles.btnSave, { backgroundColor: label?.color }]}
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnSaveText, { color: theme.neutral }]}>{tr.buttons.save}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Main Content
  return (
    <ModalSheet
      ref={modalSheetRef}
      size={0.53}
      colors={{ sheetBackgroundColor: theme.bg2, handleColor: theme.handle, headerBarBorderColor: 'transparent' }}
      footer={fixedFooter}
    >
      <View style={styles.container}>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: label?.color }]}>
            {tr.forms.editTask}
          </Text>
          <View style={[styles.accentDot, { backgroundColor: label?.color, shadowColor: label?.color }]} />
        </View>

        {/* Divider below title */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Text input */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>{tr.forms.task}</Text>
        <TextInput
          style={[styles.textInput, {
            backgroundColor: theme.shadow,
            color: theme.text2,
            borderColor: `${label?.color}30`,
          }]}
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

        {/* DateTimeInput Container */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>{tr.forms.reminder}</Text>
        <View style={styles.dateTimeInputRow}>
          {/* TextInput with bell Icon */}
          <TouchableOpacity
            style={[
              styles.dateTimeTextInput,
              {
                backgroundColor: theme.shadow,
                borderColor: `${label?.color}30`,
              }]}
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
                height: 48,
                fontWeight: '600',
                color: (hasActiveReminder || isReminderUpdated) ? theme.success : theme.muted,
                textDecorationLine: (!task?.reminderDateTime || hasActiveReminder || isReminderUpdated) ? 'none' : 'line-through'
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
            locale={DATE_PICKER_LOCALES[language] ?? "en_GB"}
            is24Hour
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisible(false)}
          />

          {/* Reminder Cancel/Delete Icon */}
          <TouchableOpacity
            disabled={!hasActiveReminder}
            style={[
              styles.btnCancelReminder,
              {
                backgroundColor: theme.shadow,
                borderColor: `${label?.color}30`,
              }
            ]}
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

      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },

  divider: {
    height: 1.8,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.9,
  },
  textInput: {
    flex: 1,
    height: 136,
    maxHeight: 136,
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlignVertical: 'top',
    paddingHorizontal: 14,
  },

  dateTimeInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateTimeTextInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 35,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  btnCancelReminder: {
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
  },

  btnRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 14,
  },
  btnCancel: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnSave: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  btnSaveText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
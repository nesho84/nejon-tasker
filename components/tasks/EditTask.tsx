import { useKeyboard } from "@/hooks/useKeyboard";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates, isReminderActive } from "@/utils/dates";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, BackHandler, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  task: Task | null;
  labelColor: string;
  onDismiss: () => void;
}

type Ref = BottomSheetModal;

const EditTask = forwardRef<Ref, Props>((props, ref) => {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const insets = useSafeAreaInsets();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // taskStore
  const updateTask = useTaskStore((state) => state.updateTask);

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
  const [taskText, setTaskText] = useState(props.task?.text || "");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [reminderInput, setReminderInput] = useState(dateTimeToString(props.task?.reminderDateTime || null));
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(props.task?.reminderDateTime || null);

  // TextInput reference
  const textInputRef = useRef<TextInput>(null);

  // Check if reminder is active (has reminderId AND datetime is in the future)
  const hasActiveReminder = isReminderActive(props.task?.reminderDateTime || null, props.task?.reminderId || null);

  // ------------------------------------------------------------
  // Handle keyboard hide to blur TextInput
  // ------------------------------------------------------------
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      textInputRef.current?.blur();
      setIsEditing(false);
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // ------------------------------------------------------------
  // Update state when task prop changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (props.task) {
      setTaskText(props.task.text);
      setSelectedDateTime(props.task.reminderDateTime || null);
      setReminderInput(dateTimeToString(props.task.reminderDateTime || null));
    }
  }, [props.task]);

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
    if (!props.task) return;

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

    const textChanged = props.task.text !== taskText;
    const reminderChanged = props.task?.reminderDateTime !== selectedDateTime;

    // Check for existing reminders - reschedule if text or reminder changed
    if ((textChanged || reminderChanged) && selectedDateTime) {
      // Cancel old/existing notification
      if (props.task.reminderId) {
        await cancelScheduledNotification(props.task.reminderId);
      }

      // Schedule a new notification
      const notificationId = await scheduleNotification({
        ...props.task,
        text: taskText,
        reminderDateTime: selectedDateTime,
      });

      // Update Task
      await updateTask(props.task.id, {
        text: taskText,
        reminderDateTime: selectedDateTime,
        reminderId: notificationId,
      });
    } else {
      // Update only text if no reminder involved
      await updateTask(props.task.id, {
        text: taskText,
      });
    }

    // Clear inputs
    setTaskText("");
    setSelectedDateTime(null);
    setReminderInput("");

    // Close BottomSheetModal
    dismiss();
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
            if (props.task?.reminderId) {
              await cancelScheduledNotification(props.task.reminderId);
              // Clear reminder data when cancelling reminder
              await updateTask(props.task.id, {
                reminderDateTime: null,
                reminderId: null
              });
              // Close BottomSheetModal
              dismiss();
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

  // ------------------------------------------------------------
  // BottomSheetModal setup
  // ------------------------------------------------------------
  const { dismiss } = useBottomSheetModal();
  const snapPoints = useMemo(() => ['50%', '75%', '90%'], []);
  const isOpenRef = useRef(false);

  // Android back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpenRef.current && ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [ref]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.placeholder }}
      onChange={(index) => isOpenRef.current = index !== -1}
      onDismiss={() => {
        setIsEditing(false);
        setIsReminderUpdated(false);
        props.onDismiss();
      }}
    >
      <BottomSheetView
        style={[
          styles.container,
          { paddingBottom: isKeyboardVisible ? insets.bottom + keyboardHeight : insets.bottom + 16 }
        ]}
      >
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
                textDecorationLine: (!props.task?.reminderDateTime || hasActiveReminder) ? 'none' : 'line-through'
              }}
              placeholder={tr.forms.setReminder}
              value={reminderInput}
              editable={false}
            />
          </TouchableOpacity>

          {/* Reminder DateTimePickerModal */}
          {isDatePickerVisible && (
            <DateTimePickerModal
              isVisible={true}
              mode="datetime"
              locale="de_DE"
              is24Hour
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisible(false)}
            />
          )}

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

        {/* Save button */}
        <TouchableOpacity
          style={[styles.btnEdit, { backgroundColor: props.labelColor }]}
          onPress={handleUpdate}
        >
          <Text style={styles.btnEditText}>{tr.buttons.save}</Text>
        </TouchableOpacity>

      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 14,
  },

  textInputContainer: {
    marginTop: 12,
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
    color: "white",
  },
});

export default EditTask;
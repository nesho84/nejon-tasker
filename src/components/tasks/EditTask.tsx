import { useKeyboard } from "@/hooks/useKeyboard";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates, isReminderActive } from "@/utils/dates";
import { Ionicons } from '@expo/vector-icons';
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
  const [taskText, setTaskText] = useState(props.task?.text || "");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [reminderInput, setReminderInput] = useState(dateTimeToString(props.task?.reminderDateTime || null));
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(props.task?.reminderDateTime || null);
  const [isReminderUpdated, setIsReminderUpdated] = useState(false);

  // TextInput reference
  const textInputRef = useRef<TextInput>(null);

  // Check if reminder is active (has reminderId AND datetime is in the future)
  const reminderIsActive = isReminderActive(props.task?.reminderDateTime || null, props.task?.reminderId || null);

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
  // Handle Edit Task
  // ------------------------------------------------------------
  const handleEdit = async () => {
    if (!props.task) return;

    if (taskText.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      const reminderChanged = props.task?.reminderDateTime !== selectedDateTime;
      // Check for existing reminders
      if (reminderChanged && selectedDateTime) {
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
        // Update Task
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
    }
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
  const snapPoints = useMemo(() => ['45%', '75%', '90%'], []);
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
      handleIndicatorStyle={{ backgroundColor: theme.lightMuted }}
      onChange={(index) => isOpenRef.current = index !== -1}
      onDismiss={() => {
        setIsEditing(false);
        props.onDismiss();
      }}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: insets.bottom + 20 + (isKeyboardVisible ? keyboardHeight : 0) }]}>
        {/* TextInput Container */}
        <View
          style={[
            styles.textInputContainer,
            {
              backgroundColor: isEditing ? theme.faded : theme.shadow,
              borderColor: theme.uncheckedItemDark,
            }
          ]}
        >

          {/* TextInput */}
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            ref={textInputRef}
            defaultValue={taskText}
            multiline={true}
            maxLength={5500}
            scrollEnabled={true}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeText}
            onContentSizeChange={() => textInputRef.current?.setNativeProps({ selection: { start: 0, end: 0 } })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder={tr.forms.inputPlaceholder}
            placeholderTextColor={theme.placeholder}
            selection={isEditing ? undefined : { start: 0, end: 0 }}
            onPressIn={() => setIsEditing(true)}
          />
        </View>

        {/* DateTime picker Input */}
        <TouchableOpacity
          style={[styles.inputDateContainer, { backgroundColor: theme.white, borderColor: theme.uncheckedItemDark }]}
          onPress={handleDateTimePicker}>
          <TextInput
            style={{
              fontWeight: '600',
              color: (reminderIsActive || isReminderUpdated) ? theme.success : theme.lightMuted,
              textDecorationLine: (!props.task?.reminderDateTime || reminderIsActive) ? 'none' : 'line-through'
            }}
            placeholder={tr.forms.setReminder}
            value={reminderInput}
            editable={false}
          />
          <Ionicons
            name={(reminderIsActive || isReminderUpdated) ? "notifications" : "notifications-off"}
            color={(reminderIsActive || isReminderUpdated) ? theme.success : theme.lightMuted}
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
          style={[styles.btnEdit, { backgroundColor: props.labelColor }]}
          onPress={handleEdit}
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
    gap: 12,
  },
  textInputContainer: {
    backgroundColor: "white",
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 125,
    maxHeight: 250,
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

export default EditTask;
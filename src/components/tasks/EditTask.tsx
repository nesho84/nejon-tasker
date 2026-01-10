import { useKeyboard } from "@/hooks/useKeyboard";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  task: Task | null;
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

  const { scheduleNotification, cancelScheduledNotification } = useNotifications();

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [taskInput, setTaskInput] = useState(props.task?.text || "");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [reminderInput, setReminderInput] = useState(dateTimeToString(props.task?.reminderDateTime || null));
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(props.task?.reminderDateTime || null);

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

  const { dismiss } = useBottomSheetModal();
  const snapPoints = useMemo(() => ['25%', '75%', '95%'], []);

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

  // Update state when task prop changes
  useEffect(() => {
    if (props.task) {
      setTaskInput(props.task.text);
      setSelectedDateTime(props.task.reminderDateTime || null);
      setReminderInput(dateTimeToString(props.task.reminderDateTime || null));
    }
  }, [props.task]);

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
    if (!props.task) return;

    if (taskInput.length < 1) {
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
          text: taskInput,
          reminderDateTime: selectedDateTime,
        });
        // Update Task
        await updateTask(props.task.id, {
          text: taskInput,
          reminderDateTime: selectedDateTime,
          reminderId: notificationId,
        });
      } else {
        // Update Task
        await updateTask(props.task.id, {
          text: taskInput,
          reminderDateTime: selectedDateTime,
        });
      }

      // Clear inputs
      setTaskInput("");
      setSelectedDateTime(null);
      setReminderInput("");
      // Close BottomSheetModal
      dismiss();
    }
  };

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
    >
      <BottomSheetView
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 20 + (isKeyboardVisible ? keyboardHeight : 0) }
        ]}
      >
        {/* TextInput Container */}
        <View style={[
          styles.textInputContainer,
          {
            backgroundColor: isEditing ? theme.faded : theme.shadow,
            borderColor: theme.uncheckedItemDark,
          }
        ]}>

          {/* Single TextInput - always present */}
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            ref={textInputRef}
            multiline
            maxLength={5500}
            scrollEnabled={true}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => setTaskInput(text)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder={tr.forms.inputPlaceholder}
            placeholderTextColor={theme.placeholder}
            value={taskInput}
            selection={isEditing ? undefined : { start: 0, end: 0 }}
          />
        </View>

        {/* DateTime picker Input */}
        <TouchableOpacity
          style={[styles.inputDateContainer, { backgroundColor: theme.white, borderColor: theme.uncheckedItemDark }]}
          onPress={() => setDatePickerVisible(true)}>
          <TextInput
            style={{ color: props.task?.reminderId ? theme.success : theme.lightMuted }}
            placeholder={tr.forms.setReminder}
            value={reminderInput}
            editable={false}
          />
          <Ionicons
            name={props.task?.reminderId ? "notifications" : "notifications-off"}
            color={props.task?.reminderId ? theme.success : theme.lightMuted}
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

      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    // width: "100%",
    padding: 10,
    gap: 10,
  },
  textInputContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
  },
  textInput: {
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
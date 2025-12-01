import { useKeyboard } from "@/hooks/useKeyboard";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from '@expo/vector-icons';
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface Reminder {
  dateTime: string | null;
  notificationId?: string | null;
}

interface Task {
  name: string;
  reminder?: Reminder | null;
  [key: string]: any; // for other task properties
}

interface Props {
  handleEditTask: (task: Task) => void;
  taskToEdit: Task;
}

export default function EditTask({ handleEditTask, taskToEdit }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { keyboardHeight } = useKeyboard();

  const taskToEditDateTime = taskToEdit.reminder?.dateTime ?? null;

  const dateTimeToString = (date: string | null): string => {
    return date ? moment(date).format("DD.MM.YYYY HH:mm") : tr.forms.setReminder;
  }

  const [taskInput, setTaskInput] = useState(taskToEdit.name.toString());
  const [inputReminder, setInputReminder] = useState(dateTimeToString(taskToEditDateTime));
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(taskToEditDateTime);
  const [isEditing, setIsEditing] = useState(false);

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

  const hasActiveReminder = (): boolean => {
    if (!selectedDateTime) return false;

    const currentDateTime = new Date();
    const reminderDateTime = new Date(selectedDateTime);
    const timeDifferenceInSeconds = Math.max(0, (reminderDateTime.getTime() - currentDateTime.getTime()) / 1000);
    return timeDifferenceInSeconds > 0;
  }

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
      setInputReminder(dateTimeToString(dateTimeString));
      setDatePickerVisible(false);
    }
  };

  const handleEdit = () => {
    if (taskInput.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      handleEditTask({
        ...taskToEdit,
        name: taskInput,
        reminder: {
          ...taskToEdit.reminder,
          dateTime: selectedDateTime
        }
      });
      setTaskInput("");
      setSelectedDateTime(null);
      setInputReminder("");
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
          style={{ color: hasActiveReminder() ? theme.success : theme.lightMuted }}
          placeholder={tr.forms.setReminder}
          value={inputReminder}
          editable={false}
        />
        <Ionicons
          name={hasActiveReminder() ? "notifications" : "notifications-off"}
          color={hasActiveReminder() ? theme.success : theme.lightMuted}
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
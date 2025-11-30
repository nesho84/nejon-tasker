import { useState, useRef, useEffect } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Keyboard } from "react-native";
import moment from "moment";
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { useKeyboard } from "@/hooks/useKeyboard";

export default function EditTask({ handleEditTask, taskToEdit }) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { keyboardHeight } = useKeyboard();

  const taskToEditDateTime = taskToEdit.reminder?.dateTime ?? null;
  const dateTimeToString = (date) => {
    return date ? moment(date).format("DD.MM.YYYY HH:mm") : tr.forms.setReminder;
  }

  const [taskInput, setTaskInput] = useState(taskToEdit.name.toString());
  const [inputReminder, setInputReminder] = useState(dateTimeToString(taskToEditDateTime));
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(taskToEditDateTime);
  const [isEditing, setIsEditing] = useState(false);

  const textInputRef = useRef(null);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      textInputRef.current?.blur();
      setIsEditing(false);
    }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const hasActiveReminder = () => {
    const currentDateTime = new Date();
    const reminderDateTime = new Date(selectedDateTime);
    const timeDifferenceInSeconds = Math.max(0, (reminderDateTime - currentDateTime) / 1000);
    return selectedDateTime && timeDifferenceInSeconds > 0;
  }

  const handleDateConfirm = (dateTime) => {
    const currentDateTime = new Date();
    const reminderDateTime = new Date(dateTime);
    const timeDifferenceInSeconds = Math.max(0, (reminderDateTime - currentDateTime) / 1000);

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
      setSelectedDateTime(dateTime);
      setInputReminder(dateTimeToString(dateTime));
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
      setSelectedDateTime("");
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
          showsVerticalScrollIndicator={true}
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
    paddingBottom: 32,
  },
  textInputContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    marginTop: 16,
    marginBottom: 10,
  },
  textInput: {
    fontSize: 15,
    padding: 12,
    height: 230,
    textAlignVertical: 'top',
  },
  inputDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 35,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingHorizontal: 10
  },
  btnEdit: {
    height: 50,
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
  },
  btnEditText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    color: "white",
  },
});
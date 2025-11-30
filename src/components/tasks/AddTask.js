import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, Keyboard, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";
import { useKeyboard } from "@/hooks/useKeyboard";

export default function AddTask({ ...props }) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { keyboardHeight } = useKeyboard();

  const [task, setTask] = useState("");

  const handleAdd = () => {
    if (task.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ task: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      props.handleAddTask(task);
      setTask("");
    }
  };

  return (
    <View style={[styles.addTaskContainer, { marginBottom: keyboardHeight }]}>
      <TextInput
        style={[styles.addTaskInput, { backgroundColor: theme.light, color: theme.text }]}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={props.placeholder}
        placeholderTextColor={theme.placeholder}
        ref={props.inputRef}
        onChangeText={(text) => setTask(text)}
      />
      <TouchableOpacity
        style={{ backgroundColor: props.currentLabelColor }}
        onPress={handleAdd}
      >
        <MaterialIcons name="add" size={45} color={theme.light} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  addTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopColor: "#616161",
    borderTopWidth: 0.2,
  },
  addTaskInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    marginRight: 8,
    marginLeft: -2,
    // borderRadius: 8,
  },
  addButton: {
    width: 45,
    height: 45,
  },
});
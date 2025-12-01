import { useKeyboard } from "@/hooks/useKeyboard";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import { RefObject, useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  handleAddTask: (task: string) => void;
  placeholder: string;
  currentLabelColor: string;
  inputRef: RefObject<TextInput>;
}

export default function AddTask({ handleAddTask, placeholder, currentLabelColor, inputRef }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { keyboardHeight } = useKeyboard();

  const [task, setTask] = useState("");

  const handleAdd = () => {
    if (task.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      handleAddTask(task);
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
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        ref={inputRef}
        value={task}
        onChangeText={(text) => setTask(text)}
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: currentLabelColor }]}
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
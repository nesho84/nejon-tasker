import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Alert, Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";

interface Props {
  label: Label;
}

export default function AddTask({ label }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  // taskStore
  const createTask = useTaskStore((state) => state.createTask);

  // TextInput reference
  const textInputRef = useRef<TextInput>(null);

  // Local State
  const [taskText, setTaskText] = useState("");

  const handleAdd = async () => {
    if (taskText.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      // Create Task
      await createTask({ labelId: label.id, text: taskText });
      setTaskText("");
      textInputRef.current?.clear();
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.border }]}>
      <TextInput
        style={[styles.addTaskInput, { backgroundColor: theme.light, color: theme.text }]}
        ref={textInputRef}
        multiline
        maxLength={5500}
        scrollEnabled={true}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setTaskText(text)}
        placeholder={tr.forms.inputPlaceholder}
        placeholderTextColor={theme.placeholder}
        value={taskText}
      />
      <Pressable
        style={[styles.addButton, { backgroundColor: label.color }]}
        onPress={handleAdd}
      >
        <MaterialIcons name="add" size={38} color={theme.light} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 6,
    gap: 5,
  },
  addTaskInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButton: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    width: 47,
    height: 47,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
  },
});
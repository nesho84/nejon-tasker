import { useKeyboard } from "@/hooks/useKeyboard";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  label: Label;
}

export default function AddTask({ label }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();
  const { keyboardHeight } = useKeyboard();

  // taskStore actions
  const createTask = useTaskStore((state) => state.createTask);

  // Local State
  const [text, setText] = useState("");

  const textInputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    if (text.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      // Create Task
      createTask({ labelId: label.id, text: text });
      setText("");
      textInputRef.current?.clear();
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, {
      marginBottom: keyboardHeight,
      borderTopColor: theme.border
    }]}>
      <TextInput
        style={[styles.addTaskInput, { backgroundColor: theme.light, color: theme.text }]}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={tr.forms.inputPlaceholder}
        placeholderTextColor={theme.placeholder}
        ref={textInputRef}
        value={text}
        onChangeText={(text) => setText(text)}
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: label.color }]}
        onPress={handleAdd}
      >
        <MaterialIcons name="add" size={45} color={theme.light} />
      </TouchableOpacity>
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
    width: 47,
    height: 47,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
  },
});
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  labelId: string;
  currentLabelColor: string;
}

export default function AddTask({ labelId, currentLabelColor }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { keyboardHeight } = useKeyboard();

  const { createTask } = useTaskStore();

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
      createTask({ labelId: labelId, text: text });
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderTopWidth: 0.2,
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
    width: 45,
    height: 45,
    borderRadius: 4,
  },
});
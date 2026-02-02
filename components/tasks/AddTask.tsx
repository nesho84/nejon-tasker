import { useKeyboard } from "@/hooks/useKeyboard";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { Alert, Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  label: Label;
}

export default function AddTask({ label }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const insets = useSafeAreaInsets();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // taskStore
  const createTask = useTaskStore((state) => state.createTask);

  // TextInput reference
  const textInputRef = useRef<TextInput>(null);

  // Local State
  const [taskText, setTaskText] = useState("");

  // ------------------------------------------------------------
  // Handle adding new Task
  // ------------------------------------------------------------
  const handleAdd = async () => {
    if (taskText.trim().length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    // Create Task
    await createTask({ labelId: label.id, text: taskText });

    // Clear inputs
    setTaskText("");
    textInputRef.current?.clear();

    // Dismiss keyboard
    Keyboard.dismiss();
  };

  // ------------------------------------------------------------
  // Handle TextInput change
  // ------------------------------------------------------------
  const onChangeText = useCallback((text: string) => {
    setTaskText(text);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          marginBottom: isKeyboardVisible ? insets.bottom + keyboardHeight : 0,
        }
      ]}
    >
      {/* TextInput */}
      <TextInput
        style={[styles.textInput, { backgroundColor: theme.bgAlt, color: theme.text }]}
        ref={textInputRef}
        defaultValue=""
        multiline={true}
        maxLength={5500}
        scrollEnabled={true}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={tr.forms.inputPlaceholder}
        placeholderTextColor={theme.placeholder}
      />

      {/* Add Button */}
      <Pressable
        style={[styles.addButton, { backgroundColor: label.color }]}
        onPress={handleAdd}
      >
        <MaterialIcons name="add" size={38} color={theme.neutral} />
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

  textInput: {
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
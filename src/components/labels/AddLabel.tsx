import ColorPicker from "@/components/ColorPicker";
import { labelBgColors } from "@/constants/colors";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  handleAddModal: (value: boolean) => void;
}

export default function AddLabel({ handleAddModal }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { isKeyboardVisible } = useKeyboard();

  const { createLabel } = useLabelStore();

  const [title, setTitle] = useState("");
  const [color, setColor] = useState(labelBgColors[0]);

  const handleAdd = () => {
    if (title.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      // Create Label
      createLabel({ title, color });
      setTitle("");
      // Close Modal
      handleAddModal(false);
    }
  };

  return (
    <View style={[styles.container, { marginBottom: isKeyboardVisible ? 80 : 0 }]}>
      <Text style={[styles.title, { color: color }]}>
        {tr.forms.newLabel}
      </Text>
      <TextInput
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        value={title}
        onChangeText={(text) => setTitle(text)}
        style={[styles.textInput, { color: theme.textMuted, borderColor: theme.lightMuted }]}
        placeholder={tr.forms.inputPlaceholder}
        placeholderTextColor={theme.placeholder}
      />
      <ColorPicker labelColor={color} handleLabelColor={setColor} />
      <TouchableOpacity
        style={[styles.btnAdd, { backgroundColor: color }]}
        onPress={handleAdd}
      >
        <Text style={styles.btnAddText}>
          {tr.buttons.save}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    marginBottom: 16,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    minHeight: 50,
    backgroundColor: "#fff",
    fontSize: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DEE9F3",
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  btnAdd: {
    height: 50,
    justifyContent: "center",
    padding: 11,
    borderRadius: 5,
  },
  btnAddText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    color: "white",
  },
});
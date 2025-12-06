import ColorPicker from "@/components/ColorPicker";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  labelToEdit: Label;
  handleEditModal: (value: boolean) => void;
}

export default function EditLabel({ labelToEdit, handleEditModal }: Props) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { isKeyboardVisible } = useKeyboard();

  const { updateLabel } = useLabelStore();

  const [labelInput, setLabelInput] = useState(labelToEdit.title);
  const [labelColor, setLabelColor] = useState(labelToEdit.color);

  const handleEdit = () => {
    if (labelInput.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      // Update Label
      updateLabel(labelToEdit.id, {
        title: labelInput,
        color: labelColor,
      });
      setLabelInput("");
      // Close Modal
      handleEditModal(false);
    }
  };

  return (
    <View style={[styles.container, { marginBottom: isKeyboardVisible ? 80 : 0 }]}>
      <Text style={[styles.title, { color: labelColor }]}>
        {tr.forms.editLabel}
      </Text>

      <TextInput
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setLabelInput(text)}
        style={[styles.input, { color: theme.textMuted, borderColor: theme.lightMuted }]}
        placeholder={tr.forms.inputPlaceholder}
        placeholderTextColor={theme.placeholder}
        value={labelInput}
      />

      <ColorPicker labelColor={labelColor} handleLabelColor={setLabelColor} />

      <TouchableOpacity
        style={[styles.btnEdit, { backgroundColor: labelColor }]}
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
  },
  title: {
    marginBottom: 16,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    minHeight: 50,
    backgroundColor: "#fff",
    fontSize: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DEE9F3",
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  selectColor: {
    width: 30,
    height: 30,
    borderRadius: 5,
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
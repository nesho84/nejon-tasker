import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import ColorPicker from "@/components/ColorPicker";
import { labelBgColors } from "@/constants/colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { useKeyboard } from "@/hooks/useKeyboard";

export default function AddLabel({ handleAddLabel }) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const { isKeyboardVisible } = useKeyboard();

  const [label, setLabel] = useState("");
  const [labelColor, setLabelColor] = useState(labelBgColors[0]);

  const handleAdd = () => {
    if (label.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      handleAddLabel(label, labelColor);
      setLabel("");
    }
  };

  return (
    <View style={[styles.container, { marginBottom: isKeyboardVisible ? 80 : 0 }]}>
      <Text style={[styles.title, { color: labelColor }]}>
        {tr.forms.newLabel}
      </Text>

      <TextInput
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setLabel(text)}
        style={[styles.input, { color: theme.textMuted, borderColor: theme.lightMuted }]}
        placeholder={tr.forms.inputPlaceholder}
        placeholderTextColor={theme.placeholder}
      />

      <ColorPicker labelColor={labelColor} handleLabelColor={setLabelColor} />

      <TouchableOpacity
        style={[styles.btnAdd, { backgroundColor: labelColor }]}
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
  input: {
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
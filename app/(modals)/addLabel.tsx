import ColorPicker from "@/components/ColorPicker";
import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import { labelBgColors } from "@/constants/colors";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function AddLabel() {
  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);

  // Refs
  const modalSheetRef = useRef<ModalSheetRef>(null);

  // Local State
  const [labelTitle, setLabelTitle] = useState("");
  const [labelColor, setLabelColor] = useState(labelBgColors[0]);

  // ------------------------------------------------------------
  // Handle adding new label
  // ------------------------------------------------------------
  const handleAdd = async () => {
    if (labelTitle.trim().length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    // Create Label
    await useLabelStore.getState().createLabel({ title: labelTitle, color: labelColor });

    // Clear inputs
    setLabelTitle("");

    // Close ModalSheet
    modalSheetRef.current?.close();
  };

  // ------------------------------------------------------------
  // Handle TextInput change
  // ------------------------------------------------------------
  const onChangeTitle = useCallback((title: string) => {
    setLabelTitle(title);
  }, []);

  return (
    <ModalSheet ref={modalSheetRef} modalHeight={'50%'}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Title */}
        <Text style={[styles.title, { color: labelColor }]}>
          {tr.forms.newLabel}
        </Text>

        {/* TextInput */}
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.disabled, color: theme.text }]}
          defaultValue=""
          maxLength={100}
          autoCorrect={false}
          onChangeText={onChangeTitle}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
        />

        {/* Color Picker */}
        <ColorPicker labelColor={labelColor} onValueChange={setLabelColor} />

        {/* Add button */}
        <TouchableOpacity
          style={[styles.btnAdd, { backgroundColor: labelColor }]}
          onPress={handleAdd}
        >
          <Text style={[styles.btnAddText, { color: theme.neutral }]}>{tr.buttons.save}</Text>
        </TouchableOpacity>

      </ScrollView>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 8,
    gap: 14,
  },

  title: {
    fontSize: 29,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },

  textInput: {
    minHeight: 50,
    fontSize: 20,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
});
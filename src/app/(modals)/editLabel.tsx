import ColorPicker from "@/components/ColorPicker";
import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditLabel() {
  // Get labelId from route params
  const { labelId } = useLocalSearchParams();

  // Stores
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);
  const labels = useLabelStore((state) => state.labels);
  const label = labels.find((l) => l.id === labelId);

  // Refs
  const modalSheetRef = useRef<ModalSheetRef>(null);

  // Local State
  const [labelTitle, setLabelTitle] = useState(label?.title || "");
  const [labelColor, setLabelColor] = useState(label?.color || "");

  // ------------------------------------------------------------
  // Update state when label prop changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (label) {
      setLabelTitle(label.title);
      setLabelColor(label.color);
    }
  }, [label]);

  // ------------------------------------------------------------
  // Handle Label update
  // ------------------------------------------------------------
  const handleUpdate = async () => {
    if (!label) return;

    // Validate input
    if (labelTitle.trim().length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    // Update Label
    await useLabelStore.getState().updateLabel(label.id, {
      title: labelTitle,
      color: labelColor,
    });

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
    <ModalSheet style={{ backgroundColor: theme.bg2 }} ref={modalSheetRef} modalHeight={'52%'}>

      <View style={styles.container}>
        {/* Title */}
        <Text style={[styles.title, { color: labelColor }]}>
          {tr.forms.editLabel}
        </Text>

        {/* TextInput */}
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.disabled, color: theme.text }]}
          defaultValue={labelTitle}
          maxLength={100}
          autoCorrect={false}
          onChangeText={onChangeTitle}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
        />

        {/* Color Picker */}
        <ColorPicker labelColor={labelColor} onValueChange={setLabelColor} />

        {/* Edit button */}
        <TouchableOpacity
          style={[styles.btnEdit, { backgroundColor: labelColor }]}
          onPress={handleUpdate}
        >
          <Text style={[styles.btnEditText, { color: theme.neutral }]}>{tr.buttons.save}</Text>
        </TouchableOpacity>
      </View>

    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
});
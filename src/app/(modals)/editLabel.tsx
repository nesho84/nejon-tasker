import ColorPicker from "@/components/ColorPicker";
import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const insets = useSafeAreaInsets();

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

  // Fixed Footer with Close/Today buttons
  const FixedFooter = () => {
    return (
      <>
        {/* Divider above footer */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={[styles.btnRow, { borderTopColor: theme.divider }]}>
          {/* Cancel button */}
          <TouchableOpacity
            style={[styles.btnCancel, { backgroundColor: theme.disabled, borderColor: theme.border }]}
            onPress={() => modalSheetRef.current?.close()}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnCancelText, { color: theme.text2 }]}>{tr.buttons.cancel}</Text>
          </TouchableOpacity>
          {/* Save Button */}
          <TouchableOpacity
            style={[styles.btnSave, { backgroundColor: labelColor }]}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnSaveText, { color: theme.neutral }]}>{tr.buttons.save}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // Main Content
  return (
    <ModalSheet
      ref={modalSheetRef}
      size={0.53}
      colors={{ sheetBackgroundColor: theme.bg2, handleColor: theme.handle, headerBarBorderColor: 'transparent' }}
      footer={<FixedFooter />}
    >
      <View style={styles.container}>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: labelColor }]}>
            {tr.forms.editLabel}
          </Text>
          <View style={[styles.accentDot, { backgroundColor: labelColor, shadowColor: labelColor }]} />
        </View>

        {/* Divider below title */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Text input */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>{tr.forms.label}</Text>
        <TextInput
          style={[styles.textInput, {
            backgroundColor: theme.shadow,
            color: theme.text2,
            borderColor: `${labelColor}30`,
          }]}
          defaultValue={labelTitle}
          maxLength={100}
          autoCorrect={false}
          onChangeText={onChangeTitle}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
        />

        {/* Color Picker */}
        <Text style={[styles.inputLabel, { color: theme.label }]}>{tr.forms.color}</Text>
        <ColorPicker labelColor={labelColor} onValueChange={setLabelColor} />

      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },

  divider: {
    height: 1.8,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.9,
  },
  textInput: {
    height: 48,
    maxHeight: 48,
    fontSize: 15,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  btnRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 14,
  },
  btnCancel: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnSave: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  btnSaveText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
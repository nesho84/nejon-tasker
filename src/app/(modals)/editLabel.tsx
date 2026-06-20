import ColorPicker from "@/components/ColorPicker";
import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
  const inputRef = useRef<TextInput>(null);

  // Local State
  const [labelTitle, setLabelTitle] = useState(label?.title || "");
  const [labelColor, setLabelColor] = useState(label?.color || "");
  const [hasText, setHasText] = useState((label?.title?.length ?? 0) > 0);

  // ------------------------------------------------------------
  // Update state when label prop changes
  // ------------------------------------------------------------
  // Sync editable fields when the label changes (intentional prop → state sync)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (label) {
      setLabelTitle(label.title);
      setLabelColor(label.color);
    }
  }, [label]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  const onChangeTitle = (title: string) => setLabelTitle(title);

  // Fixed footer with Cancel/Save buttons — a plain element, not a component
  const fixedFooter = (
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

  // Main Content
  return (
    <ModalSheet
      ref={modalSheetRef}
      size={0.53}
      colors={{ sheetBackgroundColor: theme.bg2, handleColor: theme.handle, headerBarBorderColor: 'transparent' }}
      footer={fixedFooter}
    >
      <View style={styles.container}>

        {/* Bail out on a missing/stale label (e.g. it was deleted while this modal was
            open) — keep the sheet itself mounted so Cancel/drag-to-dismiss still work. */}
        {label && (
          <>
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
            <View style={{ position: 'relative' }}>
              <TextInput
                ref={inputRef}
                style={[styles.textInput, {
                  backgroundColor: theme.shadow,
                  color: theme.text2,
                  borderColor: `${labelColor}30`,
                }]}
                defaultValue={labelTitle}
                maxLength={100}
                autoCorrect={false}
                placeholder={tr.forms.inputPlaceholder}
                placeholderTextColor={theme.placeholder}
                onChangeText={(text) => {
                  setHasText(text.length > 0);
                  onChangeTitle(text);
                }}
              />
              {/* Clear Icon */}
              {hasText && (
                <Pressable
                  style={styles.clearIcon}
                  hitSlop={8}
                  onPress={() => {
                    inputRef.current?.clear();
                    setHasText(false);
                    onChangeTitle('');
                  }}
                >
                  <Ionicons name="close-circle" size={18} color={theme.placeholder} />
                </Pressable>
              )}
            </View>

            {/* Color Picker */}
            <Text style={[styles.inputLabel, { color: theme.label }]}>{tr.forms.color}</Text>
            <ColorPicker labelColor={labelColor} onValueChange={setLabelColor} />
          </>
        )}

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
  clearIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
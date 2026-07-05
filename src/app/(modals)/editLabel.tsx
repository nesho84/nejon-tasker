import ColorPicker from "@/components/ColorPicker";
import ModalSheet, { ModalSheetRef } from "@/components/ModalSheet";
import { globalStyles } from "@/constants/styles";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
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
      <View style={[globalStyles.modalDivider, { backgroundColor: theme.divider }]} />

      <View style={[globalStyles.btnRow, { borderTopColor: theme.divider }]}>
        {/* Cancel button */}
        <TouchableOpacity
          style={[globalStyles.btnCancel, { backgroundColor: theme.disabled, borderColor: theme.border }]}
          onPress={() => modalSheetRef.current?.close()}
          activeOpacity={0.7}
        >
          <Text style={[globalStyles.btnText, { color: theme.text2 }]}>{tr.buttons.cancel}</Text>
        </TouchableOpacity>
        {/* Save Button */}
        <TouchableOpacity
          style={[globalStyles.btnSave, { backgroundColor: labelColor }]}
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <Text style={[globalStyles.btnText, { color: theme.neutral }]}>{tr.buttons.save}</Text>
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
      <View style={globalStyles.modalContainer}>

        {/* Bail out on a missing/stale label (e.g. it was deleted while this modal was
            open) — keep the sheet itself mounted so Cancel/drag-to-dismiss still work. */}
        {label && (
          <>
            {/* Title row */}
            <View style={globalStyles.modalTitleRow}>
              <Text style={[globalStyles.modalTitle, { color: labelColor }]}>
                {tr.forms.editLabel}
              </Text>
              <View style={[globalStyles.accentDot, { backgroundColor: labelColor, shadowColor: labelColor }]} />
            </View>

            {/* Divider below title */}
            <View style={[globalStyles.modalDivider, { backgroundColor: theme.divider }]} />

            {/* Text input */}
            <Text style={[globalStyles.inputLabel, { color: theme.label }]}>{tr.forms.label}</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                ref={inputRef}
                style={[globalStyles.labelTextInput, {
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
                  style={globalStyles.clearIcon}
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
            <Text style={[globalStyles.inputLabel, { color: theme.label }]}>{tr.forms.color}</Text>
            <ColorPicker labelColor={labelColor} onValueChange={setLabelColor} />
          </>
        )}

      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({})

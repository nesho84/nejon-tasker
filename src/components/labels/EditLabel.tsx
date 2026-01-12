import ColorPicker from "@/components/ColorPicker";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  label: Label | null;
}

type Ref = BottomSheetModal;

const EditLabel = forwardRef<Ref, Props>((props, ref) => {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const { isKeyboardVisible } = useKeyboard();

  // labelStore
  const updateLabel = useLabelStore((state) => state.updateLabel);

  // Local State
  const [labelInput, setLabelInput] = useState(props.label?.title || "");
  const [labelColor, setLabelColor] = useState(props.label?.color || "#3b82f6");

  const { dismiss } = useBottomSheetModal();
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // Update state when label prop changes
  useEffect(() => {
    if (props.label) {
      setLabelInput(props.label.title);
      setLabelColor(props.label.color);
    }
  }, [props.label]);

  const handleEdit = async () => {
    if (!props.label) return;

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
      await updateLabel(props.label.id, {
        title: labelInput,
        color: labelColor,
      });
      setLabelInput("");
      // Close BottomSheetModal
      dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.lightMuted }}
      onDismiss={() => {
        setLabelInput(props.label?.title || "");
        setLabelColor(props.label?.color || "#3b82f6");
      }}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: insets.bottom + 20 + (isKeyboardVisible ? 80 : 0) }]}>
        <Text style={[styles.title, { color: labelColor }]}>
          {tr.forms.editLabel}
        </Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(text) => setLabelInput(text)}
          style={[styles.textInput, { color: theme.textMuted, borderColor: theme.lightMuted }]}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
          value={labelInput}
        />

        <ColorPicker labelColor={labelColor} handleLabelColor={setLabelColor} />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.btnEdit, { backgroundColor: labelColor }]}
          onPress={handleEdit}
        >
          <Text style={styles.btnEditText}>
            {tr.buttons.save}
          </Text>
        </TouchableOpacity>

      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    // width: "100%",
    padding: 10,
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

export default EditLabel;
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
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, BackHandler, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  label: Label | null;
  onDismiss: () => void;
}

type Ref = BottomSheetModal;

const EditLabel = forwardRef<Ref, Props>((props, ref) => {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const insets = useSafeAreaInsets();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // labelStore
  const updateLabel = useLabelStore((state) => state.updateLabel);

  // Local State
  const [labelTitle, setLabelTitle] = useState(props.label?.title || "");
  const [labelColor, setLabelColor] = useState(props.label?.color || "");

  // ------------------------------------------------------------
  // Update state when label prop changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (props.label) {
      setLabelTitle(props.label.title);
      setLabelColor(props.label.color);
    }

  }, [props.label]);

  // ------------------------------------------------------------
  // Handle Label update
  // ------------------------------------------------------------
  const handleUpdate = async () => {
    if (!props.label) return;

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
    await updateLabel(props.label.id, {
      title: labelTitle,
      color: labelColor,
    });

    // Clear inputs
    setLabelTitle("");

    // Close BottomSheetModal
    dismiss();
  };

  // ------------------------------------------------------------
  // Handle TextInput change
  // ------------------------------------------------------------
  const onChangeTitle = useCallback((title: string) => {
    setLabelTitle(title);
  }, []);

  // ------------------------------------------------------------
  // BottomSheetModal setup
  // ------------------------------------------------------------
  const { dismiss } = useBottomSheetModal();
  const snapPoints = useMemo(() => ['50%', '75%', '90%'], []);
  const isOpenRef = useRef(false);

  // Android back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpenRef.current && ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [ref]);

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

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.placeholder }}
      onChange={(index) => isOpenRef.current = index !== -1}
      onDismiss={props.onDismiss}
    >
      <BottomSheetView
        style={[
          styles.container,
          { paddingBottom: isKeyboardVisible ? insets.bottom + keyboardHeight : insets.bottom + 16 }
        ]}
      >
        {/* Title */}
        <Text style={[styles.title, { color: labelColor }]}>
          {tr.forms.editLabel}
        </Text>

        {/* TextInput */}
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.disabled, color: theme.text }]}
          defaultValue={labelTitle}
          maxLength={100}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeTitle}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
        />

        {/* Color Picker */}
        <ColorPicker labelColor={labelColor} onValueChange={setLabelColor} />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.btnEdit, { backgroundColor: labelColor }]}
          onPress={handleUpdate}
        >
          <Text style={styles.btnEditText}>{tr.buttons.save}</Text>
        </TouchableOpacity>

      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 14,
  },

  title: {
    fontSize: 29,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },

  textInput: {
    flex: 1,
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
    color: "white",
  },
});

export default EditLabel;
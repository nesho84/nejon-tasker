import ColorPicker from "@/components/ColorPicker";
import { labelBgColors } from "@/constants/colors";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, BackHandler, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props { }

type Ref = BottomSheetModal;

const AddLabel = forwardRef<Ref, Props>((props, ref) => {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const insets = useSafeAreaInsets();
  const { isKeyboardVisible } = useKeyboard();

  // labelStore
  const createLabel = useLabelStore((state) => state.createLabel);

  // Local State
  const [labelTitle, setLabelTitle] = useState("");
  const [labelColor, setLabelColor] = useState(labelBgColors[0]);

  // ------------------------------------------------------------
  // Handle adding new label
  // ------------------------------------------------------------
  const handleAdd = async () => {
    if (labelTitle.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      // Create Label
      await createLabel({ title: labelTitle, color: labelColor });
      setLabelTitle("");
      // Close BottomSheetModal
      dismiss();
    }
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
      handleIndicatorStyle={{ backgroundColor: theme.lightMuted }}
      onChange={(index) => isOpenRef.current = index !== -1}
      onDismiss={() => {
        setLabelTitle("");
        setLabelColor(labelBgColors[0]);
      }}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: insets.bottom + 20 + (isKeyboardVisible ? 80 : 0) }]}>
        {/* Title */}
        <Text style={[styles.title, { color: labelColor }]}>
          {tr.forms.newLabel}
        </Text>

        {/* TextInput */}
        <TextInput
          style={[styles.textInput, { color: theme.textMuted }]}
          defaultValue=""
          maxLength={100}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeTitle}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
        />

        {/* Color Picker */}
        <ColorPicker labelColor={labelColor} onChangeColor={setLabelColor} />

        {/* Add button */}
        <TouchableOpacity
          style={[styles.btnAdd, { backgroundColor: labelColor }]}
          onPress={handleAdd}
        >
          <Text style={styles.btnAddText}>{tr.buttons.save}</Text>
        </TouchableOpacity>

      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    marginBottom: 16,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    flex: 1,
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

export default AddLabel;
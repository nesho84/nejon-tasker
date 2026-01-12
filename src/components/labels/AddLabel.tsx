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
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
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
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(labelBgColors[0]);

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

  const handleAdd = async () => {
    if (title.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ text: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      // Create Label
      await createLabel({ title: title, color });
      setTitle("");
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
        setTitle("");
        setColor(labelBgColors[0]);
      }}
    >
      <BottomSheetView
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 20 + (isKeyboardVisible ? 80 : 0) }
        ]}
      >
        <Text style={[styles.title, { color: color }]}>
          {tr.forms.newLabel}
        </Text>

        <TextInput
          maxLength={100}
          autoCapitalize="none"
          autoCorrect={false}
          value={title}
          onChangeText={(text) => setTitle(text)}
          style={[styles.textInput, { color: theme.textMuted, borderColor: theme.lightMuted }]}
          placeholder={tr.forms.inputPlaceholder}
          placeholderTextColor={theme.placeholder}
        />

        <ColorPicker labelColor={color} handleLabelColor={setColor} />

        <TouchableOpacity
          style={[styles.btnAdd, { backgroundColor: color }]}
          onPress={handleAdd}
        >
          <Text style={styles.btnAddText}>
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
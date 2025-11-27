import { useThemeStore } from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Keyboard, Modal, Pressable, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  inputRef?: React.RefObject<TextInput>;
  children?: ReactNode;
}

export default function AppModal({ modalVisible, setModalVisible, inputRef, children }: Props) {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
      onShow={() => inputRef?.current?.focus()}
    >

      {/* Dimmed background */}
      <Pressable
        onPress={() => setModalVisible(false)}
        style={styles.backdrop}
      />

      {/* Bottom Sheet */}
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>

        {/* Drag Handle */}
        <View style={styles.handle} />

        {/* Close Icon */}
        <Pressable style={styles.closeIcon} onPress={() => setModalVisible(false)}>
          <MaterialIcons
            name="close"
            size={28}
            color={theme.text}
          />
        </Pressable>

        {/* Content */}
        <Pressable onPress={Keyboard.dismiss} style={[styles.content, { paddingBottom: insets.bottom }]}>

          {children}

        </Pressable>
      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingTop: 12,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: "rgba(150,150,150,0.4)",
    marginBottom: 12,
  },

  closeIcon: {
    position: "absolute",
    top: 12,
    right: 18,
    opacity: 0.7,
  },

  content: {
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 6,
  },
});

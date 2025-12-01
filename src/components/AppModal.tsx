import { useThemeStore } from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
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
  const screenHeight = Dimensions.get("window").height

  const close = () => setModalVisible(false);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={close}
      onShow={() => inputRef?.current?.focus()}
    >

      {/* Dimmed background */}
      <Pressable style={styles.backdrop} onPress={close} />

      {/* Modal Container */}
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Drag Handle */}
        <View style={styles.handle} />

        {/* Close Icon */}
        <Pressable
          style={({ pressed }) => [styles.closeIcon, { opacity: pressed ? 0.6 : 1 }]}
          onPress={close}
        >
          <MaterialIcons name="close" size={28} color={theme.text} />
        </Pressable>

        {/* Content (children) */}
        <View style={{ marginTop: insets.top, marginBottom: insets.bottom + 24 }}>
          {children}
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.30)",
  },

  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: "rgba(150,150,150,0.4)",
  },

  closeIcon: {
    position: "absolute",
    right: 16,
    top: 10,
    opacity: 0.7,
  },
});

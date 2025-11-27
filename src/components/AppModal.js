import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { LIGHT } from "@/constants/colors";
import {
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function AppModal(props) {
  const { theme } = useContext(ThemeContext);

  return (
    <Modal
      onShow={() => (props.inputRef ? props.inputRef.current.focus() : {})}
      onRequestClose={() => props.setModalVisible(false)}
      animationType="slide"
      visible={props.modalVisible}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor:
                theme.themes.appModal.modalContainer[theme.current],
            },
          ]}
        >
          <MaterialIcons
            style={styles.closeIcon}
            name="close"
            size={35}
            color={LIGHT.light}
            onPress={() => props.setModalVisible(false)}
          />
          {props.children}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "red",
  },
  closeIcon: {
    position: "absolute",
    top: 36,
    right: 26,
    zIndex: 2
  },
});

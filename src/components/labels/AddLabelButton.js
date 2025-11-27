import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";

export default function AddLabelButton(props) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.overlayLight }]}
        onPress={() => props.setModalVisible(true)}
      >
        <MaterialIcons name="add-circle" size={36} color={theme.inverse} style={{ paddingVertical: 3 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 5,
    borderTopColor: "#fff",
    borderTopWidth: 1,
    elevation: 10,
  },
  addButton: {
    width: "70%",
    alignItems: "center",
    borderRadius: 20,
  },
});

import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";

export default function AddTask({ ...props }) {
  const { theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const [task, setTask] = useState("");

  const handleAdd = () => {
    if (task.length < 1) {
      Alert.alert(
        tr.alerts.requiredField.title,
        tr.alerts.requiredField.message,
        [{ task: "OK" }],
        { cancelable: false }
      );
      return false;
    } else {
      props.handleAddTask(task);
      setTask("");
    }
  };

  return (
    <View style={styles.addTaskContainer}>
      <TextInput
        style={[styles.addTaskInput, { backgroundColor: theme.light, color: theme.dark }]}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={props.placeholder}
        ref={props.inputRef}
        onChangeText={(text) => setTask(text)}
      />
      <TouchableOpacity
        style={{ backgroundColor: props.currentLabelColor }}
        onPress={handleAdd}
      >
        <MaterialIcons name="add" size={45} color={theme.light} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addTaskContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: "#616161",
    borderTopWidth: 0.2,
    padding: 5,
  },
  addTaskInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    marginRight: 3.5,
  },
  addTaskButton: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});

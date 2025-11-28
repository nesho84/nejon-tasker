import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Alert, Share } from "react-native";
import Hyperlink from 'react-native-hyperlink'
import Checkbox from "expo-checkbox";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import TasksDivider from "@/components/tasks/TasksDivider";
import AppNoItems from "@/components/AppNoItems";
import moment from "moment";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";

export default function TasksList(props) {
  const { mode, theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const lastUnchecked = props.unCheckedTasks[props.unCheckedTasks.length - 1];
  const lastChecked = props.checkedTasks[props.checkedTasks.length - 1];

  const shareTask = (text) => {
    Share.share({
      message: text.toString(),
    })
      //after successful share return result
      .then((result) => console.log())
      .catch((err) => console.log(err))
  };

  // Single Task template
  const RenderTask = ({ item, index, drag, isActive }) => {
    // Task Reminder active logic
    const itemDateTime = item.reminder?.dateTime ?? null;
    const hasActiveReminder = () => {
      const currentDateTime = new Date();
      const reminderDateTime = new Date(itemDateTime);
      const timeDifferenceInSeconds = Math.max(0, (reminderDateTime - currentDateTime) / 1000);
      if (itemDateTime && timeDifferenceInSeconds > 0) {
        return true;
      } else {
        return false;
      }
    }

    return (
      <TouchableOpacity
        onPress={() => props.handleEditModal(item)}
        onLongPress={drag}
        style={[
          styles.tasksListContainer,
          {
            backgroundColor: item.checked ? theme.light : theme.backgroundAlt,
            borderColor: item.checked ? theme.borderLight : theme.border,
            borderWidth: 1,
          },
          isActive && { backgroundColor: theme.muted },
        ]}
      >

        {/* Top Section (unchecked items) */}
        <View style={styles.tasksListContainerTop}>
          {/* -----Task checkbox----- */}
          <View style={styles.checkboxAndTitleContainer}>
            <Checkbox
              color={item.checked ? theme.shadow : theme.darkGrey}
              value={item.checked}
              onValueChange={(newValue) =>
                props.handleCheckbox(newValue, item.key)
              }
            />
          </View>

          {/* -----Task text----- */}
          <View style={styles.itemText}>
            <Hyperlink linkDefault={true} linkStyle={{ color: theme.link }}>
              <Text
                style={[
                  {
                    textDecorationLine: item.checked ? "line-through" : "none",
                    fontSize: 15,
                  },
                  mode === "light" ? {
                    color: item.checked
                      ? theme.checkedItemText
                      : theme.text,
                  } : {
                    color: item.checked
                      ? theme.checkedItemTextDark
                      : theme.text,
                  },
                ]}
              >
                {item.name}
              </Text>
            </Hyperlink>
          </View>

          {/* -----Delete icon----- */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                tr.alerts.deleteTask.title,
                tr.alerts.deleteTask.message,
                [
                  {
                    text: tr.buttons.yes,
                    onPress: () => props.handleDeleteTask(item.key),
                  },
                  {
                    text: tr.buttons.no,
                  },
                ],
                { cancelable: false }
              )
            }
          >
            <Ionicons name="close" size={24} color={theme.muted} style={{ marginRight: 3 }} />
          </TouchableOpacity>
        </View>

        {/* Bottom Section (checked items) */}
        <View style={[styles.tasksListContainerBottom, { backgroundColor: theme.shadow }]}>
          {/* -----Reminder icon----- */}
          <Ionicons
            name={hasActiveReminder() ? "notifications" : "notifications-off"}
            color={hasActiveReminder() ? theme.success : theme.muted}
            size={16}
          />

          {/* Reminder dateTime */}
          {hasActiveReminder() && (
            <Text
              style={{
                marginLeft: -80,
                fontSize: 11,
                color: hasActiveReminder() ? theme.success : theme.muted
              }}
            >
              {moment(item.reminder.dateTime).format('DD.MM.YYYY HH:mm')}
            </Text>
          )}

          {/* -----Share icon----- */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => shareTask(item.name)}>
            <Ionicons name="share-social" size={16} color={theme.muted} style={{}} />
          </TouchableOpacity>

          {/* -----Task dateTime----- */}
          <Text style={[{ color: theme.muted, fontSize: 11 }]}>
            {item.date}
          </Text>
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* -----Unchecked Tasks List START----- */}
      {props.unCheckedTasks.length > 0 ? (
        <TouchableWithoutFeedback>
          <View style={{ flex: 2 }}>
            <DraggableFlatList
              data={props.unCheckedTasks}
              renderItem={({ item, index, drag, isActive }) => (
                <View style={{ marginBottom: lastUnchecked === item ? 3 : 0 }}>
                  <RenderTask
                    item={item}
                    index={index}
                    drag={drag}
                    isActive={isActive}
                  />
                </View>
              )}
              keyExtractor={(item, index) => `draggable-item-${item.key}`}
              onDragEnd={({ data }) => props.handleOrderTasks(data)}
            />
          </View>
        </TouchableWithoutFeedback>
      ) : (
        // -----No Tasks to show-----
        <AppNoItems />
      )}
      {/* -----Unchecked Tasks List END----- */}

      {/* -----Checked Tasks List START----- */}
      {props.checkedTasks.length > 0 && (
        <>
          {/* -----Tasks Divider----- */}
          <TasksDivider checkedTasks={props.checkedTasks.length} />

          <TouchableWithoutFeedback>
            <View style={{ flex: 1 }}>
              <DraggableFlatList
                data={props.checkedTasks}
                renderItem={({ item, index, drag, isActive }) => (
                  <View style={{ marginBottom: lastChecked === item ? 6 : 0 }}>
                    <RenderTask
                      item={item}
                      index={index}
                      drag={drag}
                      isActive={isActive}
                    />
                  </View>
                )}
                keyExtractor={(item, index) => `draggable-item-${item.key}`}
                onDragEnd={({ data }) => props.handleOrderTasks(data)}
              />
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
      {/* -----Checked Tasks List END----- */}

    </>
  );
}

const styles = StyleSheet.create({
  tasksListContainer: {
    borderRadius: 5,
    marginTop: 5,
    marginHorizontal: 5
  },
  tasksListContainerTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  tasksListContainerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  itemText: {
    width: "100%",
    marginLeft: 10,
    marginRight: 8,
    flexShrink: 1,
  },
  deleteTaskIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2
  },
  checkboxAndTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    flexShrink: 1,
  },
});
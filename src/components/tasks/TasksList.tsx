import AppNoItems from "@/components/AppNoItems";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import moment from "moment";
import { Alert, Share, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import Hyperlink from 'react-native-hyperlink';

interface Reminder {
  dateTime: string | null;
  notificationId?: string | null;
}

interface Task {
  key: string;
  name: string;
  checked: boolean;
  date: string;
  reminder?: Reminder | null;
}

interface Props {
  unCheckedTasks: Task[];
  checkedTasks: Task[];
  handleEditModal: (item: Task) => void;
  handleCheckbox: (newValue: boolean, key: string) => void;
  handleDeleteTask: (key: string) => void;
  handleOrderTasks: (data: Task[]) => void;
}

export default function TasksList({
  unCheckedTasks,
  checkedTasks,
  handleEditModal,
  handleCheckbox,
  handleDeleteTask,
  handleOrderTasks
}: Props) {
  const { mode, theme } = useThemeStore();
  const { tr } = useLanguageStore();

  const lastUnchecked = unCheckedTasks[unCheckedTasks.length - 1];
  const lastChecked = checkedTasks[checkedTasks.length - 1];

  const shareTask = (text: string) => {
    Share.share({
      message: text.toString(),
    })
      .then((result) => console.log())
      .catch((err) => console.log(err))
  };

  // Single Task template
  const RenderTask = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    // Task Reminder active logic
    const itemDateTime = item.reminder?.dateTime ?? null;
    const hasActiveReminder = (): boolean => {
      if (!itemDateTime) return false;

      const currentDateTime = new Date();
      const reminderDateTime = new Date(itemDateTime);
      const timeDifferenceInSeconds = Math.max(0, (reminderDateTime.getTime() - currentDateTime.getTime()) / 1000);
      return timeDifferenceInSeconds > 0;
    }

    return (
      <TouchableOpacity
        onPress={() => handleEditModal(item)}
        onLongPress={drag}
        style={[
          styles.tasksListContainer,
          {
            backgroundColor: item.checked ? theme.light : theme.backgroundAlt,
            borderColor: item.checked ? theme.faded : theme.border,
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
              color={item.checked ? theme.faded : theme.darkGrey}
              value={item.checked}
              onValueChange={(newValue) =>
                handleCheckbox(newValue, item.key)
              }
            />
          </View>

          {/* -----Task text----- */}
          <View style={styles.itemText}>
            <Hyperlink linkDefault={true} linkStyle={{ color: theme.link }}>
              <Text
                style={{
                  color: item.checked ? theme.muted : theme.text,
                  textDecorationLine: item.checked ? "line-through" : "none",
                  fontSize: 15,
                }}
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
                  { text: tr.buttons.yes, onPress: () => handleDeleteTask(item.key) },
                  { text: tr.buttons.no },
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
          {hasActiveReminder() && item.reminder?.dateTime && (
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
      {unCheckedTasks.length > 0 ? (
        <TouchableWithoutFeedback>
          <View style={{ flex: 2 }}>
            <DraggableFlatList
              data={unCheckedTasks}
              renderItem={(params) => (
                <View style={{ marginBottom: lastUnchecked === params.item ? 3 : 0 }}>
                  <RenderTask {...params} />
                </View>
              )}
              keyExtractor={(item) => `draggable-item-${item.key}`}
              onDragEnd={({ data }) => handleOrderTasks(data)}
            />
          </View>
        </TouchableWithoutFeedback>
      ) : (
        // -----No Tasks to show-----
        <AppNoItems />
      )}
      {/* -----Unchecked Tasks List END----- */}

      {/* -----Checked Tasks List START----- */}
      {checkedTasks.length > 0 && (
        <>
          {/* -----Tasks Divider----- */}
          <View style={styles.checkedTasksDividerContainer}>
            <View style={[styles.listDivider, { borderColor: theme.border }]} />
            <Text style={[styles.listDividerText, { color: theme.muted }]}>
              {`${checkedTasks.length} ${tr.labels.checkedItems}`}
            </Text>
          </View>

          <TouchableWithoutFeedback>
            <View style={{ flex: 1 }}>
              <DraggableFlatList
                data={checkedTasks}
                renderItem={(params) => (
                  <View style={{ marginBottom: lastChecked === params.item ? 6 : 0 }}>
                    <RenderTask {...params} />
                  </View>
                )}
                keyExtractor={(item) => `draggable-item-${item.key}`}
                onDragEnd={({ data }) => handleOrderTasks(data)}
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
    // alignSelf: "baseline",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    flexShrink: 1,
  },
  checkedTasksDividerContainer: {
    width: "100%",
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  listDivider: {
    width: "100%",
    borderWidth: 1,
    marginBottom: 2,
  },
  listDividerText: {
    fontSize: 13,
  },
});
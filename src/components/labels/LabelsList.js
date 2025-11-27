import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { LIGHT } from "@/constants/colors";
import AppNoItems from "../AppNoItems";

export default function LabelsList({
  labels,
  orderLabels,
  handleEditModal,
  lang,
}) {
  const lastItem = labels[labels.length - 1];

  // Render Single Label template
  const RenderLabel = ({ item, index, drag, isActive }) => {
    const checkedTasksCount = item.tasks.filter((task) => task.checked).length;
    const unCheckedTasksCount = item.tasks.length - checkedTasksCount;

    // Active task Reminders count
    const taskActiveRemindersCount = item.tasks.reduce((count, task) => {
      if (task.reminder && task.reminder.dateTime !== null && task.reminder.notificationId !== null) {
        const currentDateTime = new Date();
        const reminderDateTime = new Date(task.reminder.dateTime);
        const timeDifferenceInSeconds = Math.max(0, (reminderDateTime - currentDateTime) / 1000);
        if (timeDifferenceInSeconds > 0) {
          return count + 1;
        }
      }
      return count;
    }, 0);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onPress={() => router.push(`/label-details?labelKey=${item.key}`)}
          onLongPress={drag}
        >
          <View
            style={[
              styles.labelBox,
              { backgroundColor: isActive ? LIGHT.muted : item.color },
              { marginBottom: lastItem === item ? 6 : 0 },
            ]}
          >
            {/* -----Item title and icons Container----- */}
            <View style={styles.labelBoxHeaderContainer}>
              {/* Icon before Label title */}
              <MaterialCommunityIcons
                style={{ marginTop: 2, marginRight: 6 }}
                name="label-outline"
                size={26}
                color={LIGHT.light}
              />

              {/* Label title */}
              <Text style={styles.labelBoxTitle}>
                {item.title}
              </Text>

              {/* EditLabel Icon */}
              <TouchableOpacity onPress={() => handleEditModal(item)}>
                <MaterialCommunityIcons
                  style={{ marginTop: 2 }}
                  name="playlist-edit"
                  size={31}
                  color={LIGHT.light}
                />
              </TouchableOpacity>
            </View>

            {/* Tasks summary*/}
            <View style={styles.summaryContainer}>
              {/* Remaining count */}
              <View style={{ alignItems: "center" }}>
                <Text style={styles.count}>{unCheckedTasksCount}</Text>
                <Text style={styles.subtitle}>
                  {lang.languages.labels.remaining[lang.current]}
                </Text>
              </View>

              {/* Reminders count */}
              <View style={{ alignItems: "center" }}>
                <Text style={styles.count}>{taskActiveRemindersCount}</Text>
                <Text style={styles.subtitle}>
                  {lang.languages.labels.reminders[lang.current]}
                </Text>
              </View>

              {/* Completed count */}
              <View style={{ alignItems: "center" }}>
                <Text style={styles.count}>{checkedTasksCount}</Text>
                <Text style={styles.subtitle}>
                  {lang.languages.labels.completed[lang.current]}
                </Text>
              </View>
            </View>

          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      {/* -----Label List START----- */}
      {labels && labels.length > 0 ? (
        // <Text>Labels List Component Placeholder</Text>
        <DraggableFlatList
          containerStyle={styles.draggableFlatListContainer}
          data={labels}
          renderItem={({ item, index, drag, isActive }) => (
            <RenderLabel
              item={item}
              index={index}
              drag={drag}
              isActive={isActive}
            />
          )}
          keyExtractor={(item, index) => `draggable-item-${item.key}`}
          onDragEnd={({ data }) => orderLabels(data)}
        />
      ) : (
        <AppNoItems />
      )}
      {/* -----Label List END----- */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  draggableFlatListContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  labelBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    borderRadius: 5,
    borderColor: LIGHT.lightMuted,
    borderWidth: 0.3,
    elevation: 2,
    marginTop: 6,
  },
  labelBoxHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingHorizontal: 10,
    paddingBottom: 2,
    marginBottom: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  summaryContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  labelBoxTitle: {
    flexShrink: 1,
    paddingVertical: 5,
    color: LIGHT.light,
    fontSize: 21,
    fontWeight: "bold",
    marginRight: "auto"
  },
  count: {
    fontSize: 24,
    color: LIGHT.light,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: LIGHT.light,
  },
});

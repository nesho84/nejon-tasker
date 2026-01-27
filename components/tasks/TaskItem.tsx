import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates, isReminderActive } from "@/utils/dates";
import { shareText } from "@/utils/utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Hyperlink from 'react-native-hyperlink';

interface Props {
    task: Task;
    index?: number;
    isActive?: boolean | undefined;
    // Top left actions
    checkAction?: boolean;
    // Top right actions
    favoriteAction?: boolean;
    softDeleteAction?: boolean;
    hardDeleteAction?: boolean;
    restoreAction?: boolean;
    cancelReminderAction?: boolean;
    // Bottom actions
    shareAction?: boolean;
}

export default function TaskItem({
    task,
    index,
    isActive,
    checkAction,
    favoriteAction,
    softDeleteAction,
    hardDeleteAction,
    restoreAction,
    cancelReminderAction,
    shareAction
}: Props) {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    // taskStore
    const updateTask = useTaskStore((state) => state.updateTask);
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const toggleFavoriteTask = useTaskStore((state) => state.toggleFavoriteTask);
    const softDeleteTask = useTaskStore((state) => state.softDeleteTask);
    const hardDeleteTask = useTaskStore((state) => state.hardDeleteTask);
    const restoreTask = useTaskStore((state) => state.restoreTask);

    // Notifications hook
    const { notificationsEnabled, cancelScheduledNotification } = useNotifications();

    // Check if reminder is active (has reminderId AND datetime is in the future)
    const hasActiveReminder = isReminderActive(task.reminderDateTime, task.reminderId);

    // ------------------------------------------------------------
    // Toggle task checked/unchecked
    // ------------------------------------------------------------
    const handleToggleCheck = async (value: boolean, task: Task) => {
        // If checking a task with active reminder, cancel notification
        if (value === true && task?.reminderId) {
            await cancelScheduledNotification(task.reminderId);
            // Clear reminder data when checking the task
            await updateTask(task.id, {
                checked: true,
                reminderDateTime: null,
                reminderId: null,
            });
        } else {
            await toggleTask(task.id);
        }
    };

    // ------------------------------------------------------------
    // Toggle task favorite
    // ------------------------------------------------------------
    const handleToggleFavorite = async (id: string) => {
        await toggleFavoriteTask(id);
    };

    // ------------------------------------------------------------
    // Restore task
    // ------------------------------------------------------------
    const handleRestore = async (id: string) => {
        await restoreTask(id);
    };

    // ------------------------------------------------------------
    // Cancel task notification/reminder
    // ------------------------------------------------------------
    const handleCancelReminder = async (task: Task) => {
        Alert.alert(
            tr.alerts.cancelReminder.title,
            tr.alerts.cancelReminder.message,
            [
                {
                    text: tr.buttons.yes,
                    onPress: async () => {
                        // Cancel the existing notification
                        if (task?.reminderId) {
                            await cancelScheduledNotification(task.reminderId);
                            // Clear reminder data when cancelling reminder
                            await updateTask(task.id, {
                                reminderDateTime: null,
                                reminderId: null
                            });
                        }
                    },
                },
                {
                    text: tr.buttons.cancel,
                },
            ],
            { cancelable: false }
        );
    };

    // ------------------------------------------------------------
    // Soft delete task
    // ------------------------------------------------------------
    const handleSoftDelete = async (task: Task) => {
        Alert.alert(
            tr.alerts.deleteTask.title,
            tr.alerts.deleteTask.message1,
            [
                {
                    text: tr.buttons.yes,
                    onPress: async () => {
                        // Cancel the existing notification
                        if (task?.reminderId) {
                            await cancelScheduledNotification(task.reminderId);
                            // Clear reminder data when deleting the task
                            await updateTask(task.id, {
                                reminderDateTime: null,
                                reminderId: null,
                            });
                        }
                        await softDeleteTask(task.id);
                    },
                },
                {
                    text: tr.buttons.cancel,
                },
            ],
            { cancelable: false }
        );
    };

    // ------------------------------------------------------------
    // Hard delete task
    // ------------------------------------------------------------
    const handleHardDelete = async (task: Task) => {
        Alert.alert(
            tr.alerts.deleteTask.title,
            tr.alerts.deleteTask.message2,
            [
                {
                    text: tr.buttons.yes,
                    onPress: async () => {
                        // Cancel the existing notification
                        if (task?.reminderId) {
                            await cancelScheduledNotification(task.reminderId);
                        }
                        await hardDeleteTask(task.id);
                    },
                },
                {
                    text: tr.buttons.cancel,
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: task.checked ? theme.disabled : theme.bgAlt,
                    borderColor: theme.border,
                    opacity: (isActive ? 0.5 : 1) && (task.checked ? 0.3 : 1),
                    borderWidth: isActive ? 3 : 1,
                },
            ]}
        >

            {/* ----- Top Section ----- */}
            <View style={styles.top}>
                {/* Task checkbox */}
                {checkAction && (
                    <View style={styles.checkBoxContainer}>
                        <Checkbox
                            color={task.checked ? theme.border : theme.secondary}
                            value={!!task.checked}
                            onValueChange={(value) => handleToggleCheck(value, task)}
                        />
                    </View>
                )}

                {/* Task Text */}
                <View style={styles.taskTextContainer}>
                    <Hyperlink linkDefault={true} linkStyle={{ color: theme.primary }}>
                        <Text
                            style={[styles.teaskText, {
                                color: task.checked ? theme.muted : theme.text,
                                textDecorationLine: !!task.checked ? "line-through" : "none",
                            }]}
                        >
                            {task.text}
                        </Text>
                    </Hyperlink>
                </View>

                {/* Top right actions */}
                <View style={styles.topRight}>
                    {/* Favorite icon */}
                    {favoriteAction && (
                        <TouchableOpacity
                            onPress={() => handleToggleFavorite(task.id)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={task.isFavorite ? "star" : "star-outline"}
                                color={theme.muted}
                                size={23}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Restore icon */}
                    {restoreAction && (
                        <TouchableOpacity
                            onPress={() => handleRestore(task.id)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="backup-restore"
                                color={theme.success}
                                size={22}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Reminder Cancel icon */}
                    {cancelReminderAction && (
                        <TouchableOpacity
                            onPress={() => handleCancelReminder(task)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="bell-remove-outline"
                                color={theme.muted}
                                size={22}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Delete icon */}
                    {softDeleteAction && (
                        <TouchableOpacity
                            onPress={() => handleSoftDelete(task)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="close"
                                color={theme.muted}
                                size={24}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Hard Delete icon */}
                    {hardDeleteAction && (
                        <TouchableOpacity
                            onPress={() => handleHardDelete(task)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="close"
                                color={theme.danger}
                                size={24}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ----- Bottom Section ----- */}
            <View style={[styles.bottom, { backgroundColor: theme.shadow }]}>
                {/* Reminder */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {/* Reminder icon */}
                    {task.reminderId && task.reminderDateTime && (
                        <MaterialCommunityIcons
                            name={(notificationsEnabled || hasActiveReminder) ? "bell" : "bell-off"}
                            color={hasActiveReminder ? theme.success : theme.muted}
                            size={16}
                        />
                    )}

                    {/* Reminder dateTime - show it even if passed, but with different styling */}
                    {task.reminderId && task.reminderDateTime && (
                        <Text
                            style={{
                                fontSize: 11,
                                color: hasActiveReminder ? theme.success : theme.muted,
                                textDecorationLine: hasActiveReminder ? 'none' : 'line-through'
                            }}
                        >
                            {dates.format(task.reminderDateTime)}
                        </Text>
                    )}
                </View>

                {/* Share icon */}
                {shareAction && (
                    <TouchableOpacity
                        onPress={() => shareText("My Task", task.text)}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="share-social"
                            color={theme.muted}
                            size={16}
                        />
                    </TouchableOpacity>
                )}

                {/* Task dateTime */}
                <Text style={[{ color: theme.muted, fontSize: 11 }]}>
                    {dates.format(task.updatedAt)}
                </Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 6,
        marginHorizontal: 6,
        borderRadius: 4,
        borderWidth: 1,
    },

    top: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
        gap: 8,
    },
    checkBoxContainer: {
        alignSelf: "flex-start",
        marginTop: 3,
        marginLeft: 3,
        flexShrink: 0,
    },
    taskTextContainer: {
        width: "100%",
        flexShrink: 1,
        marginLeft: 2,
    },
    teaskText: {
        fontSize: 15,
        lineHeight: 22,
    },
    topRight: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 0,
        gap: 12,
    },

    bottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
});
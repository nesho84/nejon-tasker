import { cancelScheduledNotification } from "@/services/notificationsService";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { getReminderStatus, shareText } from "@/utils/system";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { Checkbox } from "expo-checkbox";
import * as Haptics from "expo-haptics";
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);

    // taskStore
    const updateTask = useTaskStore((state) => state.updateTask);
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const toggleFavoriteTask = useTaskStore((state) => state.toggleFavoriteTask);
    const softDeleteTask = useTaskStore((state) => state.softDeleteTask);
    const hardDeleteTask = useTaskStore((state) => state.hardDeleteTask);
    const restoreTask = useTaskStore((state) => state.restoreTask);

    // Notification permission — single source of truth lives in deviceSettingsStore
    const notificationsEnabled = useDeviceSettingsStore((state) => state.notificationPermission);

    // Reminder display state: 'active' (will fire), 'muted' (set but notifications off), 'past', 'none'
    const reminderStatus = getReminderStatus(task.reminderDateTime, task.reminderId, notificationsEnabled);
    const reminderColor = reminderStatus === 'active' ? theme.success
        : reminderStatus === 'muted'
            ? theme.danger : theme.muted;

    // ------------------------------------------------------------
    // Toggle task checked/unchecked
    // ------------------------------------------------------------
    const handleToggleCheck = async (value: boolean, task: Task) => {
        // Fire-and-forget so the toggle isn't delayed
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
                    style: 'destructive',
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
                    style: 'cancel',
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
                    style: 'destructive',
                    onPress: async () => {
                        // softDeleteTask cancels the reminder and clears it too
                        await softDeleteTask(task.id);
                    },
                },
                {
                    text: tr.buttons.cancel,
                    style: 'cancel',
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
                    style: 'destructive',
                    onPress: async () => {
                        // hardDeleteTask cancels the reminder before deleting
                        await hardDeleteTask(task.id);
                    },
                },
                {
                    text: tr.buttons.cancel,
                    style: 'cancel',
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: task.checked ? theme.disabled : theme.surface2,
                borderWidth: isActive ? 3 : 1,
                borderColor: theme.border,
                opacity: (isActive || task.checked) ? 0.5 : 1,
            },
        ]}>

            {/* ----- Top Section ----- */}
            <View style={styles.topRow}>
                {/* Task checkbox — wrapper owns the tap (bigger target + press feedback) */}
                {checkAction && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.checkBoxContainer, pressed && { backgroundColor: theme.border }
                        ]}
                        onPress={() => handleToggleCheck(!task.checked, task)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: task.checked }}
                    >
                        <Checkbox
                            color={task.checked ? theme.border : theme.secondary}
                            value={task.checked}
                            pointerEvents="none"
                        />
                    </Pressable>
                )}

                {/* Task Text */}
                <View style={styles.taskTextContainer}>
                    <Hyperlink linkDefault={true} linkStyle={{ color: theme.primary }}>
                        <Text
                            style={[styles.taskText, {
                                color: task.checked ? theme.muted : theme.text,
                                textDecorationLine: task.checked ? "line-through" : "none",
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
                            style={[styles.actionButton, { backgroundColor: theme.iconBg }]}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            onPress={() => handleToggleFavorite(task.id)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialDesignIcons
                                name={task.isFavorite ? "star" : "star-outline"}
                                color={theme.muted}
                                size={18}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Restore icon */}
                    {restoreAction && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.iconBg }]}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            onPress={() => handleRestore(task.id)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialDesignIcons
                                name="backup-restore"
                                color={theme.success}
                                size={18}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Reminder Cancel icon */}
                    {cancelReminderAction && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.iconBg }]}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            onPress={() => handleCancelReminder(task)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialDesignIcons
                                name="bell-remove-outline"
                                color={theme.muted}
                                size={18}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Delete icon */}
                    {softDeleteAction && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.iconBg }]}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            onPress={() => handleSoftDelete(task)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialDesignIcons
                                name="close"
                                color={theme.muted}
                                size={18}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Hard Delete icon */}
                    {hardDeleteAction && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.iconBg }]}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            onPress={() => handleHardDelete(task)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <MaterialDesignIcons
                                name="close"
                                color={theme.danger}
                                size={18}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ----- Bottom Section ----- */}
            <View style={[styles.bottomRow, { backgroundColor: theme.tint }]}>
                {/* Reminder */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {/* Reminder icon — bell when it will fire, bell-off when muted (notifications off) or past */}
                    {task.reminderId && task.reminderDateTime && (
                        <MaterialDesignIcons
                            name={reminderStatus === 'active' ? "bell" : "bell-off"}
                            color={reminderColor}
                            size={16}
                        />
                    )}

                    {/* Reminder dateTime - show it even if passed, but with different styling */}
                    {task.reminderId && task.reminderDateTime && (
                        <Text
                            style={{
                                fontSize: 11,
                                color: reminderColor,
                                textDecorationLine: reminderStatus === 'past' ? 'line-through' : 'none'
                            }}
                        >
                            {dates.format(task.reminderDateTime)}
                        </Text>
                    )}

                    {/* No reminder at all — quiet placeholder */}
                    {reminderStatus === 'none' && !task.checked && !task.isDeleted && (
                        <MaterialDesignIcons
                            name="bell-cancel-outline"
                            color={theme.muted}
                            size={16}
                            style={{ opacity: 0.5 }}
                        />
                    )}
                </View>

                {/* Share icon */}
                {shareAction && (
                    <TouchableOpacity
                        onPress={() => shareText(tr.forms.task, task.text)}
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
        marginTop: 8,
        marginHorizontal: 6,
        borderRadius: 4,
        borderWidth: 1,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
        gap: 8,
    },
    checkBoxContainer: {
        alignSelf: "flex-start",
        flexShrink: 0,
        padding: 8,
        marginTop: -6,
        marginBottom: -6,
        marginLeft: -6,
        marginRight: -8,
        borderRadius: 999,
    },
    taskTextContainer: {
        width: "100%",
        flexShrink: 1,
        marginLeft: 2,
    },
    taskText: {
        fontSize: 15,
        lineHeight: 20,
    },
    topRight: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 0,
        gap: 8,
    },
    actionButton: {
        width: 26,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
    },

    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
});
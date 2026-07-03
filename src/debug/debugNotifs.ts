import { setNotificationChannel } from "@/services/notificationsService";
import { useLanguageStore } from "@/store/languageStore";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ------------------------------------------------------------
// Debug utility: schedule a test task reminder.
// Mirrors scheduleNotification() in notificationsService so it exercises the
// real delivery path (channel + DATE trigger). Uses a debug-only data payload —
// no real task id — so the useNotifications listeners don't mutate any task.
// ------------------------------------------------------------
export async function debugTaskReminderN(seconds = 10): Promise<void> {
    try {
        await setNotificationChannel();

        const tr = useLanguageStore.getState().tr;
        const triggerDate = new Date(Date.now() + seconds * 1000);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: tr.notifications.taskReminder,
                body: "Debug test reminder",
                data: { debug: true },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
                channelId: "default",
            },
        });

        console.log(`🔔 Test reminder scheduled to fire in ~${seconds}s at ${triggerDate.toLocaleString("en-GB")}.`);
    } catch (err) {
        console.error("❌ Failed to schedule test reminder:", err);
    }
}

// ------------------------------------------------------------
// Extract a readable fire time from a stored trigger. DATE triggers carry the
// timestamp as `value` (native Android, ms) or `date` (Date | number).
// ------------------------------------------------------------
function formatTriggerDate(trigger: Notifications.NotificationTrigger | null): string {
    if (!trigger) return "immediate";
    const raw = (trigger as { value?: unknown; date?: unknown }).value
        ?? (trigger as { date?: unknown }).date;
    const ms = typeof raw === "number" ? raw
        : typeof raw === "string" ? Date.parse(raw)
        : raw instanceof Date ? raw.getTime()
        : null;
    return ms ? new Date(ms).toLocaleString("en-GB") : "unknown";
}

// ------------------------------------------------------------
// Debug utility: log all channels, scheduled notifications and permissions.
// ------------------------------------------------------------
export async function logScheduledN(): Promise<void> {
    try {
        if (Platform.OS === "android") {
            const channels = await Notifications.getNotificationChannelsAsync();
            console.log("📡 Channels:", channels.map((c) => ({
                id: c.id,
                name: c.name,
                importance: c.importance,
                vibrationPattern: c.vibrationPattern,
            })));
        }

        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        console.log("⏰ Scheduled notifications:", JSON.stringify(scheduled.map((n) => ({
            id: n.identifier,
            scheduledFor: formatTriggerDate(n.trigger),
            data: n.content.data,
            trigger: n.trigger,
        })), null, 2));

        const permissions = await Notifications.getPermissionsAsync();
        console.log("🔧 Notification permissions:", permissions);
    } catch (err) {
        console.error("❌ logScheduledN failed:", err);
    }
}

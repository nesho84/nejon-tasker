import { cancelScheduledNotification, scheduleNotification } from "@/services/notificationsService";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

// ------------------------------------------------------------
// Debug utility: set a real reminder on a random open task, firing in `seconds`.
// Goes through the real scheduleNotification() + taskStore, so it tests the whole
// path: label title/color/shortened text in the notification, the task showing in
// Reminders > Upcoming then moving to Past, and tap → opens that task.
// Prefers the task with the longest text (tests the 200-char body cap).
// ------------------------------------------------------------
export async function debugTaskReminderN(seconds = 10): Promise<void> {
    const { allTasks, updateTask } = useTaskStore.getState();
    const labels = useLabelStore.getState().labels;
    const tr = useLanguageStore.getState().tr;

    // Open tasks under an existing label; prefer ones without a reminder
    const candidates = allTasks.filter((t) => !t.isDeleted && !t.checked && labels.some((l) => l.id === t.labelId));
    const withoutReminder = candidates.filter((t) => !t.reminderId);
    const pool = withoutReminder.length > 0 ? withoutReminder : candidates;
    if (pool.length === 0) {
        throw new Error("No open tasks — seed dummy data or create a task first.");
    }
    const task = pool.reduce((longest, t) => (t.text.length > longest.text.length ? t : longest));
    const label = labels.find((l) => l.id === task.labelId);

    // Replace any existing reminder on that task
    if (task.reminderId) {
        await cancelScheduledNotification(task.reminderId);
    }
    const reminderDateTime = new Date(Date.now() + seconds * 1000).toISOString();
    const reminderId = await scheduleNotification({ ...task, reminderDateTime }, label, tr);
    if (!reminderId) {
        throw new Error("Scheduling failed — check notification permission.");
    }
    await updateTask(task.id, { reminderDateTime, reminderId });

    // Short preview — the task may be thousands of characters long
    const text = task.text.trim();
    const preview = text.length > 100 ? `${text.substring(0, 100)}...` : text;

    console.log(`🔔 Test reminder for "${preview}" (${label?.title}) fires in ~${seconds}s.`);
    Alert.alert(
        `Reminder in ${seconds}s`,
        `Label: ${label?.title}\nTask (${text.length} chars): ${preview}\n\n` +
        `Tap the notification — it should open this task.`,
    );
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
            title: n.content.title,
            subtitle: n.content.subtitle,
            color: (n.content as { color?: string }).color,
            body: n.content.body,
            data: n.content.data,
            trigger: n.trigger,
        })), null, 2));

        const permissions = await Notifications.getPermissionsAsync();
        console.log("🔧 Notification permissions:", permissions);
    } catch (err) {
        console.error("❌ logScheduledN failed:", err);
    }
}

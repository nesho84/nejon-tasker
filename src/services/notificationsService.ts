import { Label } from '@/types/label.types';
import { Translations } from '@/types/language.types';
import { Task } from '@/types/task.types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ------------------------------------------------------------
// Set Android notification channel
// ------------------------------------------------------------
export async function setNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ffffff',
        });
    }
}

// ------------------------------------------------------------
// Cancel a scheduled notification
// ------------------------------------------------------------
export async function cancelScheduledNotification(notificationId: string) {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Error canceling notification:', error);
    }
}

// ------------------------------------------------------------
// Schedule a notification for a task's reminder (titled with its label)
// ------------------------------------------------------------
export async function scheduleNotification(task: Task, label: Label | undefined, tr: Translations): Promise<string | null> {
    // Android channel configuration
    await setNotificationChannel();

    try {
        let notificationId = null;

        // Guard against null reminderDateTime
        if (!task.reminderDateTime) {
            console.warn('Task has no reminderDateTime set');
            return null;
        }

        const reminderDateTime = new Date(task.reminderDateTime);

        // Only schedule if the reminder is in the future. Use a DATE trigger
        // (absolute time) rather than TIME_INTERVAL so Android fires it at the
        // exact clock time instead of a drifting countdown.
        if (reminderDateTime.getTime() > new Date().getTime()) {
            // Title: the label, shortened like in the drawer and home cards
            let title = tr.notifications.taskReminder;
            if (label) {
                title = label.title.length > 25 ? `${label.title.substring(0, 20)}...` : label.title;
            }

            // Body: trimmed and capped — tapping the notification opens the full task
            const text = task.text.trim();
            const body = text.length > 200 ? `${text.substring(0, 200).trimEnd()}...` : text;

            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    subtitle: label ? tr.notifications.taskReminder : undefined,
                    body: body,
                    color: label?.color,
                    data: {
                        taskId: task.id,
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: reminderDateTime,
                    channelId: 'default',
                },
            });

            const taskText = task.text.length > 20 ? `${task.text.substring(0, 20)}...` : task.text;
            console.log(`Scheduled notification for task "${taskText}" at ${reminderDateTime.toLocaleString('en-GB')}.`);
        }
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

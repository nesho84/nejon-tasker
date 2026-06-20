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
// Schedule a notification for a task's reminder
// ------------------------------------------------------------
export async function scheduleNotification(task: Task, tr: Translations): Promise<string | null> {
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
            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: tr.notifications.taskReminder,
                    body: `${task.text.substring(0, 40)}...`,
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

            console.log(`Scheduled notification for task "${task.text}" at ${reminderDateTime.toISOString()}.`);
        }
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

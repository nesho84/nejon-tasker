import { Translations } from '@/types/language.types';
import { Task } from '@/types/task.types';
import * as Application from 'expo-application';
import * as Battery from 'expo-battery';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

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
// Read the current notification permission status
// ------------------------------------------------------------
export async function getPermissionStatus(): Promise<'granted' | 'denied'> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
}

// ------------------------------------------------------------
// Request notification permission (shows a localized fallback alert when denied)
// ------------------------------------------------------------
export async function requestNotificationPermission(tr: Translations): Promise<'granted' | 'denied'> {
    try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                tr.alerts.notificationPermission.title,
                tr.alerts.notificationPermission.message,
                [
                    { text: tr.buttons.cancel, onPress: () => { }, style: 'cancel' },
                    { text: tr.buttons.openSettings, onPress: async () => { Linking.openSettings(); } }
                ],
                { cancelable: false }
            );
            return 'denied';
        }
        return 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
}

// ------------------------------------------------------------
// Schedule a notification for a task's reminder
// ------------------------------------------------------------
export async function scheduleNotification(task: Task, tr: Translations): Promise<string | null> {
    // First request permission
    await requestNotificationPermission(tr);

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
// Request battery optimization exemption
// ------------------------------------------------------------
export async function openBatteryOptimizationSettings() {
    if (Platform.OS !== 'android') {
        Linking.openSettings();
        return;
    }

    // true = app is being optimized (not yet exempt)
    let optimizationEnabled = true;
    try {
        optimizationEnabled = await Battery.isBatteryOptimizationEnabledAsync();
    } catch (error) {
        console.warn('Could not read battery optimization status:', error);
    }

    // Not exempt yet → one-tap "Allow" dialog.
    if (optimizationEnabled) {
        try {
            await IntentLauncher.startActivityAsync(
                IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                { data: `package:${Application.applicationId}` }
            );
            return;
        } catch (error) {
            console.warn('Battery optimization request failed, falling back to list:', error);
        }
    }

    // Already exempt (or the request failed) → open the list to review/toggle.
    try {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
        );
    } catch {
        Linking.openSettings();
    }
}

// ------------------------------------------------------------
// Open the "Alarms & reminders" settings screen
// ------------------------------------------------------------
export async function openAlarmPermissionSettings() {
    if (Platform.OS !== 'android') {
        Linking.openSettings();
        return;
    }
    if (typeof Platform.Version === 'number' && Platform.Version < 31) {
        Linking.openSettings();
        return;
    }
    try {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM,
            { data: `package:${Application.applicationId}` }
        );
    } catch (error) {
        console.warn('Could not open alarm permission settings:', error);
        Linking.openSettings();
    }
}

// ------------------------------------------------------------
// Open the app's notification settings screen
// ------------------------------------------------------------
export async function openNotificationSettings() {
    if (Platform.OS !== 'android') {
        Linking.openSettings();
        return;
    }
    try {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
            { extra: { 'android.provider.extra.APP_PACKAGE': Application.applicationId } }
        );
    } catch (error) {
        console.warn('Could not open notification settings:', error);
        Linking.openSettings();
    }
}

import { APPLE_STORE_NATIVE_URL, APPLE_STORE_URL, GOOGLE_PLAY_NATIVE_URL, GOOGLE_PLAY_URL } from "@/constants/links";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { Translations } from "@/types/language.types";
import { ReminderStatus } from "@/types/notification.types";
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import * as Application from "expo-application";
import * as IntentLauncher from "expo-intent-launcher";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform, Share } from "react-native";

// ------------------------------------------------------------
// Open an external URL — fail silently when no app can handle it
// ------------------------------------------------------------
export const openExternalUrl = async (url: string): Promise<void> => {
    try {
        await Linking.openURL(url);
    } catch {
        // No app can handle this URL — fail silently
    }
};

// ------------------------------------------------------------
// Open the app's store listing (native store app, web fallback)
// ------------------------------------------------------------
export const openStoreListing = async (): Promise<void> => {
    const nativeUrl = Platform.OS === "ios" ? APPLE_STORE_NATIVE_URL : GOOGLE_PLAY_NATIVE_URL;
    const webUrl = Platform.OS === "ios" ? APPLE_STORE_URL : GOOGLE_PLAY_URL;

    try {
        await Linking.openURL(nativeUrl);
    } catch {
        await openExternalUrl(webUrl);
    }
};

// ------------------------------------------------------------
// Share text using the system share dialog
// ------------------------------------------------------------
export const shareText = async (title: string, message: string) => {
    try {
        await Share.share(
            {
                title: title || "My Task",
                message: message,
            },
            {
                dialogTitle: title,
                subject: title,
            }
        );
    } catch (error) {
        console.error("Share failed:", error);
    }
};

// ------------------------------------------------------------
// Share a task via the system share dialog — includes the reminder
// (upcoming or missed) when one is set
// ------------------------------------------------------------
export const shareTask = async (labelTitle: string | undefined, task: Task, tr: Translations) => {
    let title = tr.forms.task;
    if (labelTitle) {
        title += `: ${labelTitle}`;
    }

    let message = task.text;
    if (task.reminderDateTime && task.reminderId) {
        message += `\n\n${tr.forms.reminder}: ${dates.format(task.reminderDateTime)}`;
    }
    await shareText(title, message);
};

// ------------------------------------------------------------
// Classify a task's reminder for display (see ReminderStatus for the states).
// A reminder is "scheduled in the future" when the result is 'active' or 'muted'.
// ------------------------------------------------------------
export const getReminderStatus = (
    dateTime: string | Date | null,
    reminderId: string | null,
    notificationsEnabled: boolean
): ReminderStatus => {
    if (!dateTime || !reminderId) return 'none';
    if (new Date(dateTime).getTime() <= new Date().getTime()) return 'past';
    return notificationsEnabled ? 'active' : 'muted';
};

// ------------------------------------------------------------
// Request notification permission (localized fallback alert when denied), then
// refresh the shared device-settings state. Returns the resulting status.
// ------------------------------------------------------------
export const requestNotificationPermission = async (tr: Translations): Promise<'granted' | 'denied'> => {
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
        }
        await useDeviceSettingsStore.getState().syncDeviceSettings();
        return status === 'granted' ? 'granted' : 'denied';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

// ------------------------------------------------------------
// Open the app's notification settings screen (shared by the settings toggle
// and the NotificationsBanner). Falls back to the app's settings page.
// ------------------------------------------------------------
export const openNotificationSettings = async () => {
    if (Platform.OS !== "android") {
        Linking.openSettings();
        return;
    }
    try {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
            { extra: { "android.provider.extra.APP_PACKAGE": Application.applicationId } }
        );
    } catch (error) {
        console.warn("Could not open notification settings:", error);
        Linking.openSettings();
    }
};

// ------------------------------------------------------------
// Open the battery-optimization settings (one-tap request when not yet exempt,
// otherwise the list to review). Reads the exempt state from deviceSettingsStore.
// ------------------------------------------------------------
export const openBatteryOptimizationSettings = async () => {
    if (Platform.OS !== "android") {
        Linking.openSettings();
        return;
    }
    // true = app is being optimized (not yet exempt) → one-tap "Allow" dialog
    if (useDeviceSettingsStore.getState().batteryOptimization) {
        try {
            await IntentLauncher.startActivityAsync(
                IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                { data: `package:${Application.applicationId}` }
            );
            return;
        } catch (error) {
            console.warn("Battery optimization request failed, falling back to list:", error);
        }
    }
    // Already exempt (or the request failed) → open the list to review/toggle
    try {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
        );
    } catch {
        Linking.openSettings();
    }
};

// ------------------------------------------------------------
// Open the "Alarms & reminders" settings screen (Android 12+)
// ------------------------------------------------------------
export const openAlarmPermissionSettings = async () => {
    if (Platform.OS !== "android") {
        Linking.openSettings();
        return;
    }
    if (typeof Platform.Version === "number" && Platform.Version < 31) {
        Linking.openSettings();
        return;
    }
    try {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM,
            { data: `package:${Application.applicationId}` }
        );
    } catch (error) {
        console.warn("Could not open alarm permission settings:", error);
        Linking.openSettings();
    }
};

import { useLanguageStore } from '@/store/languageStore';
import { useTaskStore } from "@/store/taskStore";
import { Task } from '@/types/task.types';
import * as Application from 'expo-application';
import * as Battery from 'expo-battery';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Linking, Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function useNotifications() {
    // Stores
    const tr = useLanguageStore((state) => state.tr);
    const updateTask = useTaskStore((state) => state.updateTask);

    // Notifications state
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

    // Refs
    const appStateListenerRef = useRef<any>(null);

    // ------------------------------------------------------------
    // Set Android notification channel
    // ------------------------------------------------------------
    const setNotificationChannel = async () => {
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
    // Schedule a notification
    // ------------------------------------------------------------
    const scheduleNotification = async (task: Task) => {
        // First request permission
        await requestPermission();

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
    };

    // ------------------------------------------------------------
    // Cancel a scheduled notification
    // ------------------------------------------------------------
    const cancelScheduledNotification = async (notificationId: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    };

    // ------------------------------------------------------------
    // Request battery optimization exemption
    // ------------------------------------------------------------
    const openBatteryOptimizationSettings = async () => {
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
    };

    // ------------------------------------------------------------
    // Open the "Alarms & reminders" settings screen
    // ------------------------------------------------------------
    const openAlarmPermissionSettings = async () => {
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
    };

    // ------------------------------------------------------------
    // Open the app's notification settings screen
    // ------------------------------------------------------------
    const openNotificationSettings = async () => {
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
    };

    // ------------------------------------------------------------
    // Toggle notifications (request when off, open settings when on)
    // ------------------------------------------------------------
    const handleNotificationsToggle = async () => {
        if (notificationsEnabled) {
            await openNotificationSettings();
        } else {
            await requestPermission();
        }
    };

    // ------------------------------------------------------------
    // Request notification permission
    // ------------------------------------------------------------
    const requestPermission = async () => {
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
                setNotificationsEnabled(false);
                return 'denied';
            }

            setNotificationsEnabled(true);
            return 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    };

    // ------------------------------------------------------------
    // Check notification permissions on mount and app state change
    // ------------------------------------------------------------
    useEffect(() => {
        // Initial check
        const checkPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationsEnabled(status === 'granted');
        };
        checkPermissions();

        // Listen to app state changes
        if (!appStateListenerRef.current) {
            let appState = AppState.currentState;

            appStateListenerRef.current = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
                if (appState.match(/inactive|background/) && nextAppState === 'active') {
                    checkPermissions();
                }
                appState = nextAppState;
                console.log('👁‍🗨 AppState →', nextAppState);
            });
        }

        return () => {
            appStateListenerRef.current.remove();
        }
    }, []);

    // ------------------------------------------------------------
    // Handle incoming notifications
    // ------------------------------------------------------------
    useEffect(() => {
        // Handle received notifications
        const receivedListener = Notifications.addNotificationReceivedListener(async (notification) => {
            console.log('🔔 [Foreground] Received notification');

            const taskId = notification.request.content.data?.taskId;
            if (typeof taskId === 'string' && taskId.length > 0) {
                updateTask(taskId, {
                    reminderDateTime: null,
                    reminderId: null,
                });
                console.log('[Foreground] Updated task ID:', taskId);
            } else {
                console.log('[Foreground] taskId invalid or missing');
            }
        });

        // Handle received responses
        const responseReceivedListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
            console.log('[Foreground] User responded to received notification');

            const taskId = response.notification.request.content.data?.taskId;
            if (typeof taskId === 'string' && taskId.length > 0) {
                updateTask(taskId, {
                    reminderDateTime: null,
                    reminderId: null,
                });
                console.log('[Foreground] Updated task ID:', taskId);
            } else {
                console.log('[Foreground] taskId invalid or missing');
            }
        });

        return () => {
            // Cleanup listeners when unmounting
            receivedListener.remove();
            responseReceivedListener.remove();
        };
    }, [updateTask]);

    return {
        requestPermission,
        notificationsEnabled,
        setNotificationChannel,
        scheduleNotification,
        cancelScheduledNotification,
        openBatteryOptimizationSettings,
        openAlarmPermissionSettings,
        openNotificationSettings,
        handleNotificationsToggle,
    };
}
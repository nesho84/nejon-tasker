import { useLanguageStore } from '@/store/languageStore';
import { useTaskStore } from "@/store/taskStore";
import { Task } from '@/types/task.types';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function useNotifications() {
    const { updateTask } = useTaskStore();

    // Set Android notification channel
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

    // Schedule a notification
    const scheduleNotification = async (task: Task) => {
        const { tr } = useLanguageStore.getState();

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

            const currentDateTime = new Date();
            const reminderDateTime = new Date(task.reminderDateTime);
            const timeDifferenceInSeconds = Math.max(1, Math.floor((reminderDateTime.getTime() - currentDateTime.getTime()) / 1000));

            if (timeDifferenceInSeconds > 0) {
                notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: tr.notifications.taskReminder,
                        body: `${task.text.substring(0, 40)}...`,
                        data: {
                            taskId: task.id,
                        },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: timeDifferenceInSeconds,
                        channelId: 'default',
                    },
                });

                console.log(`Scheduled notification for task "${task.text}" in ${timeDifferenceInSeconds} seconds.`);
            }
            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    };

    // Cancel a scheduled notification
    const cancelScheduledNotification = async (notificationId: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    };

    // Request notification permission
    const requestPermission = async () => {
        // Get tr at call time, not hook initialization
        const { tr } = useLanguageStore.getState();

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    tr.alerts.notificationPermission.title,
                    tr.alerts.notificationPermission.message,
                    [{ text: "OK", onPress: async () => { Linking.openSettings(); } }],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

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
    }, []);

    return {
        requestPermission,
        setNotificationChannel,
        scheduleNotification,
        cancelScheduledNotification,
    };
}
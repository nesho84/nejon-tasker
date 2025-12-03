import * as TasksRepo from "@/db/tasks.repo";
import { useLanguageStore } from '@/store/languageStore';
import { Task } from '@/types/task.types';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';

// Notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

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

export default function useNotifications() {
    const { language, tr } = useLanguageStore();

    // Function to schedule a notification
    const scheduleNotification = async (task: Task) => {
        // First request permission
        await requestPermission();
        // Android channel configuration
        await setNotificationChannel();

        try {
            let notificationId = null;

            // Guard against null reminderDateTime
            if (!task.reminderDateTime) {
                console.warn('Task has no reminder date set');
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
                            taskId: task.id
                        },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: timeDifferenceInSeconds,
                        channelId: 'default',
                    },
                });
            }
            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    };

    // Function to cancel a scheduled notification
    const cancelScheduledNotification = async (notificationId: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    };

    // Function to request notification permission
    const requestPermission = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    tr.alerts.notificationPermission.title,
                    tr.alerts.notificationPermission.message,
                    [
                        {
                            text: "OK",
                            onPress: async () => {
                                // Open device settings
                                Linking.openSettings();
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    useEffect(() => {
        // Handle received notifications here (app open in Foreground)
        const receivedListener = Notifications.addNotificationReceivedListener(async (notification) => {
            console.log('[Foreground] Received notification');

            const taskId = notification.request.content.data?.taskId;
            // Ensure the taskId is a string before calling updateTask
            if (typeof taskId === 'string' && taskId.length > 0) {
                TasksRepo.updateTask(taskId, {
                    reminderDateTime: null,
                    reminderId: null,
                });
            }
        });

        // Handle received responses here (app closed in background)
        const responseReceivedListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
            console.log('[Background] User responded to received notification', response.notification.request.content.data);

            const taskId = response.notification.request.content.data?.taskId;
            // Ensure the taskId is a string before calling updateTask
            if (typeof taskId === 'string' && taskId.length > 0) {
                TasksRepo.updateTask(taskId, {
                    reminderDateTime: null,
                    reminderId: null,
                });
            }
        });

        return () => {
            // Cleanup listeners when unmounting
            receivedListener.remove();
            responseReceivedListener.remove();
        };
    }, []);

    return { scheduleNotification, cancelScheduledNotification };
}
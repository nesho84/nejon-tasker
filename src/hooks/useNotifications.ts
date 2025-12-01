import { useLanguageStore } from '@/store/languageStore';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';

// Notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface TaskObj {
    key: string;
    name: string;
    reminder: {
        dateTime: string | null;
        notificationId?: string | null;
    };
}

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

export default function useNotifications(refreshContext: () => Promise<void>) {
    const { language, tr } = useLanguageStore();

    // Function to schedule a notification
    const scheduleNotification = async (taskObj: TaskObj) => {
        // First request permission
        await requestPermission();
        // Android channel configuration
        await setNotificationChannel();

        try {
            let notificationId = null;

            const currentDateTime = new Date();
            const reminderDateTime = new Date(taskObj.reminder.dateTime!);
            const timeDifferenceInSeconds = Math.max(1, Math.floor((reminderDateTime.getTime() - currentDateTime.getTime()) / 1000));

            if (timeDifferenceInSeconds > 0) {
                notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: tr.notifications.taskReminder,
                        body: `${taskObj.name.substring(0, 40)}...`,
                        data: { taskKey: taskObj.key },
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
            await refreshContext();
        });

        // Handle received responses here (app closed in background)
        const responseReceivedListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
            console.log('[Background] User responded to received notification');
            await refreshContext();
        });

        return () => {
            // Cleanup listeners when unmounting
            receivedListener.remove();
            responseReceivedListener.remove();
        };
    }, [refreshContext]);

    return { scheduleNotification, cancelScheduledNotification };
}
import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useLanguageStore } from '@/store/languageStore';

// Notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowList: true,
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function useNotifications(refreshContext) {
    const { language, tr } = useLanguageStore();

    // Function to schedule a notification
    const scheduleNotification = async (taskObj) => {
        // First request permission
        requestPermission();
        // Android channel configuration
        setNotificationChannel();

        try {
            let notificationId = null;

            const currentDateTime = new Date();
            const reminderDateTime = new Date(taskObj.reminder.dateTime);
            const timeDifferenceInSeconds = Math.max(0, (reminderDateTime - currentDateTime) / 1000);

            if (timeDifferenceInSeconds > 0) {
                notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: tr.notifications.taskReminder,
                        body: `${taskObj.name.substring(0, 40)}...`,
                        data: { taskKey: taskObj.key },
                    },
                    trigger: {
                        seconds: timeDifferenceInSeconds,
                    },
                });
            }
            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    };

    // Function to cancel a scheduled notification
    const cancelScheduledNotification = async (notificationId) => {
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

    const setNotificationChannel = async () => {
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#ffffff',
            });
        }
    }

    useEffect(() => {
        // Handle received notifications here (app open in Foreground)
        const receivedListener = Notifications.addNotificationReceivedListener(async (notification) => {
            // const taskKey = notification.request.content.data.taskKey;
            // console.log('Received notification:', notification);

            // Refresh Tasks Context state
            await refreshContext();
            await Notifications.setBadgeCountAsync(1);
        });
        // Handle received responses here (app closed in backgrdound)
        const responseReceivedListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
            // const taskKey = notification.request.content.data.taskKey;
            // console.log('User responded to received notification:', response);

            // Refresh Tasks Context state
            await refreshContext();
        });

        return () => {
            // Cleanup listeners when unmounting
            receivedListener.remove();
            responseReceivedListener.remove();
        };
    }, []);

    return { scheduleNotification, cancelScheduledNotification };
}
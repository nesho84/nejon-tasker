import { useTaskStore } from "@/store/taskStore";
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ------------------------------------------------------------
// Initializes notification handling. Mounted once at the app root.
// Listens for incoming notifications/responses and clears the reminder data on
// the matching task once it has fired.
// ------------------------------------------------------------
export default function useNotifications() {
    const updateTask = useTaskStore((state) => state.updateTask);

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
}

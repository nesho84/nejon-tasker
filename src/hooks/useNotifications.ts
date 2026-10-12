import { useOnboardingStore } from "@/store/onboardingStore";
import { kvStorage } from "@/store/storage";
import { useTaskStore } from "@/store/taskStore";
import * as Notifications from 'expo-notifications';
import { router } from "expo-router";
import { useEffect } from 'react';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// A cold-start tap is replayed after every JS reload — remember the one we opened
const OPENED_NOTIFICATION_KEY = "opened-notification-id";

// ------------------------------------------------------------
// Initializes notification handling. Mounted once at the app root.
// Tapping a reminder opens its task — held until the DB is loaded and onboarding
// is done, so cold-start taps work too. Fired reminders are kept (shown as Past).
// ------------------------------------------------------------
export default function useNotifications(isDbReady: boolean) {
    // A tap can only open a task once the main app is reachable (onboarding done)
    const onboardingReady = useOnboardingStore((state) => state.isReady);
    const onboardingComplete = useOnboardingStore((state) => state.onboardingComplete);
    const lastResponse = Notifications.useLastNotificationResponse();

    useEffect(() => {
        if (!isDbReady || !onboardingReady || !onboardingComplete || !lastResponse) return;
        if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

        const openTask = async () => {
            // Skip a tap we already opened (replayed after a reload)
            const notificationId = lastResponse.notification.request.identifier;
            if (await kvStorage.getItem(OPENED_NOTIFICATION_KEY) === notificationId) return;
            await kvStorage.setItem(OPENED_NOTIFICATION_KEY, notificationId);

            const taskId = lastResponse.notification.request.content.data?.taskId;
            const task = typeof taskId === 'string' ? useTaskStore.getState().getTaskById(taskId) : undefined;

            // Open the task's label, then its edit sheet on top
            if (task && !task.isDeleted) {
                router.navigate(`/tasks?labelId=${task.labelId}`);
                router.navigate({
                    pathname: '/editTask',
                    params: { labelId: task.labelId, taskId: task.id },
                });
            }
        };
        openTask();

        // Handled — don't route again
        Notifications.clearLastNotificationResponse();
    }, [isDbReady, onboardingReady, onboardingComplete, lastResponse]);
}

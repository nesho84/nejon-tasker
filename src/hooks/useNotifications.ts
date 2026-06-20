import {
    cancelScheduledNotification,
    getPermissionStatus,
    openAlarmPermissionSettings,
    openBatteryOptimizationSettings,
    openNotificationSettings,
    requestNotificationPermission,
    scheduleNotification as scheduleNotificationService,
    setNotificationChannel,
} from '@/services/notificationsService';
import { useLanguageStore } from '@/store/languageStore';
import { useTaskStore } from "@/store/taskStore";
import { Task } from '@/types/task.types';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

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
    // Request notification permission and sync the enabled state
    // ------------------------------------------------------------
    const requestPermission = async () => {
        const status = await requestNotificationPermission(tr);
        setNotificationsEnabled(status === 'granted');
        return status;
    };

    // ------------------------------------------------------------
    // Schedule a notification for a task (injects active translations)
    // ------------------------------------------------------------
    const scheduleNotification = (task: Task) => scheduleNotificationService(task, tr);

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
    // Check notification permissions on mount and app state change
    // ------------------------------------------------------------
    useEffect(() => {
        // Initial check
        const checkPermissions = async () => {
            const status = await getPermissionStatus();
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

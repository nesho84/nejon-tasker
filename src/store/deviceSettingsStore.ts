import * as Battery from 'expo-battery';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { create } from 'zustand';

interface DeviceSettingsState {
    notificationPermission: boolean;
    batteryOptimization: boolean;

    isReady: boolean;
    deviceSettingsError: string | null;

    syncDeviceSettings: () => Promise<void>;
}

export const useDeviceSettingsStore = create<DeviceSettingsState>((set, get) => ({
    // Initial state — assume the worst until the first sync confirms otherwise
    notificationPermission: false,
    batteryOptimization: true, // true = app is being optimized (not exempt)

    deviceSettingsError: null,
    isReady: false,

    // ------------------------------------------------------------
    // Sync device settings (notification permission + battery optimization).
    // Driven by useDeviceSettingsSync (mount + app foreground). Only updates
    // state when something changed. Android-only checks are safe-defaulted on iOS.
    // ------------------------------------------------------------
    syncDeviceSettings: async () => {
        try {
            // Fetch all device settings in parallel
            const [permissions, batteryOptimizationEnabled] = await Promise.all([
                Notifications.getPermissionsAsync(),
                Platform.OS === 'android' ? Battery.isBatteryOptimizationEnabledAsync() : Promise.resolve(false),
            ]);

            // Derive individual settings from results
            const newSettings = {
                notificationPermission: permissions.status === 'granted',
                batteryOptimization: batteryOptimizationEnabled,
            };

            // Only update if something changed
            const currentSettings = get();
            const hasChanged =
                currentSettings.notificationPermission !== newSettings.notificationPermission ||
                currentSettings.batteryOptimization !== newSettings.batteryOptimization;

            if (hasChanged) {
                set(newSettings);
            }
        } catch (error: unknown) {
            console.warn('Failed to sync device settings:', error);
            set({ deviceSettingsError: error instanceof Error ? error.message : 'Failed to sync device settings' });
        } finally {
            set({ isReady: true });
        }
    },
}));

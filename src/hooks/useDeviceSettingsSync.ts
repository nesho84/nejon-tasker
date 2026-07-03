import { useDeviceSettingsStore } from '@/store/deviceSettingsStore';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ------------------------------------------------------------
// Keep the device-settings store in sync with the OS permission state.
// Mounted once at the app root: syncs on mount and whenever the app returns
// to the foreground (e.g. after the user toggles notifications in system settings).
// ------------------------------------------------------------
export function useDeviceSettingsSync() {
    const syncDeviceSettings = useDeviceSettingsStore((state) => state.syncDeviceSettings);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        // Initial sync on mount
        syncDeviceSettings();

        // Re-sync when the app comes back to the foreground
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                syncDeviceSettings();
            }
            appStateRef.current = nextAppState;
            console.log('👁‍🗨 AppState →', nextAppState);
        });

        return () => subscription.remove();
    }, [syncDeviceSettings]);
}

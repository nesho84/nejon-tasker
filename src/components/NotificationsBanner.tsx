import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { openNotificationSettings } from "@/utils/system";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    // Extra gate beyond the permission check (e.g. only when reminders exist)
    show?: boolean;
}

// ------------------------------------------------------------
// Warning banner shown when notifications are disabled at the OS level.
// Tapping opens the app's notification settings so the user can re-enable.
// ------------------------------------------------------------
export default function NotificationsBanner({ show = true }: Props) {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);
    const notificationsEnabled = useDeviceSettingsStore((state) => state.notificationPermission);
    const isReady = useDeviceSettingsStore((state) => state.isReady);

    // Wait for the first device-settings sync, then warn only when notifications
    // are off and the gate is open (e.g. there are reminders that won't fire)
    if (!isReady || notificationsEnabled || !show) return null;

    return (
        <TouchableOpacity
            onPress={openNotificationSettings}
            activeOpacity={0.8}
            style={[styles.warningBanner, { backgroundColor: theme.danger }]}
        >
            <MaterialDesignIcons name="alert-circle" color="#fff" size={20} />
            <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>{tr.notifications.title1}</Text>
                <Text style={styles.warningSubtitle}>{tr.notifications.message1}</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" color="#fff" size={20} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 8,
        marginTop: 16,
        marginBottom: 10,
        borderRadius: 8,
        gap: 12,
    },
    warningTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    warningSubtitle: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.9,
        marginTop: 2,
    },
});

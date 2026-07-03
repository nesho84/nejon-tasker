import { BackupSection } from "@/components/BackupSection";
import CustomPicker from "@/components/CustomPicker";
import { DARK, LIGHT } from "@/constants/colors";
import DebugPanel from "@/debug/DebugPanel";
import { useDebugStore } from "@/debug/debugStore";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Language, LANGUAGES } from "@/types/language.types";
import { openAlarmPermissionSettings, openBatteryOptimizationSettings, openNotificationSettings, requestNotificationPermission } from "@/utils/system";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const mode = useThemeStore((state) => state.themeMode);
    const language = useLanguageStore((state) => state.language);
    const tr = useLanguageStore((state) => state.tr);
    const notificationsEnabled = useDeviceSettingsStore((state) => state.notificationPermission);
    const batteryOptimization = useDeviceSettingsStore((state) => state.batteryOptimization);
    const debugModeEnabled = useDebugStore((state) => state.debugModeEnabled);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = 8;
    const bottomInset = insets.bottom + 8;

    // ------------------------------------------------------------
    // Handle Theme Toggle
    // ------------------------------------------------------------
    const handleTheme = () => {
        useThemeStore.getState().toggleTheme();
    }

    // ------------------------------------------------------------
    // Handle Language Change
    // ------------------------------------------------------------
    const handleLanguage = (lang: Language) => {
        useLanguageStore.getState().setLanguage(lang);
    };

    // ------------------------------------------------------------
    // Toggle notifications (request when off, open settings when on)
    // ------------------------------------------------------------
    const handleNotificationsToggle = async () => {
        if (notificationsEnabled) {
            await openNotificationSettings();
        } else {
            await requestNotificationPermission(tr);
        }
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.bgAlt }]}
            edges={['left', 'right']}
        >
            <ScrollView
                style={[styles.scrollContainer, { backgroundColor: theme.bgAlt }]}
                contentContainerStyle={[styles.scrollContent, { paddingTop: topInset, paddingBottom: bottomInset }]}
                showsVerticalScrollIndicator={false}
            >

                {/* Debug tools (dev builds, or debug mode toggled on the About screen) */}
                {(__DEV__ || debugModeEnabled) && (
                    <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.sectionTitle, { color: theme.danger }]}>
                            Debug Tools
                        </Text>
                        <DebugPanel />
                    </View>
                )}

                {/* Display Options */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primaryAlt }]}>
                        {tr.settings.displayOptions}
                    </Text>
                    <TouchableOpacity style={styles.row} onPress={handleTheme} activeOpacity={0.7}>
                        <View style={[styles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialDesignIcons
                                name={mode === "light" ? "white-balance-sunny" : "weather-night"}
                                size={22}
                                color={theme.primary}
                            />
                        </View>
                        <View style={styles.rowText}>
                            <Text style={[styles.rowTitle, { color: theme.muted }]}>Theme</Text>
                            <Text style={[styles.rowSubtitle, { color: theme.primary }]}>
                                {mode === "light" ? "Light" : "Dark"}
                            </Text>
                        </View>
                        <MaterialDesignIcons
                            name={mode === "light" ? "toggle-switch-off-outline" : "toggle-switch"}
                            size={40}
                            color={mode === "light" ? LIGHT.border : DARK.disabled}
                        />
                    </TouchableOpacity>
                </View>

                {/* Language */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primaryAlt }]}>
                        {tr.labels.language}
                    </Text>
                    <CustomPicker
                        items={LANGUAGES}
                        selectedValue={language}
                        onValueChange={(value) => handleLanguage(value as Language)}
                        textColor={theme.muted}
                        selectedColor={theme.action1}
                        backgroundColor={theme.bgAlt}
                        modalBackgroundColor={theme.surface}
                        borderColor={theme.divider}
                    />
                </View>

                {/* Notifications */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, styles.sectionTitleInline, { color: theme.primaryAlt }]}>
                            {tr.settings.notifications}
                        </Text>
                        <MaterialDesignIcons
                            name={notificationsEnabled ? "toggle-switch" : "toggle-switch-off-outline"}
                            size={40}
                            color={notificationsEnabled ? theme.primary : (mode === "light" ? LIGHT.border : DARK.disabled)}
                            onPress={handleNotificationsToggle}
                            style={{ marginVertical: -11 }}
                        />
                    </View>

                    {Platform.OS === "android" && (
                        <View style={styles.subSections} pointerEvents={notificationsEnabled ? "auto" : "none"}>
                            {!notificationsEnabled && (
                                <View style={[StyleSheet.absoluteFill, styles.subSectionsOverlay, { backgroundColor: theme.surface }]} />
                            )}

                            {/* Battery optimization */}
                            <TouchableOpacity style={styles.row} onPress={openBatteryOptimizationSettings} activeOpacity={0.7}>
                                <View style={[styles.rowIcon, { backgroundColor: (batteryOptimization ? theme.warning : theme.primary) + '15' }]}>
                                    <MaterialDesignIcons
                                        name={batteryOptimization ? "battery-alert-variant-outline" : "battery-check-outline"}
                                        size={22}
                                        color={batteryOptimization ? theme.warning : theme.success}
                                    />
                                </View>
                                <View style={styles.rowText}>
                                    <Text style={[styles.rowTitle, { color: theme.muted }]}>
                                        {tr.settings.batteryOptTitle}
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: theme.muted }]}>
                                        {tr.settings.batteryOptBody}
                                    </Text>
                                </View>
                                {batteryOptimization ? (
                                    <MaterialDesignIcons name="alert-circle-outline" size={22} color={theme.warning} />
                                ) : (
                                    <MaterialDesignIcons name="check-circle" size={24} color={theme.success} />
                                )}
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            {/* Alarms & reminders */}
                            <TouchableOpacity style={styles.row} onPress={openAlarmPermissionSettings} activeOpacity={0.7}>
                                <View style={[styles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <MaterialDesignIcons name="alarm" size={22} color={theme.primary} />
                                </View>
                                <View style={styles.rowText}>
                                    <Text style={[styles.rowTitle, { color: theme.muted }]}>
                                        {tr.settings.alarmAccessTitle}
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: theme.muted }]}>
                                        {tr.settings.alarmAccessBody}
                                    </Text>
                                </View>
                                <MaterialDesignIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Backup */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primaryAlt }]}>
                        Backup
                    </Text>
                    <BackupSection />
                </View>


            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 10,
        gap: 10,
    },

    sectionCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        overflow: "hidden",
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        opacity: 0.8,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitleInline: {
        marginBottom: 0,
    },
    subSections: {
        position: "relative",
    },
    subSectionsOverlay: {
        opacity: 0.7,
        zIndex: 10,
        borderRadius: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 6,
    },
    rowIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    rowText: {
        flex: 1,
        gap: 3,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    rowSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.7,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 10,
    },
});
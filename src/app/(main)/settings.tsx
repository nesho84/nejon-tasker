import { BackupSection } from "@/components/BackupSection";
import CustomPicker from "@/components/CustomPicker";
import { DARK, LIGHT } from "@/constants/colors";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Language, LANGUAGES } from "@/types/language.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const mode = useThemeStore((state) => state.themeMode);
    const language = useLanguageStore((state) => state.language);
    const tr = useLanguageStore((state) => state.tr);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = 8;
    const bottomInset = insets.bottom + 8;

    // Notifications hook
    const {
        notificationsEnabled,
        handleNotificationsToggle,
        openBatteryOptimizationSettings,
        openAlarmPermissionSettings,
    } = useNotifications();

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

                {/* Display Options */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primaryAlt }]}>
                        {tr.settings.displayOptions}
                    </Text>
                    <TouchableOpacity style={styles.row} onPress={handleTheme} activeOpacity={0.7}>
                        <View style={[styles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialCommunityIcons
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
                        <MaterialCommunityIcons
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
                        borderColor={theme.border}
                    />
                </View>

                {/* Notifications */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, styles.sectionTitleInline, { color: theme.primaryAlt }]}>
                            {tr.settings.notifications}
                        </Text>
                        <MaterialCommunityIcons
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
                                <View style={[styles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <MaterialCommunityIcons name="battery-alert-variant-outline" size={22} color={theme.primary} />
                                </View>
                                <View style={styles.rowText}>
                                    <Text style={[styles.rowTitle, { color: theme.muted }]}>
                                        {tr.settings.batteryOptTitle}
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: theme.muted }]}>
                                        {tr.settings.batteryOptBody}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            {/* Alarms & reminders */}
                            <TouchableOpacity style={styles.row} onPress={openAlarmPermissionSettings} activeOpacity={0.7}>
                                <View style={[styles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <MaterialCommunityIcons name="alarm" size={22} color={theme.primary} />
                                </View>
                                <View style={styles.rowText}>
                                    <Text style={[styles.rowTitle, { color: theme.muted }]}>
                                        {tr.settings.alarmAccessTitle}
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: theme.muted }]}>
                                        {tr.settings.alarmAccessBody}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
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
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 16,
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
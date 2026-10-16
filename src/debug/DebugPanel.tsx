import { openUpdateAvailableModal } from "@/components/CheckForUpdate";
import { MAX_SHOWS, showNotifReminderModal } from "@/components/NotifReminder";
import { showRateAppModal } from "@/components/RateApp";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useModalStore } from "@/store/modalStore";
import { useNotifReminderStore } from "@/store/notifReminderStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRateAppStore } from "@/store/rateAppStore";
import { useThemeStore } from "@/store/themeStore";
import { shareText } from "@/utils/system";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import Constants from "expo-constants";
import { ReactNode, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { debugTaskReminderN, logScheduledN } from "./debugNotifs";
import { clearAllData, seedDummyData } from "./debugSeed";
import { UpdatePreview, useDebugStore } from "./debugStore";

interface ButtonProps {
    label: string;
    color: string;
    right?: ReactNode;
    disabled?: boolean;
    onPress: () => void;
}

interface ToggleProps {
    label: string;
    color?: string;
    value: boolean;
    onPress: () => void;
}

interface BadgeProps {
    label: string;
    color: string;
    bg: string;
}

interface JsonViewerProps {
    title: string;
    json: string;
}

// ------------------------------------------------------------
// Small rounded status badge (e.g. the test-reminder delay)
// ------------------------------------------------------------
function Badge({ label, color, bg }: BadgeProps) {
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );
}

// ------------------------------------------------------------
// Reusable debug row — label on the left, optional
// value/indicator (e.g. a spinner) on the right
// ------------------------------------------------------------
function DebugButton({ label, color, right, disabled, onPress }: ButtonProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.overlayLight }]}
            activeOpacity={0.6}
            disabled={disabled}
            onPress={onPress}
        >
            <Text style={[styles.buttonText, { color }]}>{label}</Text>
            {right}
        </TouchableOpacity>
    );
}

// ------------------------------------------------------------
// Debug row with an ON / OFF state badge
// ------------------------------------------------------------
function DebugToggle({ label, color, value, onPress }: ToggleProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <DebugButton
            label={label}
            color={color ?? theme.info}
            onPress={onPress}
            right={
                <Badge
                    label={value ? "ON" : "OFF"}
                    color={value ? theme.green : theme.placeholder}
                    bg={value ? theme.green + "20" : theme.divider}
                />
            }
        />
    );
}

// ------------------------------------------------------------
// JSON viewer for debugging: scrollable, selectable, share via the system sheet
// ------------------------------------------------------------
function JsonViewer({ title, json }: JsonViewerProps) {
    const theme = useThemeStore((state) => state.theme);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: theme.bg2 }} contentContainerStyle={{ padding: 6 }}>
                <Text
                    selectable
                    style={{
                        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                        fontSize: 11,
                        color: theme.muted,
                        lineHeight: 17,
                    }}
                >
                    {json}
                </Text>
            </ScrollView>
            <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.green + "20" }]}
                activeOpacity={0.7}
                onPress={() => shareText(title, json)}
            >
                <Text style={[styles.shareBtnText, { color: theme.green }]}>Share JSON</Text>
            </TouchableOpacity>
        </View>
    );
}

// ------------------------------------------------------------
// Open a fullscreen JSON viewer modal via ModalProvider
// ------------------------------------------------------------
const showJsonViewerModal = (title: string, data: object) =>
    useModalStore.getState().show({
        type: "fullscreen",
        showCloseIcon: true,
        title,
        component: <JsonViewer title={title} json={JSON.stringify(data, null, 2)} />,
    });

// Renders the debug controls only — the containing card + "Debug Tools"
export default function DebugPanel() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const updatePreview = useDebugStore((state) => state.updatePreview);
    const setUpdatePreview = useDebugStore((state) => state.setUpdatePreview);
    const forceUpdateOnLaunch = useDebugStore((state) => state.forceUpdateOnLaunch);
    const toggleUpdateOnLaunch = useDebugStore((state) => state.toggleUpdateOnLaunch);

    // Local state
    const [expanded, setExpanded] = useState(false);
    const [busy, setBusy] = useState(false);

    // Toggle a check-for-update status preview on/off (back to "idle")
    const togglePreview = (value: UpdatePreview) => setUpdatePreview(updatePreview === value ? "idle" : value);

    // ------------------------------------------------------------
    // Run an async action with a busy spinner and error handling
    // ------------------------------------------------------------
    const runAsync = async (fn: () => Promise<void>) => {
        if (busy) return;
        setBusy(true);
        try {
            await fn();
        } catch (err) {
            console.error("[DebugPanel] action failed:", err);
            Alert.alert("Debug action error", err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    };

    // ------------------------------------------------------------
    // Confirm before clearing all data
    // ------------------------------------------------------------
    const confirmClearAlert = () => {
        Alert.alert(
            "Clear all data?",
            "This permanently deletes every label and task from the database.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear all", style: "destructive", onPress: () => runAsync(clearAllData) },
            ],
        );
    };

    // Shared params and handlers
    const notifSeconds = 10;       // seconds until the test reminder fires (app open)
    const notifSecondsKilled = 30; // enough time to swipe the app away (cold-start tap)
    const notifSecondsBadge = <Badge label={`${notifSeconds}s`} color={theme.placeholder} bg={theme.divider} />;
    const notifSecondsKilledBadge = <Badge label={`${notifSecondsKilled}s`} color={theme.placeholder} bg={theme.divider} />;

    const showRateAppJsonModal = () => {
        const { rateAppDone, rateAppVersion, rateAppRemindAt } = useRateAppStore.getState();
        showJsonViewerModal("Rate App", {
            version: Constants?.expoConfig?.version,
            rateAppDone,
            rateAppVersion,
            rateAppRemindAt: rateAppRemindAt ? new Date(rateAppRemindAt).toLocaleString("en-GB") : null,
        });
    };
    // Always shows — ignores the platform and waits; a stored choice that blocks it gets an alert with Reset
    const previewRateAppModal = () => {
        const { rateAppDone, rateAppVersion, setRateAppDone, setRateAppVersion, setRateAppRemindAt } = useRateAppStore.getState();
        const version = Constants?.expoConfig?.version ?? null;
        const blockedReason = rateAppDone
            ? `"Already rated" was tapped — the real modal never shows again.`
            : rateAppVersion === version
                ? `"Open Store" was tapped on this version (${version}) — the real modal waits for the next version.`
                : null;

        if (blockedReason) {
            Alert.alert("Rate App", blockedReason, [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: () => {
                        setRateAppDone(false);
                        setRateAppVersion(null);
                        setRateAppRemindAt(null);
                    },
                },
            ]);
            return;
        }
        showRateAppModal();
    };

    const showNotifReminderJsonModal = () => {
        const { notifReminderAt, notifReminderCount } = useNotifReminderStore.getState();
        showJsonViewerModal("Notif Reminder", {
            notificationPermission: useDeviceSettingsStore.getState().notificationPermission,
            notifReminderAt: notifReminderAt ? new Date(notifReminderAt).toLocaleString("en-GB") : null,
            notifReminderCount,
        });
    };
    // Always shows — ignores permission and waits; closes still count, so the 4th tap hits the limit
    const previewNotifReminderModal = () => {
        const { notifReminderCount, setNotifReminderAt, setNotifReminderCount } = useNotifReminderStore.getState();

        if (notifReminderCount >= MAX_SHOWS) {
            Alert.alert("Notif Reminder", `Limit reached (${notifReminderCount}/${MAX_SHOWS}) — the real reminder won't show again until notifications are granted and turned off again.`, [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: () => {
                        setNotifReminderAt(null);
                        setNotifReminderCount(0);
                    },
                },
            ]);
            return;
        }
        showNotifReminderModal();
    };

    // Main component
    return (
        <>
            {/* Toggle header */}
            <TouchableOpacity
                style={[styles.selector, { backgroundColor: theme.bgAlt, borderColor: theme.divider }]}
                activeOpacity={0.7}
                onPress={() => setExpanded((v) => !v)}
            >
                <Ionicons name="bug" size={20} color={theme.danger} style={styles.selectorIcon} />
                <Text style={[styles.selectorText, { color: theme.danger }]}>
                    {expanded ? "Hide debug actions" : "Show debug actions"}
                </Text>
                <MaterialDesignIcons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={theme.danger}
                />
            </TouchableOpacity>

            {expanded && (
                // The debug panel body
                <View style={styles.body}>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Onboarding */}
                    <DebugButton
                        label="Show Onboarding Screen"
                        color={theme.info}
                        onPress={() => useOnboardingStore.getState().setOnboarding(false)}
                    />

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Modal previews */}
                    <DebugButton
                        label="Show 'Rate the App' Modal"
                        color={theme.teal}
                        onPress={previewRateAppModal}
                    />
                    <DebugButton
                        label="Show 'Notif Reminder' Modal"
                        color={theme.teal}
                        onPress={previewNotifReminderModal}
                    />

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Check-for-update previews (modal + the two inline status lines) */}
                    <DebugButton
                        label="Show 'Update available' modal"
                        color={theme.green}
                        onPress={openUpdateAvailableModal}
                    />
                    <DebugToggle
                        label="Toggle 'Up to date' line"
                        color={theme.green}
                        value={updatePreview === "upToDate"}
                        onPress={() => togglePreview("upToDate")}
                    />
                    <DebugToggle
                        label="Toggle 'Check failed' line"
                        color={theme.green}
                        value={updatePreview === "error"}
                        onPress={() => togglePreview("error")}
                    />
                    <DebugToggle
                        label="Toggle 'Update available' On Launch"
                        color={theme.green}
                        value={forceUpdateOnLaunch}
                        onPress={toggleUpdateOnLaunch}
                    />

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Data tools */}
                    <DebugButton
                        label="Seed dummy data"
                        color={theme.danger}
                        disabled={busy}
                        onPress={() => runAsync(seedDummyData)}
                        right={busy ? <ActivityIndicator size="small" color={theme.text2} /> : undefined}
                    />
                    <DebugButton
                        label="Clear all data"
                        color={theme.danger}
                        disabled={busy}
                        onPress={confirmClearAlert}
                    />
                    <Text style={[styles.hint, { color: theme.placeholder }]}>
                        Seeding wipes existing data first, then generates a large set
                        (~16 labels, hundreds of tasks), including one label with a long
                        name and some tasks with very long text.
                    </Text>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Test notifications */}
                    <DebugButton
                        label="Test Reminder on a Task"
                        color={theme.secondary}
                        disabled={busy}
                        onPress={() => runAsync(() => debugTaskReminderN(notifSeconds))}
                        right={notifSecondsBadge}
                    />
                    <DebugButton
                        label="Test Reminder (kill app)"
                        color={theme.secondary}
                        disabled={busy}
                        onPress={() => runAsync(() => debugTaskReminderN(notifSecondsKilled))}
                        right={notifSecondsKilledBadge}
                    />
                    <DebugButton
                        label="Log Channels & Scheduled"
                        color={theme.secondary}
                        disabled={busy}
                        onPress={() => runAsync(logScheduledN)}
                    />
                    <Text style={[styles.hint, { color: theme.placeholder }]}>
                        Sets a real reminder on the open task with the longest text. Check: label
                        as title (over 25 chars → first 20 + ...), label color, text cut at 200
                        chars; it shows in Reminders › Upcoming, then moves to Past; tapping it
                        opens that task. For the kill-app test, swipe the app away before it
                        fires, then tap the notification (cold start).
                    </Text>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* JSON data in full screen modals */}
                    <DebugButton
                        label="Show 'Rate App - JSON' Modal"
                        color={theme.gray}
                        onPress={showRateAppJsonModal}
                    />
                    <DebugButton
                        label="Show 'Notif Reminder - JSON' Modal"
                        color={theme.gray}
                        onPress={showNotifReminderJsonModal}
                    />

                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    selectorIcon: {
        marginRight: 10,
    },
    selectorText: {
        fontSize: 17,
        flex: 1,
        fontWeight: "500",
    },
    body: {
        gap: 6,
        marginVertical: 8,
        marginHorizontal: 4,
    },

    // Action row + right-side indicators
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "500",
    },

    // Rounded status badge (e.g. test-reminder delay)
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 36,
        alignItems: "center",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },

    divider: {
        width: "100%",
        height: StyleSheet.hairlineWidth,
        marginVertical: 4,
    },

    hint: {
        fontSize: 11,
        lineHeight: 16,
        marginTop: 2,
        marginHorizontal: 4,
    },

    // Share button for JSON viewer
    shareBtn: {
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 8,
    },
    shareBtnText: {
        fontSize: 13,
        fontWeight: "600",
    },
});

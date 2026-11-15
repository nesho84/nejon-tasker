import { openUpdateAvailableModal } from "@/components/CheckForUpdate";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { previewNotifReminderModal, previewRateAppModal, showNotifReminderJsonModal, showRateAppJsonModal } from "./debugModals";
import { debugTaskReminderN, logScheduledN } from "./debugNotifs";
import { clearAllData, seedDummyData } from "./debugSeed";
import { UpdatePreview, useDebugStore } from "./debugStore";
import {
    AutoModalHead,
    Badge,
    CHECK_FAILED_HINT,
    DebugButton,
    DebugSection,
    DebugToggle,
    NOTIF_REMINDER_HINT,
    RATE_APP_HINT,
    SEED_HINT,
    TEST_REMINDER_HINT,
    TEST_REMINDER_KILLED_HINT,
    UP_TO_DATE_HINT,
    UPDATE_LAUNCH_HINT,
    UPDATE_MODAL_HINT,
} from "./debugUi";

interface DebugPanelProps {
    status: string;
    onStatusPress: () => void;
}

// Debug Tools box (About screen) — status badge on its top border, header toggles the grouped sections
export default function DebugPanel({ status, onStatusPress }: DebugPanelProps) {
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

    // Main component
    return (
        <View style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.danger + "40" }]}>
            {/* Status badge — sits on the top border (page background cuts the line); taps count toward deactivating */}
            <View style={styles.statusWrap} pointerEvents="box-none">
                <TouchableOpacity activeOpacity={0.6} hitSlop={8} onPress={onStatusPress}>
                    <Text style={[styles.statusBadge, { color: theme.placeholder, borderColor: theme.danger, backgroundColor: theme.bgAlt }]}>
                        {status}
                    </Text>
                </TouchableOpacity>
            </View>

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

                    {/* App: onboarding + check-for-update previews (modal + the two inline status lines) */}
                    <DebugSection title="App">
                        <DebugButton
                            label="Show Onboarding Screen"
                            color={theme.info}
                            onPress={() => useOnboardingStore.getState().setOnboarding(false)}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DebugButton
                            label="Show 'Update available' Modal"
                            color={theme.green}
                            hint={UPDATE_MODAL_HINT}
                            onPress={openUpdateAvailableModal}
                        />
                        <DebugToggle
                            label="Toggle 'Up to date' line"
                            color={theme.green}
                            value={updatePreview === "upToDate"}
                            hint={UP_TO_DATE_HINT}
                            onPress={() => togglePreview("upToDate")}
                        />
                        <DebugToggle
                            label="Toggle 'Check failed' line"
                            color={theme.green}
                            value={updatePreview === "error"}
                            hint={CHECK_FAILED_HINT}
                            onPress={() => togglePreview("error")}
                        />
                        <DebugToggle
                            label="Toggle 'Update available' On Launch"
                            color={theme.green}
                            value={forceUpdateOnLaunch}
                            hint={UPDATE_LAUNCH_HINT}
                            onPress={toggleUpdateOnLaunch}
                        />
                    </DebugSection>

                    {/* Auto modals — one card, a block per modal */}
                    <DebugSection title="Auto Modals">
                        <AutoModalHead title="Rate App" hint={RATE_APP_HINT} />
                        <DebugButton
                            label="Show 'Rate App' Modal"
                            color={theme.teal}
                            onPress={previewRateAppModal}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DebugButton
                            label="Show 'Rate App' JSON"
                            color={theme.gray}
                            onPress={showRateAppJsonModal}
                        />

                        <View style={[styles.blockSeparator, { backgroundColor: theme.surface }]} />

                        <AutoModalHead title="Notif Reminder" hint={NOTIF_REMINDER_HINT} />
                        <DebugButton
                            label="Show 'Notif Reminder' Modal"
                            color={theme.teal}
                            onPress={previewNotifReminderModal}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DebugButton
                            label="Show 'Notif Reminder' JSON"
                            color={theme.gray}
                            onPress={showNotifReminderJsonModal}
                        />
                    </DebugSection>

                    {/* Data tools */}
                    <DebugSection title="Data">
                        <DebugButton
                            label="Seed dummy data"
                            color={theme.danger}
                            disabled={busy}
                            hint={SEED_HINT}
                            onPress={() => runAsync(seedDummyData)}
                            right={busy ? <ActivityIndicator size="small" color={theme.text2} /> : undefined}
                        />
                        <DebugButton
                            label="Clear all data"
                            color={theme.danger}
                            disabled={busy}
                            onPress={confirmClearAlert}
                        />
                    </DebugSection>

                    {/* Test notifications */}
                    <DebugSection title="Notifications">
                        <DebugButton
                            label="Test Reminder on a Task"
                            color={theme.secondary}
                            disabled={busy}
                            hint={TEST_REMINDER_HINT}
                            onPress={() => runAsync(() => debugTaskReminderN(notifSeconds))}
                            right={notifSecondsBadge}
                        />
                        <DebugButton
                            label="Test Reminder (kill app)"
                            color={theme.secondary}
                            disabled={busy}
                            hint={TEST_REMINDER_KILLED_HINT}
                            onPress={() => runAsync(() => debugTaskReminderN(notifSecondsKilled))}
                            right={notifSecondsKilledBadge}
                        />
                        <DebugButton
                            label="Log Channels & Scheduled"
                            color={theme.secondary}
                            disabled={busy}
                            onPress={() => runAsync(logScheduledN)}
                        />
                    </DebugSection>

                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Own bordered box — paddingTop leaves room for the badge that overlaps the top border
    box: {
        marginHorizontal: 14,
        marginTop: 14,
        borderWidth: 1,
        borderRadius: 16,
        padding: 8,
        paddingTop: 22,
    },
    statusWrap: {
        position: "absolute",
        top: -13,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    statusBadge: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        fontSize: 12,
        fontWeight: "500",
        includeFontPadding: false,
        overflow: "hidden",
    },
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
        gap: 16,
        marginTop: 16,
        marginBottom: 6,
    },

    blockSeparator: {
        height: 3,
        marginHorizontal: -8,
        marginVertical: 6,
    },

    divider: {
        width: "100%",
        height: StyleSheet.hairlineWidth,
        marginVertical: 4,
    },
});

import { useOnboardingStore } from "@/store/onboardingStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { previewNotifReminderModal, previewStoreReviewModal, previewStoreUpdateModal, showAutoModalsJsonModal } from "./debugModals";
import { debugTaskReminderN, showScheduledNJsonModal } from "./debugNotifs";
import { clearAllData, seedDummyData } from "./debugSeed";
import { StoreUpdatePreview, useDebugStore } from "./debugStore";
import {
    Badge,
    CHECK_FAILED_HINT,
    DebugButton,
    DebugSection,
    DebugToggle,
    NOTIF_REMINDER_HINT,
    STORE_REVIEW_HINT,
    SEED_HINT,
    STORE_UPDATE_HINT,
    STORE_UPDATE_LAUNCH_HINT,
    TEST_REMINDER_HINT,
    TEST_REMINDER_KILLED_HINT,
    UP_TO_DATE_HINT,
} from "./debugUi";

interface DebugPanelProps {
    status: string;
    onStatusPress: () => void;
}

// Debug Tools box (About screen) — status badge on its top border, header toggles the grouped sections
export default function DebugPanel({ status, onStatusPress }: DebugPanelProps) {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const storeUpdatePreview = useDebugStore((state) => state.storeUpdatePreview);
    const setStoreUpdatePreview = useDebugStore((state) => state.setStoreUpdatePreview);
    const forceStoreUpdateOnLaunch = useDebugStore((state) => state.forceStoreUpdateOnLaunch);
    const toggleStoreUpdateOnLaunch = useDebugStore((state) => state.toggleStoreUpdateOnLaunch);
    const expanded = useDebugStore((state) => state.debugPanelExpanded);
    const toggleDebugPanel = useDebugStore((state) => state.toggleDebugPanel);

    // Local state
    const [busy, setBusy] = useState(false);

    // Toggle a check-for-update status preview on/off (back to "idle")
    const togglePreview = (value: StoreUpdatePreview) => setStoreUpdatePreview(storeUpdatePreview === value ? "idle" : value);

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
                style={[styles.selector, { backgroundColor: theme.danger + "15" }]}
                activeOpacity={0.7}
                onPress={toggleDebugPanel}
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

                    {/* App: onboarding */}
                    <DebugSection title="App">
                        <DebugButton
                            label="Show Onboarding Screen"
                            color={theme.info}
                            onPress={() => useOnboardingStore.getState().setOnboarding(false)}
                        />
                    </DebugSection>

                    {/* Store Update: Settings "Check for update" status lines + update on launch */}
                    <DebugSection title="Store Update">
                        <DebugToggle
                            label="Toggle 'Up to date' line"
                            color={theme.green}
                            value={storeUpdatePreview === "upToDate"}
                            hint={UP_TO_DATE_HINT}
                            onPress={() => togglePreview("upToDate")}
                        />
                        <DebugToggle
                            label="Toggle 'Check failed' line"
                            color={theme.green}
                            value={storeUpdatePreview === "error"}
                            hint={CHECK_FAILED_HINT}
                            onPress={() => togglePreview("error")}
                        />
                        <DebugToggle
                            label="Toggle 'Update available' On Launch"
                            color={theme.green}
                            value={forceStoreUpdateOnLaunch}
                            hint={STORE_UPDATE_LAUNCH_HINT}
                            onPress={toggleStoreUpdateOnLaunch}
                        />
                    </DebugSection>

                    {/* Auto modals — a preview per modal, one JSON for their shared store */}
                    <DebugSection title="Auto Modals">
                        <DebugButton
                            label="Show 'Store Update' Modal"
                            color={theme.violet}
                            hint={STORE_UPDATE_HINT}
                            onPress={previewStoreUpdateModal}
                        />
                        <DebugButton
                            label="Show 'Notif Reminder' Modal"
                            color={theme.violet}
                            hint={NOTIF_REMINDER_HINT}
                            onPress={previewNotifReminderModal}
                        />
                        <DebugButton
                            label="Show 'Store Review' Modal"
                            color={theme.violet}
                            hint={STORE_REVIEW_HINT}
                            onPress={previewStoreReviewModal}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DebugButton
                            label="Show 'Auto Modals' JSON"
                            color={theme.gray}
                            onPress={showAutoModalsJsonModal}
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
                            color={theme.orange}
                            disabled={busy}
                            hint={TEST_REMINDER_HINT}
                            onPress={() => runAsync(() => debugTaskReminderN(notifSeconds))}
                            right={notifSecondsBadge}
                        />
                        <DebugButton
                            label="Test Reminder (kill app)"
                            color={theme.orange}
                            disabled={busy}
                            hint={TEST_REMINDER_KILLED_HINT}
                            onPress={() => runAsync(() => debugTaskReminderN(notifSecondsKilled))}
                            right={notifSecondsKilledBadge}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DebugButton
                            label="Show 'Scheduled Notifications' JSON"
                            color={theme.gray}
                            disabled={busy}
                            onPress={() => runAsync(showScheduledNJsonModal)}
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
        borderWidth: 1,
        borderRadius: 16,
        padding: 8,
        paddingHorizontal: 10,
        paddingTop: 24,
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
        paddingVertical: 6,
        borderRadius: 8,
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
    },

    divider: {
        width: "100%",
        height: StyleSheet.hairlineWidth,
        marginVertical: 4,
    },
});

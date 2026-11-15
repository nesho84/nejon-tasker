import { openUpdateAvailableModal } from "@/components/CheckForUpdate";
import { NOTIF_REMINDER_MAX_SHOWS, showNotifReminderModal } from "@/components/NotifReminder";
import { RATE_APP_MAX_SHOWS, showRateAppModal } from "@/components/RateApp";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useModalStore } from "@/store/modalStore";
import { useNotifReminderStore } from "@/store/notifReminderStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRateAppStore } from "@/store/rateAppStore";
import { useThemeStore } from "@/store/themeStore";
import { shareText } from "@/utils/system";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { ReactNode, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { debugTaskReminderN, logScheduledN } from "./debugNotifs";
import { clearAllData, seedDummyData } from "./debugSeed";
import { UpdatePreview, useDebugStore } from "./debugStore";

interface ButtonProps {
    label: string;
    color: string;
    right?: ReactNode;
    hint?: string;
    disabled?: boolean;
    onPress: () => void;
}

interface ToggleProps {
    label: string;
    color?: string;
    value: boolean;
    hint?: string;
    onPress: () => void;
}

interface BadgeProps {
    label: string;
    color: string;
    bg: string;
}

interface InfoButtonProps {
    active: boolean;
    onPress: () => void;
}

interface HintProps {
    text: string;
}

interface SectionProps {
    title: string;
    children: ReactNode;
}

interface ModalHeadProps {
    title: string;
    hint: string;
}

interface JsonViewerProps {
    title: string;
    json: string;
}

interface DebugPanelProps {
    status: string;
    onStatusPress: () => void;
}

// How scenario-based features really trigger — shown under their ⓘ
const UPDATE_MODAL_HINT =
    "Auto (release builds only): checked once on every app start. Google Play (In-App Updates) only answers " +
    "when the app was installed from Play. A newer store version → this modal on every start until updated " +
    "(\"Later\" isn't remembered). OTA updates download and reload silently — no modal. " +
    "Also opens from Settings → \"Check for update\" when one is found. Here it just opens.";
const UPDATE_LAUNCH_HINT =
    "When ON, the \"Update available\" modal opens on the next app start, like a real store update would. " +
    "Stays ON across restarts until you turn it off (or debug mode is turned off).";
const UP_TO_DATE_HINT =
    "Shows the green line under Settings → \"Check for update\" without a real check, until the app restarts. " +
    "Real: shown after a manual check finds no newer store version.";
const CHECK_FAILED_HINT =
    "Shows the red line under Settings → \"Check for update\" without a real check, until the app restarts. " +
    "Real: shown when a manual check runs offline, or Play can't answer (e.g. the app wasn't installed from Play).";
const SEED_HINT =
    "Seeding wipes existing data first, then generates a large set (~16 labels, hundreds of tasks), " +
    "including one label with a long name and some tasks with very long text.";
const TEST_REMINDER_HINT =
    "Sets a real reminder on the open task with the longest text. Check: label as title (over 25 chars → " +
    "first 20 + ...), label color, text cut at 200 chars; it shows in Reminders › Upcoming, then moves to Past; " +
    "tapping it opens that task.";
const TEST_REMINDER_KILLED_HINT =
    "Same reminder, with time to swipe the app away before it fires — then tap the notification (cold start).";

// How the two auto modals work — shown under their ⓘ
const RATE_APP_HINT =
    "First show (Android only): the first time a 3rd task gets checked in one day — can already happen on day one.\n" +
    "\"Later\" → asks again 7 days later, at the next such moment.\n" +
    "Never again: \"Open Store\", \"Already rated\", or after 3 shows.\n" +
    "Waits while another modal is open.\n" +
    "From About: always opens; only \"Open Store\" / \"Already rated\" are recorded.\n" +
    "Here: counts like a real show and skips the waits — when blocked, you get a Reset.";
const NOTIF_REMINDER_HINT =
    "First show: on an app start 3+ days after the app first saw notifications turned off.\n" +
    "\"Not now\" or \"Enable\" → asks again 7 days later, then 14 days later (on an app start).\n" +
    "Never again: after 3 shows — starts over once notifications are allowed and later turned off again.\n" +
    "Waits while another modal is open.\n" +
    "Here: counts like a real show and skips the waits — when blocked, you get a Reset.";

// ------------------------------------------------------------
// Small rounded status badge (ON/OFF state, test-reminder delay)
// ------------------------------------------------------------
function Badge({ label, color, bg }: BadgeProps) {
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );
}

// ------------------------------------------------------------
// ⓘ button that toggles a hint
// ------------------------------------------------------------
function InfoButton({ active, onPress }: InfoButtonProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <TouchableOpacity
            style={[styles.infoButton, active && { backgroundColor: theme.pressed }]}
            activeOpacity={0.6}
            hitSlop={8}
            onPress={onPress}
        >
            <MaterialDesignIcons name="information-outline" size={18} color={theme.muted} />
        </TouchableOpacity>
    );
}

// ------------------------------------------------------------
// Explanation shown under a row or auto-modal title
// ------------------------------------------------------------
function Hint({ text }: HintProps) {
    const theme = useThemeStore((state) => state.theme);
    return <Text style={[styles.hint, { color: theme.danger, backgroundColor: theme.overlayLight }]}>{text}</Text>;
}

// ------------------------------------------------------------
// Reusable debug row — label on the left, optional ⓘ hint and
// value/indicator (e.g. a spinner) on the right
// ------------------------------------------------------------
function DebugButton({ label, color, right, hint, disabled, onPress }: ButtonProps) {
    const theme = useThemeStore((state) => state.theme);
    const [showHint, setShowHint] = useState(false);
    return (
        <>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.overlayLight }]}
                activeOpacity={0.6}
                disabled={disabled}
                onPress={onPress}
            >
                <Text style={[styles.buttonText, { color }]}>{label}</Text>
                <View style={styles.buttonRight}>
                    {hint && <InfoButton active={showHint} onPress={() => setShowHint((v) => !v)} />}
                    {right}
                </View>
            </TouchableOpacity>
            {hint && showHint && <Hint text={hint} />}
        </>
    );
}

// ------------------------------------------------------------
// Debug row with an ON / OFF state badge
// ------------------------------------------------------------
function DebugToggle({ label, color, value, hint, onPress }: ToggleProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <DebugButton
            label={label}
            color={color ?? theme.info}
            hint={hint}
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
// Feature section — uppercase heading + one card holding its rows
// ------------------------------------------------------------
function DebugSection({ title, children }: SectionProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primaryAlt }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.bgAlt, borderColor: theme.border }]}>{children}</View>
        </View>
    );
}

// ------------------------------------------------------------
// Auto-modal title with an ⓘ that shows how it works
// ------------------------------------------------------------
function AutoModalHead({ title, hint }: ModalHeadProps) {
    const theme = useThemeStore((state) => state.theme);
    const [showHint, setShowHint] = useState(false);
    return (
        <>
            <View style={styles.modalHead}>
                <Text style={[styles.modalTitle, { color: theme.text2 }]}>{title}</Text>
                <InfoButton active={showHint} onPress={() => setShowHint((v) => !v)} />
            </View>
            {showHint && <Hint text={hint} />}
        </>
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

// Timestamp → readable date for the JSON viewers
const formatTime = (time: number | null) => (time ? new Date(time).toLocaleString("en-GB") : null);

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

    // ------------------------------------------------------------
    // Auto modals — the same three parts each: JSON, preview, reset.
    // Previews count like a real show and skip the waits; a block gets an alert with Reset.
    // ------------------------------------------------------------
    const showRateAppJsonModal = () => {
        const { rateAppNextShowAt, rateAppShownAt, rateAppShownCount, rateAppDone } = useRateAppStore.getState();
        showJsonViewerModal("Rate App", {
            rateAppNextShowAt: formatTime(rateAppNextShowAt),
            rateAppShownAt: formatTime(rateAppShownAt),
            rateAppShownCount,
            rateAppDone,
        });
    };
    const resetRateApp = () => {
        useRateAppStore.setState({ rateAppNextShowAt: null, rateAppShownAt: null, rateAppShownCount: 0, rateAppDone: false });
    };
    const previewRateAppModal = () => {
        const { rateAppShownCount, rateAppDone } = useRateAppStore.getState();

        if (rateAppDone) {
            const blockedReason = rateAppShownCount >= RATE_APP_MAX_SHOWS
                ? `Limit reached (${rateAppShownCount}/${RATE_APP_MAX_SHOWS}) — the real modal never shows again.`
                : `"Open Store" or "Already rated" was tapped — the real modal never shows again.`;
            Alert.alert("Rate App", blockedReason, [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", onPress: resetRateApp },
            ]);
            return;
        }
        showRateAppModal();
    };

    const showNotifReminderJsonModal = () => {
        const { notifReminderNextShowAt, notifReminderShownAt, notifReminderShownCount, notifReminderDone } = useNotifReminderStore.getState();
        showJsonViewerModal("Notif Reminder", {
            notificationPermission: useDeviceSettingsStore.getState().notificationPermission,
            notifReminderNextShowAt: formatTime(notifReminderNextShowAt),
            notifReminderShownAt: formatTime(notifReminderShownAt),
            notifReminderShownCount,
            notifReminderDone,
        });
    };
    const resetNotifReminder = () => {
        useNotifReminderStore.setState({ notifReminderNextShowAt: null, notifReminderShownAt: null, notifReminderShownCount: 0, notifReminderDone: false });
    };
    const previewNotifReminderModal = () => {
        const { notifReminderShownCount, notifReminderDone } = useNotifReminderStore.getState();

        if (notifReminderDone) {
            Alert.alert("Notif Reminder", `Limit reached (${notifReminderShownCount}/${NOTIF_REMINDER_MAX_SHOWS}) — the real reminder won't show again until notifications are granted and turned off again.`, [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", onPress: resetNotifReminder },
            ]);
            return;
        }
        showNotifReminderModal();
    };

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

    // Feature section
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        opacity: 0.8,
        paddingHorizontal: 4,
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        gap: 6,
        overflow: "hidden",
    },

    // Auto-modal block
    modalHead: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 6,
        paddingRight: 2,
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    infoButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    hint: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 12,
        lineHeight: 17,
    },
    blockSeparator: {
        height: 3,
        marginHorizontal: -8,
        marginVertical: 6,
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
        flexShrink: 1,
        fontSize: 13,
        fontWeight: "500",
    },
    buttonRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginLeft: 8,
    },

    // Rounded status badge (ON/OFF, test-reminder delay)
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

import { useModalStore } from "@/store/modalStore";
import { useThemeStore } from "@/store/themeStore";
import { shareText } from "@/utils/system";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { ReactNode, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

// How scenario-based features really trigger — shown under their ⓘ
export const UPDATE_MODAL_HINT =
    "Auto (release builds only): checked once on every app start. Google Play (In-App Updates) only answers " +
    "when the app was installed from Play. A newer store version → this modal on every start until updated " +
    "(\"Later\" isn't remembered). OTA updates download and reload silently — no modal. " +
    "Also opens from Settings → \"Check for update\" when one is found. Here it just opens.";
export const UPDATE_LAUNCH_HINT =
    "When ON, the \"Update available\" modal opens on the next app start, like a real store update would. " +
    "Stays ON across restarts until you turn it off (or debug mode is turned off).";
export const UP_TO_DATE_HINT =
    "Shows the green line under Settings → \"Check for update\" without a real check, until the app restarts. " +
    "Real: shown after a manual check finds no newer store version.";
export const CHECK_FAILED_HINT =
    "Shows the red line under Settings → \"Check for update\" without a real check, until the app restarts. " +
    "Real: shown when a manual check runs offline, or Play can't answer (e.g. the app wasn't installed from Play).";
export const SEED_HINT =
    "Seeding wipes existing data first, then generates a large set (~16 labels, hundreds of tasks), " +
    "including one label with a long name and some tasks with very long text. " +
    "About a quarter of the tasks come checked with today's date — so Rate App's \"3rd task today\" can't fire after seeding.";
export const TEST_REMINDER_HINT =
    "Sets a real reminder on the open task with the longest text. Check: label as title (over 25 chars → " +
    "first 20 + ...), label color, text cut at 200 chars; it shows in Reminders › Upcoming, then moves to Past; " +
    "tapping it opens that task.";
export const TEST_REMINDER_KILLED_HINT =
    "Same reminder, with time to swipe the app away before it fires — then tap the notification (cold start).";

// How the two auto modals work — shown under their ⓘ
export const RATE_APP_HINT =
    "First show (Android only): the first time a 3rd task gets checked in one day — can already happen on day one. " +
    "Fires only at exactly 3: every task checked today counts (edited or seeded ones too), and past 3 it waits for the next day.\n" +
    "\"Later\" → asks again 7 days later, at the next such moment.\n" +
    "Never again: \"Open Store\", \"Already rated\", or after 3 shows.\n" +
    "Waits while another modal is open.\n" +
    "From About: always opens; only \"Open Store\" / \"Already rated\" are recorded.\n" +
    "Here: counts like a real show and skips the waits — when blocked, you get a Reset.";
export const NOTIF_REMINDER_HINT =
    "First show: on an app start 3+ days after the app first saw notifications turned off.\n" +
    "\"Not now\" or \"Enable\" → asks again 7 days later, then 14 days later (on an app start).\n" +
    "Never again: after 3 shows — starts over once notifications are allowed and later turned off again.\n" +
    "Waits while another modal is open.\n" +
    "Here: counts like a real show and skips the waits — when blocked, you get a Reset.";

// ------------------------------------------------------------
// Small rounded status badge (ON/OFF state, test-reminder delay)
// ------------------------------------------------------------
export function Badge({ label, color, bg }: BadgeProps) {
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
export function DebugButton({ label, color, right, hint, disabled, onPress }: ButtonProps) {
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
export function DebugToggle({ label, color, value, hint, onPress }: ToggleProps) {
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
export function DebugSection({ title, children }: SectionProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.muted }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.bgAlt, borderColor: theme.border }]}>{children}</View>
        </View>
    );
}

// ------------------------------------------------------------
// Auto-modal title with an ⓘ that shows how it works
// ------------------------------------------------------------
export function AutoModalHead({ title, hint }: ModalHeadProps) {
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
export const showJsonViewerModal = (title: string, data: object) =>
    useModalStore.getState().show({
        type: "fullscreen",
        showCloseIcon: true,
        title,
        component: <JsonViewer title={title} json={JSON.stringify(data, null, 2)} />,
    });

const styles = StyleSheet.create({
    // Feature section
    section: {
        gap: 6,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
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

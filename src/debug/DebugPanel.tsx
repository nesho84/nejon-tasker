import { useOnboardingStore } from "@/store/onboardingStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { debugChannelsAndScheduled, testTaskReminder } from "./notificationsTests";
import { clearAllData, seedDummyData } from "./seedData";

interface DebugButtonProps {
    label: string;
    color: string;
    right?: ReactNode;
    disabled?: boolean;
    onPress: () => void;
}

interface PillProps {
    label: string;
    color: string;
    bg: string;
}

// Delay before the test reminder fires (shown as a badge on the button)
const TEST_DELAY_SECONDS = 10;

// ------------------------------------------------------------
// Small rounded status badge (e.g. the test-reminder delay)
// ------------------------------------------------------------
function Pill({ label, color, bg }: PillProps) {
    return (
        <View style={[styles.pill, { backgroundColor: bg }]}>
            <Text style={[styles.pillText, { color }]}>{label}</Text>
        </View>
    );
}

// ------------------------------------------------------------
// Reusable debug row — label on the left, optional
// value/indicator (e.g. a spinner) on the right
// ------------------------------------------------------------
function DebugButton({ label, color, right, disabled, onPress }: DebugButtonProps) {
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

// Renders the debug controls only — the containing card + "Debug Tools"
// title live in the Settings screen, so it matches the other setting cards.
export default function DebugPanel() {
    // Stores
    const theme = useThemeStore((state) => state.theme);

    // Local state
    const [expanded, setExpanded] = useState(false);
    const [busy, setBusy] = useState(false);

    // ------------------------------------------------------------
    // Run an async action with a busy spinner and error handling
    // ------------------------------------------------------------
    const run = async (fn: () => Promise<void>) => {
        if (busy) return;
        setBusy(true);
        try {
            await fn();
        } catch (err) {
            console.error("[DebugPanel] action failed:", err);
            Alert.alert("Seed error", err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    };

    // ------------------------------------------------------------
    // Confirm before clearing all data
    // ------------------------------------------------------------
    const confirmClear = () => {
        Alert.alert(
            "Clear all data?",
            "This permanently deletes every label and task from the database.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear all", style: "destructive", onPress: () => run(clearAllData) },
            ],
        );
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
                <MaterialCommunityIcons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={theme.danger}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.body}>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    {/* Onboarding */}
                    <DebugButton
                        label="Show Onboarding Screen"
                        color={theme.info}
                        onPress={() => useOnboardingStore.getState().setOnboarding(false)}
                    />

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    {/* Data tools */}
                    <DebugButton
                        label="Seed dummy data"
                        color={theme.success}
                        disabled={busy}
                        onPress={() => run(seedDummyData)}
                        right={busy ? <ActivityIndicator size="small" color={theme.text2} /> : undefined}
                    />
                    <DebugButton
                        label="Clear all data"
                        color={theme.danger}
                        disabled={busy}
                        onPress={confirmClear}
                    />
                    <Text style={[styles.hint, { color: theme.placeholder }]}>
                        Seeding wipes existing data first, then generates a large set
                        (~16 labels, hundreds of tasks — checked, favorites, reminders,
                        deleted items) for scroll/perf testing. Tune counts in seedData.ts.
                    </Text>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    {/* Test notifications */}
                    <DebugButton
                        label="Test Reminder"
                        color={theme.warning}
                        disabled={busy}
                        onPress={() => run(() => testTaskReminder(TEST_DELAY_SECONDS))}
                        right={<Pill label={`${TEST_DELAY_SECONDS}s`} color={theme.placeholder} bg={theme.divider} />}
                    />
                    {/* Channels & scheduled dump */}
                    <DebugButton
                        label="Debug Channels & Scheduled"
                        color={theme.secondary}
                        disabled={busy}
                        onPress={() => run(debugChannelsAndScheduled)}
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
        // backgroundColor: "red",
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
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 36,
        alignItems: "center",
    },
    pillText: {
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
});

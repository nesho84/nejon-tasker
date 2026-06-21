import { useOnboardingStore } from "@/store/onboardingStore";
import { useThemeStore } from "@/store/themeStore";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { clearAllData, seedDummyData } from "./seedData";

export default function DebugPanel() {
    const theme = useThemeStore((state) => state.theme);

    const [expanded, setExpanded] = useState(false);
    const [busy, setBusy] = useState(false);

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

    return (
        <View style={[styles.container, { borderColor: theme.danger }]}>
            {/* Toggle header */}
            <TouchableOpacity style={styles.header} activeOpacity={0.6} onPress={() => setExpanded((v) => !v)}>
                <Text style={[styles.headerText, { color: theme.placeholder }]}>
                    {expanded ? "▼" : "▶"} Debug
                </Text>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.body}>
                    {/* Show Onboarding */}
                    <TouchableOpacity
                        style={[styles.button, { borderColor: theme.border }]}
                        activeOpacity={0.6}
                        disabled={busy}
                        onPress={() => useOnboardingStore.getState().setOnboarding(false)}
                    >
                        <Text style={[styles.buttonText, { color: theme.info }]}>Show Onboarding</Text>
                    </TouchableOpacity>

                    {/* Seed dummy data */}
                    <TouchableOpacity
                        style={[styles.button, { borderColor: theme.border }]}
                        activeOpacity={0.6}
                        disabled={busy}
                        onPress={() => run(seedDummyData)}
                    >
                        <Text style={[styles.buttonText, { color: theme.success }]}>Seed dummy data</Text>
                        {busy && <ActivityIndicator size="small" color={theme.text2} />}
                    </TouchableOpacity>

                    {/* Clear all data */}
                    <TouchableOpacity
                        style={[styles.button, { borderColor: theme.border }]}
                        activeOpacity={0.6}
                        disabled={busy}
                        onPress={confirmClear}
                    >
                        <Text style={[styles.buttonText, { color: theme.danger }]}>Clear all data</Text>
                    </TouchableOpacity>

                    <Text style={[styles.hint, { color: theme.muted }]}>
                        Seeding wipes existing data first, then generates a large set
                        (~16 labels, hundreds of tasks — checked, favorites, reminders,
                        deleted items) for scroll/perf testing. Tune counts in seedData.ts.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        borderWidth: 1,
        borderRadius: 8,
    },
    header: {
        padding: 10,
    },
    headerText: {
        fontSize: 14,
        fontWeight: "700",
    },
    body: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        gap: 6,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "500",
    },
    hint: {
        fontSize: 11,
        lineHeight: 16,
        marginTop: 2,
    },
});

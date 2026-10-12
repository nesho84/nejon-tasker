import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import PermissionWarning from "@/components/PermissionWarning";
import TaskFilterBar from "@/components/TaskFilterBar";
import TaskItem from "@/components/TaskItem";
import { globalStyles, HIT_SLOP_5 } from "@/constants/styles";
import { useTaskFilter } from "@/hooks/useTaskFilter";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ReminderTab = 'upcoming' | 'past';

// How often the Upcoming/Past split is re-evaluated while the screen is open
const NOW_TICK_MS = 30_000;

export default function RemindersScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom + 8;

    // Local State
    const [isReady, setIsReady] = useState(false);
    const [tab, setTab] = useState<ReminderTab>('upcoming');
    const [now, setNow] = useState(() => Date.now());

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const isLoading = useTaskStore((state) => state.isLoading);
    // Filter tasks
    const reminderTasks = useMemo(() => {
        return allTasks.filter(t => t.reminderDateTime && t.reminderId && !t.isDeleted);
    }, [allTasks]);

    // Upcoming (soonest first) vs Past (fired — newest first)
    const upcomingTasks = useMemo(() => {
        return reminderTasks
            .filter(t => new Date(t.reminderDateTime ?? 0).getTime() > now)
            .sort((a, b) => (a.reminderDateTime ?? "").localeCompare(b.reminderDateTime ?? ""));
    }, [reminderTasks, now]);
    const pastTasks = useMemo(() => {
        return reminderTasks
            .filter(t => new Date(t.reminderDateTime ?? 0).getTime() <= now)
            .sort((a, b) => (b.reminderDateTime ?? "").localeCompare(a.reminderDateTime ?? ""));
    }, [reminderTasks, now]);

    // Search + label filter on the active tab
    const tabTasks = tab === 'upcoming' ? upcomingTasks : pastTasks;
    const filter = useTaskFilter(tabTasks);

    // ------------------------------------------------------------
    // Wait for instant navigation
    // ------------------------------------------------------------
    useEffect(() => {
        requestAnimationFrame(() => setIsReady(true));
    }, []);

    // ------------------------------------------------------------
    // Re-check the clock so fired reminders move to Past live
    // ------------------------------------------------------------
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), NOW_TICK_MS);
        return () => clearInterval(interval);
    }, []);

    // Loading state
    if (!isReady || isLoading) {
        return <AppLoading />;
    }

    // Tabs: Upcoming | Past with counts
    const tabs: { key: ReminderTab; title: string; count: number }[] = [
        { key: 'upcoming', title: tr.labels.upcoming, count: upcomingTasks.length },
        { key: 'past', title: tr.labels.past, count: pastTasks.length },
    ];

    return (
        <SafeAreaView
            style={[globalStyles.listContainer, { backgroundColor: theme.bgAlt }]}
            edges={['left', 'right']}
        >
            {reminderTasks.length > 0 && (
                <TaskFilterBar
                    query={filter.query}
                    onQueryChange={filter.setQuery}
                    chipLabels={filter.chipLabels}
                    selectedLabelId={filter.selectedLabelId}
                    onSelectLabel={filter.setSelectedLabelId}
                >
                    {/* Warning banner when notifications are disabled */}
                    <PermissionWarning permission="notifications" />

                    {/* Upcoming | Past — selected tab inverted, like the "All" chip */}
                    <View style={[styles.tabs, { backgroundColor: theme.iconBg2 }]}>
                        {tabs.map((t) => {
                            const selected = tab === t.key;
                            return (
                                <Pressable
                                    key={t.key}
                                    style={[styles.tab, selected && { backgroundColor: theme.text }]}
                                    onPress={() => setTab(t.key)}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected }}
                                >
                                    <Text
                                        style={[styles.tabText, { color: selected ? theme.bg : theme.muted }]}
                                        numberOfLines={1}
                                    >
                                        {t.title}
                                    </Text>
                                    <Text style={[styles.tabCount, { color: selected ? theme.bg : theme.muted }]}>
                                        {t.count}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </TaskFilterBar>
            )}

            <FlatList
                data={filter.filteredTasks}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.navigate({
                            pathname: '/editTask',
                            params: { labelId: item.labelId, taskId: item.id },
                        })}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.7}
                        hitSlop={HIT_SLOP_5}
                    >
                        <TaskItem
                            task={item}
                            softDeleteAction={true}
                            cancelReminderAction={true}
                            labelTag={true}
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingTop: reminderTasks.length > 0 ? 0 : 8, paddingBottom: bottomInset }}
                ListEmptyComponent={<AppEmpty type={tabTasks.length > 0 ? "search" : "reminder"} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tabs: {
        flexDirection: "row",
        marginHorizontal: 6,
        padding: 3,
        borderRadius: 10,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 32,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 6,
    },
    tabText: {
        flexShrink: 1,
        fontSize: 14,
        fontWeight: "600",
    },
    tabCount: {
        fontSize: 12,
        fontWeight: "500",
    },
});

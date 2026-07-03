import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import NotificationsBanner from "@/components/NotificationsBanner";
import TaskItem from "@/components/TaskItem";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function RemindersScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = 8;
    const bottomInset = insets.bottom + 8;

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const isLoading = useTaskStore((state) => state.isLoading);
    // Filter tasks
    const reminderTasks = useMemo(() => {
        return allTasks.filter(t => t.reminderDateTime && t.reminderId && !t.isDeleted);
    }, [allTasks]);

    // Local State
    const [isReady, setIsReady] = useState(false);

    // ------------------------------------------------------------
    // Wait for instant navigation
    // ------------------------------------------------------------
    useEffect(() => {
        requestAnimationFrame(() => setIsReady(true));
    }, []);

    // Loading state
    if (!isReady || isLoading) {
        return <AppLoading />;
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.bgAlt }]}
            edges={['left', 'right']}
        >
            {/* Warning banner when notifications are disabled */}
            <NotificationsBanner show={reminderTasks.length > 0} />

            <FlatList
                data={reminderTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        softDeleteAction={true}
                        cancelReminderAction={true}
                        shareAction={true}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ flexGrow: 1, paddingTop: topInset, paddingBottom: bottomInset }}
                ListEmptyComponent={<AppEmpty type="reminder" />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -6,
    },
});
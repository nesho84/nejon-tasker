import AppLoading from "@/components/AppLoading";
import TaskItem from "@/components/tasks/TaskItem";
import useNotifications from "@/hooks/useNotifications";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function RemindersScreen() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    // Filter tasks
    const reminderTasks = useMemo(() => {
        return allTasks.filter(t => t.reminderDateTime && t.reminderId && !t.isDeleted);
    }, [allTasks]);

    // Notifications hook
    const { notificationsEnabled } = useNotifications();

    // Local State
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            style={[styles.container, { backgroundColor: theme.backgroundAlt }]}
            edges={['bottom']}
        >
            {/* Warning banner when notifications are disabled */}
            {reminderTasks.length > 0 && !notificationsEnabled && (
                <TouchableOpacity
                    onPress={() => Linking.openSettings()}
                    activeOpacity={0.8}
                    style={[styles.warningBanner, { backgroundColor: theme.danger }]}
                >
                    <MaterialCommunityIcons name="alert-circle" color="#fff" size={20} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.warningTitle}>Notifications are off</Text>
                        <Text style={styles.warningSubtitle}>Tap to enable in settings</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" color="#fff" size={20} />
                </TouchableOpacity>
            )}

            <FlatList
                data={reminderTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        shareAction={true}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -6,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 12,
        marginHorizontal: 8,
        marginTop: 20,
        borderRadius: 8,
    },
    warningTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    warningSubtitle: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.9,
        marginTop: 2,
    },
});
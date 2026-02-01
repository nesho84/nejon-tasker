import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import TaskItem from "@/components/tasks/TaskItem";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrashScreen() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    // Filter tasks
    const deletedTasks = useMemo(() => {
        return allTasks.filter(t => t.isDeleted);
    }, [allTasks]);

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
            style={[styles.container, { backgroundColor: theme.bgAlt }]}
            edges={['bottom']}
        >
            <FlatList
                data={deletedTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        restoreAction={true}
                        hardDeleteAction={true}
                        shareAction={true}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ flexGrow: 1, paddingVertical: 8 }}
                ListEmptyComponent={<AppEmpty type="trash" />}
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


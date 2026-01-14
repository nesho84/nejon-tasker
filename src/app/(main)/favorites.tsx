import AppLoading from "@/components/AppLoading";
import TaskItem from "@/components/tasks/TaskItem";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    // Filter tasks
    const favoriteTasks = useMemo(() => {
        return allTasks.filter(t => !t.isDeleted && t.isFavorite)
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
            style={[styles.container, { backgroundColor: theme.backgroundAlt }]}
            edges={['bottom']}
        >
            <FlatList
                data={favoriteTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        favoriteAction={true}
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
});


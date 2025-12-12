import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { useMemo } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
    const { theme } = useThemeStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    // Filter tasks
    const favoriteTasks = useMemo(() => {
        return allTasks.filter(t => !t.isDeleted && t.isFavorite);
    }, [allTasks]);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.backgroundAlt }]}
            edges={['bottom']}
        >
            <FlatList
                data={favoriteTasks}
                renderItem={({ item }) => (
                    <TaskCard
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


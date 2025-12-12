import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { useMemo } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrashScreen() {
    const { theme } = useThemeStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    // Filter tasks
    const deletedTasks = useMemo(() => {
        return allTasks.filter(t => t.isDeleted);
    }, [allTasks]);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.backgroundAlt }]}
            edges={['bottom']}
        >
            <FlatList
                data={deletedTasks}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        restoreAction={true}
                        hardDeleteAction={true}
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


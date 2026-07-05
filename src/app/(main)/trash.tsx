import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import TaskItem from "@/components/TaskItem";
import { globalStyles } from "@/constants/styles";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrashScreen() {
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
    const deletedTasks = useMemo(() => {
        return allTasks.filter(t => t.isDeleted);
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
            style={[globalStyles.listContainer, { backgroundColor: theme.bgAlt }]}
            edges={['left', 'right']}
        >
            <FlatList
                data={deletedTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        restoreAction={true}
                        hardDeleteAction={true}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ flexGrow: 1, paddingTop: topInset, paddingBottom: bottomInset }}
                ListEmptyComponent={<AppEmpty type="trash" />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({})

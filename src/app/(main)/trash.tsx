import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import TaskFilterBar from "@/components/TaskFilterBar";
import TaskItem from "@/components/TaskItem";
import { globalStyles } from "@/constants/styles";
import { useTaskFilter } from "@/hooks/useTaskFilter";
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
    const bottomInset = insets.bottom + 8;

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const isLoading = useTaskStore((state) => state.isLoading);
    // Filter tasks — most recently deleted first
    const deletedTasks = useMemo(() => {
        return allTasks
            .filter(t => t.isDeleted)
            .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));
    }, [allTasks]);

    // Search + label filter
    const filter = useTaskFilter(deletedTasks);
    const hasTasks = deletedTasks.length > 0;

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
            {/* Search + label chips */}
            {hasTasks && (
                <TaskFilterBar
                    query={filter.query}
                    onQueryChange={filter.setQuery}
                    chipLabels={filter.chipLabels}
                    selectedLabelId={filter.selectedLabelId}
                    onSelectLabel={filter.setSelectedLabelId}
                />
            )}

            <FlatList
                data={filter.filteredTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        restoreAction={true}
                        hardDeleteAction={true}
                        labelTag={true}
                    />
                )}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingTop: hasTasks ? 0 : 8, paddingBottom: bottomInset }}
                ListEmptyComponent={<AppEmpty type={hasTasks ? "search" : "trash"} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({})

import AppEmpty from "@/components/AppEmpty";
import AppLoading from "@/components/AppLoading";
import TaskFilterBar from "@/components/TaskFilterBar";
import TaskItem from "@/components/TaskItem";
import { globalStyles, HIT_SLOP_5 } from "@/constants/styles";
import { useTaskFilter } from "@/hooks/useTaskFilter";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom + 8;

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const isLoading = useTaskStore((state) => state.isLoading);
    // Filter tasks
    const favoriteTasks = useMemo(() => {
        return allTasks.filter(t => !t.isDeleted && t.isFavorite)
    }, [allTasks]);

    // Search + label filter
    const filter = useTaskFilter(favoriteTasks);
    const hasTasks = favoriteTasks.length > 0;

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
                            favoriteAction={true}
                            softDeleteAction={true}
                            labelTag={true}
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingTop: hasTasks ? 0 : 8, paddingBottom: bottomInset }}
                ListEmptyComponent={<AppEmpty type={hasTasks ? "search" : "favorite"} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({})

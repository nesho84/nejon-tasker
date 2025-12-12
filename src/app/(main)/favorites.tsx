import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { shareText } from "@/utils/utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
    const { theme } = useThemeStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const toggleFavorite = useTaskStore((state) => state.toggleFavorite);
    // Filter tasks
    const favoriteTasks = useMemo(() => allTasks.filter(t => !t.isDeleted && t.isFavorite), [allTasks]);

    // Toggle task favorite
    const handleFavoriteTask = async (task: Task) => {
        await toggleFavorite(task.id);
    };

    const RenderTask = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            topRightContent={
                <TouchableOpacity
                    onPress={() => handleFavoriteTask(item)}
                    delayPressIn={0}
                    delayPressOut={0}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="star" size={24} color={theme.muted} />
                </TouchableOpacity>
            }
            bottomContent={
                <>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons
                            name={item.reminderId ? "notifications" : "notifications-off"}
                            color={item.reminderId ? theme.success : theme.muted}
                            size={16}
                        />

                        {item.reminderDateTime && (
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '500',
                                    color: theme.success,
                                }}
                            >
                                {dates.format(item.reminderDateTime)}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => shareText("My Favorite Task", item.text)}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="share-social" size={16} color={theme.muted} />
                    </TouchableOpacity>

                    <Text style={{ color: theme.muted, fontSize: 11 }}>
                        {dates.format(item.updatedAt)}
                    </Text>
                </>
            }
        />
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.backgroundAlt }]}
            edges={['bottom']}
        >
            <FlatList
                data={favoriteTasks}
                renderItem={RenderTask}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


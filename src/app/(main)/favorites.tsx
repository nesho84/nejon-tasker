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
    const favoriteTasks = useMemo(() => {
        return allTasks.filter(t => !t.isDeleted && t.isFavorite);
    }, [allTasks]);
    const toggleFavorite = useTaskStore((state) => state.toggleFavorite);

    const renderItem = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            topRightContent={
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                    <MaterialCommunityIcons name="star" size={22} color={theme.muted} />
                </TouchableOpacity>
            }
            bottomContent={
                <>
                    <View style={styles.reminderContainer}>
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

                    <TouchableOpacity activeOpacity={0.7} onPress={() => shareText("My Favorite Task", item.text)}>
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
            style={[styles.container, { backgroundColor: theme.background }]}
            edges={['bottom']}
        >
            <FlatList
                data={favoriteTasks}
                renderItem={renderItem}
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
    reminderContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
});


import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { shareText } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function RemindersScreen() {
    const { theme } = useThemeStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    // Filter tasks
    const reminderTasks = useMemo(() => allTasks.filter(t => t.reminderDateTime && t.reminderId && !t.isDeleted), [allTasks]);

    const renderItem = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            bottomContent={
                <>
                    <View style={styles.reminderContainer}>
                        <Ionicons
                            name="notifications"
                            color={theme.success}
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
                        onPress={() => shareText("My Reminder Task", item.text)}
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
                data={reminderTasks}
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
import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from 'react-native';

export default function RemindersScreen() {
    const { theme } = useThemeStore();
    const { reminderTasks } = useTaskStore();

    const renderItem = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            bottomContent={
                <>
                    <Ionicons
                        name="notifications"
                        color={theme.success}
                        size={16}
                    />

                    {item.reminderDateTime && (
                        <Text
                            style={{
                                marginLeft: -120,
                                fontSize: 12,
                                fontWeight: '500',
                                color: theme.success,
                            }}
                        >
                            {dates.format(item.reminderDateTime)}
                        </Text>
                    )}

                    <Text style={{ color: theme.muted, fontSize: 11 }}>
                        {dates.format(item.updatedAt)}
                    </Text>
                </>
            }
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={reminderTasks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
            />
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
    },
};
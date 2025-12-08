import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function RemindersScreen() {
    const { theme } = useThemeStore();
    const { favoriteTasks } = useTaskStore();

    function toggleFavorite(id: string): void {
        Alert.alert("Function not implemented.");
    }

    const renderItem = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            rightActions={
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                    <MaterialCommunityIcons name="star" size={22} color={theme.muted} />
                </TouchableOpacity>
            }
            bottomContent={
                <>
                    <Ionicons
                        name={item.reminderId ? "notifications" : "notifications-off"}
                        color={item.reminderId ? theme.success : theme.muted}
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
                data={favoriteTasks}
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

import TaskCard from "@/components/tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Task } from "@/types/task.types";
import { dates } from "@/utils/dates";
import { shareText } from "@/utils/utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrashScreen() {
    const { theme } = useThemeStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const deletedTasks = useMemo(() => allTasks.filter(t => t.isDeleted), [allTasks]);
    // taskStore actions
    const restoreTask = useTaskStore((state) => state.restoreTask);
    const deleteTask = useTaskStore((state) => state.deleteTask);


    function handleDeleteTask(id: string): void {
        Alert.alert("Function not implemented.");
        // deleteTask(id);
    }

    const renderItem = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            topRightContent={
                <>
                    <TouchableOpacity onPress={() => restoreTask(item.id)}>
                        <MaterialCommunityIcons name="backup-restore" size={22} color={theme.muted} style={{ marginRight: 12 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                        <MaterialCommunityIcons name="close" size={22} color={theme.muted} style={{ marginRight: 3 }} />
                    </TouchableOpacity>
                </>
            }
            bottomContent={
                <>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => shareText("My deleted Task", item.text)}>
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
                data={deletedTasks}
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
});


import TaskCard from "@/components/tasks/TaskCard";
import { useLanguageStore } from "@/store/languageStore";
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
    const { tr } = useLanguageStore();

    // taskStore
    const allTasks = useTaskStore((state) => state.allTasks);
    const restoreTask = useTaskStore((state) => state.restoreTask);
    const deleteTaskPermanently = useTaskStore((state) => state.deleteTaskPermanently);
    // Filter tasks
    const deletedTasks = useMemo(() => allTasks.filter(t => t.isDeleted), [allTasks]);

    // Hard Delete task
    const handleHardDeleteTask = async (id: string) => {
        Alert.alert(
            tr.alerts.deleteTask.title,
            tr.alerts.deleteTask.message,
            [
                {
                    text: tr.buttons.yes,
                    onPress: async () => {
                        await deleteTaskPermanently(id);
                    },
                },
                {
                    text: tr.buttons.no,
                },
            ],
            { cancelable: false }
        );
    };

    const RenderTask = ({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            topRightContent={
                <>
                    <TouchableOpacity
                        onPress={() => restoreTask(item.id)}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="backup-restore" size={23} color={theme.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleHardDeleteTask(item.id)}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="close" size={23} color={theme.muted} />
                    </TouchableOpacity>
                </>
            }
            bottomContent={
                <>
                    <TouchableOpacity
                        onPress={() => shareText("My deleted Task", item.text)}
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
            style={[styles.container, { backgroundColor: theme.background }]}
            edges={['bottom']}
        >
            <FlatList
                data={deletedTasks}
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


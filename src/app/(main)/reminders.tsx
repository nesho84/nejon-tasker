import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function RemindersScreen() {
    const { theme } = useThemeStore();
    const { reminderTasks } = useTaskStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {reminderTasks.length === 0 && (
                <Text style={{ color: theme.text }}>
                    No reminders set.
                </Text>
            )}

            <FlatList
                data={reminderTasks}
                renderItem={({ item }) => (
                    <View>
                        <Text style={{ color: theme.text }}>{item.text}</Text>
                        <Text style={{ color: theme.text }}>Due: {item.reminderDateTime}</Text>
                    </View>
                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function TrashScreen() {
    const { theme } = useThemeStore();
    const { deletedTasks } = useTaskStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {deletedTasks.length === 0 && (
                <Text style={{ color: theme.text }}>
                    No Deleted set.
                </Text>
            )}

            <FlatList
                data={deletedTasks}
                renderItem={({ item }) => (
                    <View>
                        <Text style={{ color: theme.text }}>{item.text}</Text>
                        <Text style={{ color: theme.text }}>Deleted?: {item.isDeleted.toString()}</Text>
                        <Text style={{ color: theme.text }}>Deleted at: {item.deletedAt}</Text>

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
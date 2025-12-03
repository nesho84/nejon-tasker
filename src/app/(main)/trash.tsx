import { useTasks } from "@/hooks/useTasks";
import { useThemeStore } from '@/store/themeStore';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function TrashScreen() {
    const { theme } = useThemeStore();
    const { deletedTasks } = useTasks();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

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
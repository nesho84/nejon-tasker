import { useTasks } from "@/hooks/useTasks";
import { useThemeStore } from '@/store/themeStore';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function FavoritesScreen() {
    const { theme } = useThemeStore();
    const { favoriteTasks } = useTasks();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <FlatList
                data={favoriteTasks}
                renderItem={({ item }) => (
                    <View>
                        <Text style={{ color: theme.text }}>{item.text}</Text>
                        <Text style={{ color: theme.text }}>Favorite?: {item.isFavorite.toString()}</Text>
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